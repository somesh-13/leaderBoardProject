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
import { INITIAL_PORTFOLIOS } from '@/lib/data/initialPortfolios'

/**
 * Hook to initialize portfolio data with mock/demo data
 */
export function useInitializeDemoData() {
  const { setPortfolios, setLeaderboard, portfolios } = usePortfolioStore()

  useEffect(() => {
    console.log('🔄 Initializing portfolios with pre-calculated performance data')
    console.log('🔍 Current portfolios count:', Object.keys(portfolios).length)

    // Only initialize if portfolios are empty
    if (Object.keys(portfolios).length === 0) {
      console.log('📦 Setting initial portfolios...')
      // Set portfolios with pre-calculated performance data
      setPortfolios(INITIAL_PORTFOLIOS)
      
      // Generate leaderboard entries directly from initial portfolios
      const leaderboard = Object.values(INITIAL_PORTFOLIOS)
        .map((portfolio, index) => ({
          rank: index + 1,
          username: portfolio.username,
          return: portfolio.totalReturnPercent,
          tier: portfolio.tier,
          sector: portfolio.sector,
          primaryStock: portfolio.primaryStock,
          portfolio: portfolio.positions.map(p => p.symbol),
          totalValue: portfolio.totalValue,
          dayChange: portfolio.dayChange,
          positions: portfolio.positions
        }))
        .sort((a, b) => b.return - a.return)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))
      
      // Set leaderboard directly
      setLeaderboard(leaderboard)
      
      console.log('✅ Set initial portfolios and leaderboard with', leaderboard.length, 'entries')
    } else {
      console.log('📦 Portfolios already initialized, skipping initialization')
    }

  }, [setPortfolios, setLeaderboard, portfolios])
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
    stocksLoading,
    leaderboard: rawLeaderboard,
    portfolios
  } = usePortfolioStore()

  const leaderboard = useMemo(() => {
    const sorted = getSortedLeaderboard()
    console.log('🔍 useLeaderboardData - Raw leaderboard length:', rawLeaderboard.length)
    console.log('🔍 useLeaderboardData - Sorted leaderboard length:', sorted.length)
    console.log('🔍 useLeaderboardData - Portfolios count:', Object.keys(portfolios).length)
    
    // If leaderboard is empty but we have portfolios, generate leaderboard from portfolios
    if (sorted.length === 0 && Object.keys(portfolios).length > 0) {
      console.log('⚠️ Empty leaderboard but portfolios exist, generating from portfolios')
      const generated = Object.values(portfolios)
        .map((portfolio, index) => ({
          rank: index + 1,
          username: portfolio.username,
          return: portfolio.totalReturnPercent,
          tier: portfolio.tier,
          sector: portfolio.sector,
          primaryStock: portfolio.primaryStock,
          portfolio: portfolio.positions.map(p => p.symbol),
          totalValue: portfolio.totalValue,
          dayChange: portfolio.dayChange,
          positions: portfolio.positions
        }))
        .sort((a, b) => b.return - a.return)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))
      
      return generated
    }
    
    return sorted
  }, [getSortedLeaderboard, rawLeaderboard.length, portfolios])

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