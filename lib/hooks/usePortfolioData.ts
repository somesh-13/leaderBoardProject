/**
 * Portfolio Data Hooks
 * 
 * High-level hooks that combine state management with calculations
 * Makes it easy for components to access portfolio data
 */

import { useEffect, useMemo } from 'react'
import { usePortfolioStore } from '@/lib/store/portfolioStore'
import { calculateCompletePortfolio } from '@/lib/utils/portfolioCalculations'
import { Position, Portfolio, LeaderboardEntry } from '@/lib/types/portfolio'

/**
 * Hook to initialize portfolio data with mock/demo data
 */
export function useInitializeDemoData() {
  const { setPortfolios, fetchStockPrices, refreshLeaderboard } = usePortfolioStore()

  useEffect(() => {
    // Demo portfolio data
    const demoPortfolios = {
      'matt': {
        userId: 'matt',
        username: 'Matt', 
        positions: [
          { symbol: 'RKLB', shares: 100, avgPrice: 12.50, sector: 'Aerospace' },
          { symbol: 'AMZN', shares: 5, avgPrice: 145.00, sector: 'Technology' },
          { symbol: 'SOFI', shares: 200, avgPrice: 7.25, sector: 'Financial' },
          { symbol: 'ASTS', shares: 150, avgPrice: 11.80, sector: 'Aerospace' },
          { symbol: 'BRK.B', shares: 10, avgPrice: 340.00, sector: 'Financial' }
        ],
        totalValue: 0,
        totalInvested: 0,
        totalReturn: 0,
        totalReturnPercent: 45.2,
        dayChange: 0,
        dayChangePercent: 0,
        tier: 'S' as const,
        sector: 'Aerospace',
        primaryStock: 'RKLB',
        lastCalculated: Date.now()
      },
      'amit': {
        userId: 'amit',
        username: 'Amit',
        positions: [
          { symbol: 'PLTR', shares: 50, avgPrice: 120.00, sector: 'Technology' },
          { symbol: 'HOOD', shares: 75, avgPrice: 85.00, sector: 'Financial' },
          { symbol: 'TSLA', shares: 8, avgPrice: 280.00, sector: 'Automotive' },
          { symbol: 'AMD', shares: 25, avgPrice: 140.00, sector: 'Technology' }
        ],
        totalValue: 0,
        totalInvested: 0, 
        totalReturn: 0,
        totalReturnPercent: 42.8,
        dayChange: 0,
        dayChangePercent: 0,
        tier: 'S' as const,
        sector: 'Technology',
        primaryStock: 'PLTR',
        lastCalculated: Date.now()
      },
      'steve': {
        userId: 'steve',
        username: 'Steve',
        positions: [
          { symbol: 'META', shares: 15, avgPrice: 275.00, sector: 'Technology' },
          { symbol: 'MSTR', shares: 12, avgPrice: 160.00, sector: 'Technology' },
          { symbol: 'MSFT', shares: 20, avgPrice: 300.00, sector: 'Technology' },
          { symbol: 'HIMS', shares: 400, avgPrice: 9.50, sector: 'Healthcare' }
        ],
        totalValue: 0,
        totalInvested: 0,
        totalReturn: 0, 
        totalReturnPercent: 38.7,
        dayChange: 0,
        dayChangePercent: 0,
        tier: 'A' as const,
        sector: 'Technology',
        primaryStock: 'META',
        lastCalculated: Date.now()
      },
      'tannor': {
        userId: 'tannor', 
        username: 'Tannor',
        positions: [
          { symbol: 'NVDA', shares: 6, avgPrice: 420.00, sector: 'Technology' },
          { symbol: 'NU', shares: 300, avgPrice: 7.50, sector: 'Financial' },
          { symbol: 'NOW', shares: 4, avgPrice: 520.00, sector: 'Technology' },
          { symbol: 'MELI', shares: 2, avgPrice: 1100.00, sector: 'Technology' }
        ],
        totalValue: 0,
        totalInvested: 0,
        totalReturn: 0,
        totalReturnPercent: 31.5,
        dayChange: 0,
        dayChangePercent: 0,
        tier: 'A' as const,
        sector: 'Technology',
        primaryStock: 'NVDA',
        lastCalculated: Date.now()
      },
      'kris': {
        userId: 'kris',
        username: 'Kris', 
        positions: [
          { symbol: 'UNH', shares: 8, avgPrice: 420.00, sector: 'Healthcare' },
          { symbol: 'GOOGL', shares: 10, avgPrice: 120.00, sector: 'Technology' },
          { symbol: 'MRVL', shares: 50, avgPrice: 52.00, sector: 'Technology' },
          { symbol: 'AXON', shares: 25, avgPrice: 150.00, sector: 'Technology' }
        ],
        totalValue: 0,
        totalInvested: 0,
        totalReturn: 0,
        totalReturnPercent: 28.9,
        dayChange: 0,
        dayChangePercent: 0,
        tier: 'A' as const,
        sector: 'Technology',
        primaryStock: 'UNH',
        lastCalculated: Date.now()
      }
    }

    // Set initial portfolios
    setPortfolios(demoPortfolios)

    // Immediately refresh leaderboard with initial data (before fetching prices)
    refreshLeaderboard()

    // Fetch all unique stock symbols
    const allSymbols = Object.values(demoPortfolios)
      .flatMap(portfolio => portfolio.positions.map(pos => pos.symbol))

    // Fetch stock prices and then refresh leaderboard again with updated prices
    fetchStockPrices(allSymbols).then(() => {
      refreshLeaderboard()
    }).catch((error) => {
      console.error('Failed to fetch stock prices:', error)
      // Even if stock prices fail, we should still have basic leaderboard data
    })

  }, [setPortfolios, fetchStockPrices, refreshLeaderboard])
}

