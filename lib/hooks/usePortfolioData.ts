/**
 * Portfolio Data Hooks
 * 
 * High-level hooks that combine state management with calculations
 * Makes it easy for components to access portfolio data
 */

import { useEffect, useMemo, useState } from 'react'
import { usePortfolioStore } from '@/lib/store/portfolioStore'
import { calculateCompletePortfolio, calculatePortfolioMetrics } from '@/lib/utils/portfolioCalculations'
import { Position, Portfolio, LeaderboardEntry } from '@/lib/types/portfolio'
import { INITIAL_PORTFOLIOS } from '@/lib/data/initialPortfolios'
import { useAllPortfolioPrices } from '@/lib/hooks/useLivePrices'

/**
 * Hook to initialize portfolio data with mock/demo data
 */
export function useInitializeDemoData() {
  const { setPortfolios, setLeaderboard, setStocks, portfolios } = usePortfolioStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    console.log('🔄 Initializing portfolios with pre-calculated performance data')
    console.log('🔍 Current portfolios count:', Object.keys(portfolios).length)

    // Only initialize if portfolios are empty
    if (Object.keys(portfolios).length === 0) {
      console.log('📦 Setting initial portfolios and stocks...')
      
      // Set portfolios with pre-calculated performance data
      setPortfolios(INITIAL_PORTFOLIOS)
      
      // Initialize demo stock data with realistic gains/losses vs average prices
      const demoStocks = {
        // Matt's stocks - mix of gains and losses
        'RKLB': { symbol: 'RKLB', price: 32.15, change: 0.85, changePercent: 3.31, lastUpdated: Date.now() }, // +21% vs 26.55
        'AMZN': { symbol: 'AMZN', price: 248.50, change: 2.15, changePercent: 1.01, lastUpdated: Date.now() }, // +15% vs 216.10
        'SOFI': { symbol: 'SOFI', price: 12.90, change: -0.25, changePercent: -1.65, lastUpdated: Date.now() }, // -13.4% vs 14.90
        'ASTS': { symbol: 'ASTS', price: 38.20, change: 1.85, changePercent: 4.62, lastUpdated: Date.now() }, // -8.8% vs 41.91
        'BRK.B': { symbol: 'BRK.B', price: 515.75, change: 3.45, changePercent: 0.71, lastUpdated: Date.now() }, // +5.2% vs 490.23
        'CELH': { symbol: 'CELH', price: 39.80, change: -1.25, changePercent: -2.79, lastUpdated: Date.now() }, // -8.5% vs 43.49
        'OSCR': { symbol: 'OSCR', price: 16.85, change: 0.15, changePercent: 1.01, lastUpdated: Date.now() }, // +12.7% vs 14.95
        'EOG': { symbol: 'EOG', price: 108.65, change: -0.85, changePercent: -0.68, lastUpdated: Date.now() }, // -11.8% vs 123.18
        'BROS': { symbol: 'BROS', price: 82.45, change: 2.15, changePercent: 3.13, lastUpdated: Date.now() }, // +16.4% vs 70.81
        'ABCL': { symbol: 'ABCL', price: 2.85, change: -0.05, changePercent: -1.56, lastUpdated: Date.now() }, // -9.8% vs 3.16
        
        // Amit's stocks - mix of gains and losses
        'PLTR': { symbol: 'PLTR', price: 165.25, change: 2.85, changePercent: 2.06, lastUpdated: Date.now() }, // +16.8% vs 141.41
        'HOOD': { symbol: 'HOOD', price: 68.50, change: -1.25, changePercent: -1.60, lastUpdated: Date.now() }, // -10.7% vs 76.75
        'TSLA': { symbol: 'TSLA', price: 385.75, change: 5.85, changePercent: 1.81, lastUpdated: Date.now() }, // +17.2% vs 329.13
        'AMD': { symbol: 'AMD', price: 115.20, change: -2.15, changePercent: -1.67, lastUpdated: Date.now() }, // -8.8% vs 126.39
        'JPM': { symbol: 'JPM', price: 295.80, change: 1.85, changePercent: 0.69, lastUpdated: Date.now() }, // +9.4% vs 270.36
        'NBIS': { symbol: 'NBIS', price: 42.15, change: 0.95, changePercent: 1.92, lastUpdated: Date.now() }, // -16.5% vs 50.46
        'GRAB': { symbol: 'GRAB', price: 5.35, change: 0.05, changePercent: 1.07, lastUpdated: Date.now() }, // +13.6% vs 4.71
        'AAPL': { symbol: 'AAPL', price: 218.90, change: -1.85, changePercent: -0.92, lastUpdated: Date.now() }, // +10.3% vs 198.42
        'V': { symbol: 'V', price: 380.25, change: 2.25, changePercent: 0.64, lastUpdated: Date.now() }, // +7.0% vs 355.48
        'DUOL': { symbol: 'DUOL', price: 520.35, change: 8.45, changePercent: 1.81, lastUpdated: Date.now() }, // +9.6% vs 474.90
        
        // Steve's stocks - mix of gains and losses
        'META': { symbol: 'META', price: 815.45, change: 12.85, changePercent: 1.87, lastUpdated: Date.now() }, // +16.1% vs 702.12
        'MSTR': { symbol: 'MSTR', price: 298.50, change: -8.45, changePercent: -2.16, lastUpdated: Date.now() }, // -21.9% vs 382.25
        'MSFT': { symbol: 'MSFT', price: 525.80, change: 3.85, changePercent: 0.81, lastUpdated: Date.now() }, // +9.7% vs 479.14
        'HIMS': { symbol: 'HIMS', price: 68.95, change: 1.25, changePercent: 2.13, lastUpdated: Date.now() }, // +15.3% vs 59.78
        'AVGO': { symbol: 'AVGO', price: 218.45, change: -3.85, changePercent: -1.50, lastUpdated: Date.now() }, // -13.3% vs 252.10
        'CRWD': { symbol: 'CRWD', price: 545.80, change: 8.25, changePercent: 1.75, lastUpdated: Date.now() }, // +13.9% vs 479.39
        'NFLX': { symbol: 'NFLX', price: 1385.25, change: 15.85, changePercent: 1.31, lastUpdated: Date.now() }, // +13.0% vs 1225.35
        'CRM': { symbol: 'CRM', price: 298.20, change: -2.45, changePercent: -0.92, lastUpdated: Date.now() }, // +13.0% vs 263.88
        'PYPL': { symbol: 'PYPL', price: 65.85, change: 0.85, changePercent: 1.19, lastUpdated: Date.now() }, // -8.9% vs 72.26
        'MU': { symbol: 'MU', price: 138.50, change: 2.15, changePercent: 1.83, lastUpdated: Date.now() }, // +15.6% vs 119.84
        
        // Tannor's stocks - mix of gains and losses
        'NVDA': { symbol: 'NVDA', price: 168.25, change: 3.25, changePercent: 2.30, lastUpdated: Date.now() }, // +16.3% vs 144.69
        'NU': { symbol: 'NU', price: 10.85, change: -0.15, changePercent: -1.20, lastUpdated: Date.now() }, // -12.4% vs 12.39
        'NOW': { symbol: 'NOW', price: 1155.90, change: 18.45, changePercent: 1.87, lastUpdated: Date.now() }, // +15.0% vs 1005.13
        'MELI': { symbol: 'MELI', price: 2820.45, change: 45.85, changePercent: 1.90, lastUpdated: Date.now() }, // +14.9% vs 2454.76
        'SHOP': { symbol: 'SHOP', price: 95.25, change: 2.85, changePercent: 2.70, lastUpdated: Date.now() }, // -12.1% vs 108.37
        'TTD': { symbol: 'TTD', price: 82.80, change: -1.25, changePercent: -1.75, lastUpdated: Date.now() }, // +17.9% vs 70.25
        'ASML': { symbol: 'ASML', price: 685.50, change: 8.45, changePercent: 1.10, lastUpdated: Date.now() }, // -11.6% vs 775.23
        'APP': { symbol: 'APP', price: 425.85, change: 12.85, changePercent: 3.59, lastUpdated: Date.now() }, // +14.9% vs 370.68
        'COIN': { symbol: 'COIN', price: 298.45, change: -5.85, changePercent: -2.19, lastUpdated: Date.now() }, // +14.1% vs 261.57
        'TSM': { symbol: 'TSM', price: 248.90, change: 3.45, changePercent: 1.62, lastUpdated: Date.now() }, // +15.4% vs 215.68
        
        // Kris's stocks - mix of gains and losses
        'UNH': { symbol: 'UNH', price: 365.85, change: 2.85, changePercent: 0.94, lastUpdated: Date.now() }, // +18.9% vs 307.66
        'GOOGL': { symbol: 'GOOGL', price: 195.50, change: -1.85, changePercent: -1.04, lastUpdated: Date.now() }, // +10.6% vs 176.77
        'MRVL': { symbol: 'MRVL', price: 82.15, change: 1.25, changePercent: 1.81, lastUpdated: Date.now() }, // +16.7% vs 70.42
        'AXON': { symbol: 'AXON', price: 698.25, change: 15.85, changePercent: 2.07, lastUpdated: Date.now() }, // -10.6% vs 780.61
        'ELF': { symbol: 'ELF', price: 108.45, change: -2.15, changePercent: -1.68, lastUpdated: Date.now() }, // -14.1% vs 126.21
        'ORCL': { symbol: 'ORCL', price: 245.80, change: 3.85, changePercent: 1.86, lastUpdated: Date.now() }, // +16.4% vs 211.10
        'CSCO': { symbol: 'CSCO', price: 75.25, change: 0.85, changePercent: 1.31, lastUpdated: Date.now() }, // +14.9% vs 65.51
        'LLY': { symbol: 'LLY', price: 925.50, change: -8.45, changePercent: -1.04, lastUpdated: Date.now() }, // +14.6% vs 807.58
        'NVO': { symbol: 'NVO', price: 68.85, change: 1.25, changePercent: 1.65, lastUpdated: Date.now() }, // -10.6% vs 77.02
        'TTWO': { symbol: 'TTWO', price: 285.90, change: 4.85, changePercent: 2.08, lastUpdated: Date.now() } // +19.9% vs 238.60
      }
      
      console.log('📊 Setting demo stock data for', Object.keys(demoStocks).length, 'symbols')
      setStocks(demoStocks)
      
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
      
      console.log('✅ Set initial portfolios, stocks, and leaderboard with', leaderboard.length, 'entries')
    } else {
      console.log('📦 Portfolios already initialized, skipping initialization')
    }
    
    setIsInitialized(true)

  }, [setPortfolios, setLeaderboard, setStocks, portfolios])

  return isInitialized
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
    portfolios
  } = usePortfolioStore()

  const portfolio = useMemo(() => {
    return getPortfolioByUser(username)
  }, [getPortfolioByUser, username])

  // Consider it loading if:
  // 1. Portfolios are actively loading
  // 2. No portfolios have been loaded yet (initial state)
  const loading = portfoliosLoading || Object.keys(portfolios).length === 0
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
    portfolios,
    stocks,
    performanceSinceDate
  } = usePortfolioStore()

  // Fetch live prices for all portfolio symbols
  const { 
    isLoading: pricesLoading, 
    error: pricesError 
  } = useAllPortfolioPrices(60000) // Refresh every 60 seconds

  const leaderboard = useMemo(() => {
    console.log('🔍 useLeaderboardData - Raw leaderboard length:', rawLeaderboard.length)
    console.log('🔍 useLeaderboardData - Portfolios count:', Object.keys(portfolios).length)
    console.log('🔍 useLeaderboardData - Stocks count:', Object.keys(stocks).length)
    
    // Always generate leaderboard from portfolios with dynamic calculations
    if (Object.keys(portfolios).length > 0 && Object.keys(stocks).length > 0) {
      console.log('🔄 Generating leaderboard with dynamic calculations from portfolios')
      
      const calculatedEntries = Object.values(portfolios).map(portfolio => {
        // Use calculatePortfolioMetrics which properly handles historical prices
        const metrics = calculatePortfolioMetrics({
          positions: portfolio.positions,
          stockPrices: stocks
        })
        
        // Extract historical prices from stock data for use in calculations
        const historicalPrices: Record<string, number> = {}
        portfolio.positions.forEach(position => {
          const stockData = stocks[position.symbol]
          if (stockData?.historicalPrice) {
            historicalPrices[position.symbol] = stockData.historicalPrice
          }
        })
        
        if (Object.keys(historicalPrices).length > 0) {
          console.log(`📊 Using historical prices for ${portfolio.username}:`, Object.keys(historicalPrices).length, 'positions')
        }
        
        // Recalculate with explicit historical prices to ensure they're used
        const metricsWithHistorical = calculatePortfolioMetrics({
          positions: portfolio.positions,
          stockPrices: stocks,
          historicalPrices
        })

        // Use since-date performance if historical prices are available, otherwise total return
        const hasHistoricalPrices = Object.keys(historicalPrices).length > 0
        const sinceDatePercent = metricsWithHistorical.totalSinceDatePercent
        const returnPercent = hasHistoricalPrices && 
                              sinceDatePercent !== undefined && 
                              !isNaN(sinceDatePercent)
          ? sinceDatePercent
          : metricsWithHistorical.totalReturnPercent

        // Find primary stock (largest position by current value)
        let largestPositionValue = 0
        let primaryStock = portfolio.positions[0]?.symbol || 'N/A'
        portfolio.positions.forEach(position => {
          const stockData = stocks[position.symbol]
          const currentPrice = stockData?.price || 0
          const currentValue = position.shares * currentPrice
          if (currentValue > largestPositionValue) {
            largestPositionValue = currentValue
            primaryStock = position.symbol
          }
        })

        // Track sectors
        const sectorCounts: Record<string, number> = {}
        portfolio.positions.forEach(position => {
          if (position.sector) {
            sectorCounts[position.sector] = (sectorCounts[position.sector] || 0) + 1
          }
        })
        const primarySector = Object.entries(sectorCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || portfolio.sector || 'N/A'

        // Calculate tier based on return percentage
        let tier: 'S' | 'A' | 'B' | 'C' = 'C'
        if (returnPercent >= 40) tier = 'S'
        else if (returnPercent >= 30) tier = 'A'
        else if (returnPercent >= 20) tier = 'B'
        else tier = 'C'

        return {
          rank: 0, // Will be set after sorting
          username: portfolio.username,
          return: returnPercent,
          calculatedReturn: returnPercent, // Also set calculatedReturn for compatibility
          tier,
          sector: primarySector,
          primaryStock,
          portfolio: portfolio.positions.map(p => p.symbol),
          totalValue: metricsWithHistorical.totalValue,
          dayChange: metricsWithHistorical.dayChange,
          positions: portfolio.positions
        }
      })
      
      // Sort by return percentage (descending) and assign ranks
      const sortedEntries = calculatedEntries
        .sort((a, b) => b.return - a.return)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))
      
      console.log('✅ Generated leaderboard with dynamic calculations:', sortedEntries.length, 'entries')
      console.log('📊 Using historical prices for', Object.keys(calculatedEntries[0]?.positions || []).length, 'portfolios')
      return sortedEntries
    }
    
    // Fallback to existing logic if no portfolios or stocks
    const sorted = getSortedLeaderboard()
    console.log('🔍 useLeaderboardData - Sorted leaderboard length:', sorted.length)
    
    // If leaderboard is empty but we have portfolios, generate leaderboard from portfolios (old logic)
    if (sorted.length === 0 && Object.keys(portfolios).length > 0) {
      console.log('⚠️ Empty leaderboard but portfolios exist, generating from portfolios (fallback)')
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
  }, [getSortedLeaderboard, rawLeaderboard.length, portfolios, stocks, performanceSinceDate])

  const loading = leaderboardLoading || portfoliosLoading || stocksLoading || pricesLoading
  const error = leaderboardError || pricesError
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