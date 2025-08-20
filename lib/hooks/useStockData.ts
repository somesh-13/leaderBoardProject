/**
 * Stock Data Hooks with SWR Integration
 * 
 * Provides efficient data fetching with caching and deduplication
 */

import useSWR from 'swr'
import { StockPriceResponse, ApiResponse } from '@/lib/types/portfolio'

// SWR fetcher function
const fetcher = async (url: string, symbols: string[]) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbols })
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data: ApiResponse<StockPriceResponse> = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'API request failed')
  }

  return data.data || {}
}

/**
 * Hook to fetch stock prices with SWR caching
 */
export function useStockPrices(symbols: string[], options: {
  refreshInterval?: number
  dedupingInterval?: number
  revalidateOnFocus?: boolean
} = {}) {
  const {
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    dedupingInterval = 2 * 1000, // 2 seconds
    revalidateOnFocus = true
  } = options

  // Create a stable key for SWR
  const sortedSymbols = Array.from(new Set(symbols)).filter(Boolean).sort()
  const swrKey = sortedSymbols.length > 0 ? ['/api/stock-prices', sortedSymbols] : null

  const {
    data: stockData,
    error,
    isLoading,
    isValidating,
    mutate
  } = useSWR(
    swrKey,
    ([url, symbols]) => fetcher(url as string, symbols as string[]),
    {
      refreshInterval,
      dedupingInterval,
      revalidateOnFocus,
      revalidateOnReconnect: true,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      onError: (error) => {
        console.error('❌ SWR Stock Data Error:', error)
      },
      onSuccess: (data) => {
        console.log(`✅ SWR fetched data for ${Object.keys(data).length} symbols`)
      }
    }
  )

  const refresh = () => mutate()

  return {
    data: stockData || {},
    error,
    isLoading: isLoading || (!stockData && !error),
    isValidating,
    refresh
  }
}

/**
 * Hook to fetch a single stock price
 */
export function useStockPrice(symbol: string) {
  const { data, error, isLoading, refresh } = useStockPrices([symbol])
  
  return {
    data: data[symbol] || null,
    error,
    isLoading,
    refresh
  }
}

/**
 * Hook to fetch portfolio symbols with optimized batching
 */
export function usePortfolioStockPrices(portfolioSymbols: Record<string, string[]>) {
  // Flatten and deduplicate all symbols across portfolios
  const allSymbols = Object.values(portfolioSymbols)
    .flat()
    .filter((symbol, index, array) => array.indexOf(symbol) === index)

  const { data, error, isLoading, isValidating, refresh } = useStockPrices(allSymbols, {
    refreshInterval: 5 * 60 * 1000, // 5 minutes for portfolio data
    revalidateOnFocus: true
  })

  // Map data back to portfolios
  const portfolioData: Record<string, StockPriceResponse> = {}
  Object.entries(portfolioSymbols).forEach(([portfolioId, symbols]) => {
    portfolioData[portfolioId] = {}
    symbols.forEach(symbol => {
      if (data[symbol] && portfolioData[portfolioId]) {
        portfolioData[portfolioId][symbol] = data[symbol]
      }
    })
  })

  return {
    data: portfolioData,
    allStockData: data,
    error,
    isLoading,
    isValidating,
    refresh,
    symbolCount: allSymbols.length
  }
}

/**
 * Hook for real-time stock updates with WebSocket fallback
 */
export function useRealTimeStockData(symbols: string[]) {
  const { data, error, isLoading, refresh } = useStockPrices(symbols, {
    refreshInterval: 30 * 1000, // 30 seconds for real-time feel
    dedupingInterval: 5 * 1000, // 5 second deduping
    revalidateOnFocus: true
  })

  // In the future, this could integrate with WebSocket for true real-time updates
  // For now, it uses aggressive polling

  return {
    data,
    error,
    isLoading,
    refresh,
    lastUpdate: data ? Object.values(data)[0]?.lastUpdated : null
  }
}

/**
 * Hook for stock data with manual control
 */
export function useStockDataManual() {
  const fetchStocks = async (symbols: string[]) => {
    try {
      const uniqueSymbols = Array.from(new Set(symbols)).filter(Boolean)
      if (uniqueSymbols.length === 0) return {}

      return await fetcher('/api/stock-prices', uniqueSymbols)
    } catch (error) {
      console.error('❌ Manual stock fetch error:', error)
      throw error
    }
  }

  return { fetchStocks }
}