/**
 * Hook to get portfolio data for a specific user
 */
export function useUserPortfolio(username: string): {
  portfolio: Portfolio | undefined
  loading: boolean
  error: string | null
} {
  const { 
    getPortfolioByUser, 
    portfoliosLoading, 
    portfoliosError,
    stocksLoading 
  } = usePortfolioStore()

  const portfolio = useMemo(() => {
    return getPortfolioByUser(username)
  }, [getPortfolioByUser, username])

  const loading = portfoliosLoading || stocksLoading
  const error = portfoliosError

  return { portfolio, loading, error }
}

/**
 * Hook to get calculated leaderboard data
 */
export function useLeaderboardData(): {
  leaderboard: LeaderboardEntry[]
  loading: boolean
  error: string | null
  totalUsers: number
} {
  const {
    getSortedLeaderboard,
    leaderboardLoading,
    leaderboardError,
    portfoliosLoading,
    stocksLoading
  } = usePortfolioStore()

  const leaderboard = useMemo(() => {
    return getSortedLeaderboard()
  }, [getSortedLeaderboard])

  const loading = leaderboardLoading || portfoliosLoading || stocksLoading
  const error = leaderboardError
  const totalUsers = leaderboard.length

  return { leaderboard, loading, error, totalUsers }
}

/**
 * Hook to get all unique symbols from portfolios
 */
export function useAllSymbols(): string[] {
  const { getUniqueSymbols } = usePortfolioStore()
  
  return useMemo(() => {
    return getUniqueSymbols()
  }, [getUniqueSymbols])
}

/**
 * Hook to refresh all data
 */
export function useDataRefresh() {
  const { 
    fetchStockPrices, 
    refreshPortfolios, 
    refreshLeaderboard,
    getUniqueSymbols 
  } = usePortfolioStore()

  const refreshAll = async () => {
    const symbols = getUniqueSymbols()
    await fetchStockPrices(symbols)
    await refreshPortfolios()
    await refreshLeaderboard()
  }

  const refreshStocks = async () => {
    const symbols = getUniqueSymbols()
    await fetchStockPrices(symbols)
  }

  return {
    refreshAll,
    refreshStocks,
    refreshPortfolios,
    refreshLeaderboard
  }
}

/**
 * Hook for portfolio filtering and sorting
 */
export function usePortfolioFilters() {
  const {
    filters,
    sortField,
    sortDirection,
    setFilters,
    setSorting,
    getFilteredLeaderboard
  } = usePortfolioStore()

  const filteredData = useMemo(() => {
    return getFilteredLeaderboard()
  }, [getFilteredLeaderboard])

  return {
    filters,
    sortField,
    sortDirection,
    filteredData,
    setFilters,
    setSorting
  }
}

/**
 * Hook to calculate portfolio metrics in real-time
 */
export function usePortfolioMetrics(positions: Position[]) {
  const { stocks } = usePortfolioStore()

  return useMemo(() => {
    if (!positions.length || !Object.keys(stocks).length) {
      return {
        totalValue: 0,
        totalInvested: 0,
        totalReturn: 0,
        totalReturnPercent: 0,
        dayChange: 0,
        dayChangePercent: 0,
        loading: true
      }
    }

    const portfolio = calculateCompletePortfolio(
      'temp',
      'temp',
      positions,
      stocks
    )

    return {
      totalValue: portfolio.totalValue,
      totalInvested: portfolio.totalInvested, 
      totalReturn: portfolio.totalReturn,
      totalReturnPercent: portfolio.totalReturnPercent,
      dayChange: portfolio.dayChange,
      dayChangePercent: portfolio.dayChangePercent,
      loading: false
    }
  }, [positions, stocks])
}

/**
 * Hook to manage data fetching with automatic retries
 */
export function useAutoRefresh(intervalMs: number = 5 * 60 * 1000) {
  const { refreshAll } = useDataRefresh()

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing portfolio data...')
      refreshAll().catch(error => {
        console.error('❌ Auto-refresh failed:', error)
      })
    }, intervalMs)

    return () => clearInterval(interval)
  }, [refreshAll, intervalMs])
}