/**
 * Live Prices Hook
 * 
 * Automatically fetches and updates stock prices from Polygon API
 * Supports both specific symbols and all portfolio symbols
 * Includes polling for real-time updates and deduplication
 */

import { useEffect, useRef } from 'react'
import { usePortfolioStore } from '@/lib/store/portfolioStore'

export interface UseLivePricesOptions {
  /** Specific symbols to fetch. If empty, fetches all portfolio symbols */
  symbols?: string[]
  /** Polling interval in milliseconds. Default: 60000 (1 minute) */
  intervalMs?: number
  /** Whether to fetch immediately on mount. Default: true */
  fetchOnMount?: boolean
  /** Whether to enable polling. Default: true */
  enablePolling?: boolean
}

// Global cache to prevent duplicate API calls
const pendingRequests = new Map<string, Promise<void>>()
const lastFetchTimes = new Map<string, number>()

/**
 * Hook to automatically fetch and update live stock prices
 * 
 * @param options Configuration options for fetching behavior
 */
export function useLivePrices(options: UseLivePricesOptions = {}) {
  const {
    symbols,
    intervalMs = 60000, // 1 minute default
    fetchOnMount = true,
    enablePolling = true
  } = options

  const fetchPolygonPrices = usePortfolioStore(state => state.fetchPolygonPrices)
  const stocksLoading = usePortfolioStore(state => state.stocksLoading)
  const polygonFetchError = usePortfolioStore(state => state.polygonFetchError)
  const lastPolygonFetchAt = usePortfolioStore(state => state.lastPolygonFetchAt)

  // Use refs to track mounted state and avoid stale closures
  const mountedRef = useRef(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Stable reference to symbols array to avoid unnecessary effect runs
  const symbolsKey = symbols?.join(',') || 'ALL_PORTFOLIO_SYMBOLS'

  const fetchPrices = async () => {
    if (!mountedRef.current) return
    
    // Create a unique key for this request
    const requestKey = symbolsKey
    const now = Date.now()
    
    // Check if we recently fetched this data (within 5 seconds)
    const lastFetch = lastFetchTimes.get(requestKey)
    if (lastFetch && now - lastFetch < 5000) {
      console.log(`⏭️ useLivePrices: Skipping duplicate request for ${symbolsKey} (last fetch ${now - lastFetch}ms ago)`)
      return
    }
    
    // Check if there's already a pending request for these symbols
    const existingRequest = pendingRequests.get(requestKey)
    if (existingRequest) {
      console.log(`⏳ useLivePrices: Waiting for existing request for ${symbolsKey}`)
      await existingRequest
      return
    }
    
    try {
      console.log(`🔄 useLivePrices: Fetching prices for ${symbols?.length || 'all'} symbols`)
      
      // Create and store the promise
      const fetchPromise = fetchPolygonPrices(symbols)
      pendingRequests.set(requestKey, fetchPromise)
      lastFetchTimes.set(requestKey, now)
      
      await fetchPromise
      
      console.log(`✅ useLivePrices: Successfully fetched prices for ${symbolsKey}`)
    } catch (error) {
      console.error('❌ useLivePrices: Failed to fetch prices:', error)
    } finally {
      // Clean up the pending request
      pendingRequests.delete(requestKey)
    }
  }

  useEffect(() => {
    mountedRef.current = true

    // Initial fetch on mount
    if (fetchOnMount) {
      fetchPrices()
    }

    // Set up polling interval
    if (enablePolling && intervalMs > 0) {
      intervalRef.current = setInterval(fetchPrices, intervalMs)
      
      console.log(`⏰ useLivePrices: Started polling every ${intervalMs}ms for symbols: ${symbolsKey}`)
    }

    // Cleanup function
    return () => {
      mountedRef.current = false
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        console.log(`🛑 useLivePrices: Stopped polling for symbols: ${symbolsKey}`)
      }
    }
  }, [symbolsKey, intervalMs, fetchOnMount, enablePolling])

  // Manual refresh function that can be called by components
  const refreshPrices = async () => {
    if (!mountedRef.current) return
    await fetchPrices()
  }

  // Reset interval when options change
  useEffect(() => {
    if (intervalRef.current && enablePolling) {
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(fetchPrices, intervalMs)
    }
  }, [intervalMs])

  return {
    // State
    isLoading: stocksLoading,
    error: polygonFetchError,
    lastFetchAt: lastPolygonFetchAt,
    
    // Actions
    refreshPrices,
    
    // Computed
    isStale: lastPolygonFetchAt > 0 && Date.now() - lastPolygonFetchAt > intervalMs * 2,
    nextFetchIn: lastPolygonFetchAt > 0 ? Math.max(0, intervalMs - (Date.now() - lastPolygonFetchAt)) : 0,
  }
}

/**
 * Hook for fetching prices for all portfolio symbols
 * Convenience wrapper around useLivePrices
 */
export function useAllPortfolioPrices(intervalMs: number = 60000) {
  return useLivePrices({ 
    intervalMs,
    fetchOnMount: true,
    enablePolling: true
  })
}

/**
 * Hook for fetching prices for specific symbols
 * Convenience wrapper around useLivePrices
 */
export function useSymbolPrices(symbols: string[], intervalMs: number = 60000) {
  return useLivePrices({ 
    symbols,
    intervalMs,
    fetchOnMount: true,
    enablePolling: true
  })
}

/**
 * Hook for one-time price fetch without polling
 * Useful for components that only need initial data
 */
export function useFetchPricesOnce(symbols?: string[]) {
  return useLivePrices({
    symbols,
    fetchOnMount: true,
    enablePolling: false
  })
}

/**
 * Hook that provides price fetch status and manual controls
 * Useful for components that want full control over fetching
 */
export function usePriceControls() {
  const fetchPolygonPrices = usePortfolioStore(state => state.fetchPolygonPrices)
  const stocksLoading = usePortfolioStore(state => state.stocksLoading)
  const polygonFetchError = usePortfolioStore(state => state.polygonFetchError)
  const lastPolygonFetchAt = usePortfolioStore(state => state.lastPolygonFetchAt)

  const fetchAllPrices = () => fetchPolygonPrices()
  const fetchSymbolPrices = (symbols: string[]) => fetchPolygonPrices(symbols)

  return {
    // State
    isLoading: stocksLoading,
    error: polygonFetchError,
    lastFetchAt: lastPolygonFetchAt,
    
    // Actions
    fetchAllPrices,
    fetchSymbolPrices,
    
    // Utilities
    formatLastFetch: () => {
      if (!lastPolygonFetchAt) return 'Never'
      const ago = Date.now() - lastPolygonFetchAt
      const minutes = Math.floor(ago / 60000)
      const seconds = Math.floor((ago % 60000) / 1000)
      return minutes > 0 ? `${minutes}m ${seconds}s ago` : `${seconds}s ago`
    }
  }
}