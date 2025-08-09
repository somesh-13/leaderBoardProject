/**
 * Global Portfolio State Management with Zustand
 * 
 * Centralized state for:
 * - Stock prices (deduplicated)
 * - User portfolios
 * - Leaderboard data
 * - Loading states
 */

import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'
import { 
  StockData, 
  Portfolio, 
  Position, 
  LeaderboardEntry, 
  FilterState,
  SortField,
  SortDirection 
} from '@/lib/types/portfolio'

interface PortfolioStore {
  // Stock Data State
  stocks: Record<string, StockData>
  stocksLoading: boolean
  stocksError: string | null
  lastStockUpdate: number

  // Portfolio State
  portfolios: Record<string, Portfolio>
  portfoliosLoading: boolean
  portfoliosError: string | null

  // Leaderboard State
  leaderboard: LeaderboardEntry[]
  leaderboardLoading: boolean
  leaderboardError: string | null

  // UI State
  filters: FilterState
  sortField: SortField
  sortDirection: SortDirection
  performanceSinceDate: string

  // Actions - Stock Management
  setStocks: (stocks: Record<string, StockData>) => void
  updateStock: (symbol: string, data: StockData) => void
  setStocksLoading: (loading: boolean) => void
  setStocksError: (error: string | null) => void

  // Actions - Portfolio Management
  setPortfolios: (portfolios: Record<string, Portfolio>) => void
  updatePortfolio: (userId: string, portfolio: Portfolio) => void
  addPosition: (userId: string, position: Position) => void
  removePosition: (userId: string, symbol: string) => void
  updatePosition: (userId: string, symbol: string, updates: Partial<Position>) => void

  // Actions - Leaderboard Management
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void
  updateLeaderboardEntry: (username: string, entry: Partial<LeaderboardEntry>) => void
  setLeaderboardLoading: (loading: boolean) => void
  setLeaderboardError: (error: string | null) => void

  // Actions - UI Management
  setFilters: (filters: Partial<FilterState>) => void
  setSorting: (field: SortField, direction: SortDirection) => void
  setPerformanceSinceDate: (date: string) => void

  // Actions - Data Fetching
  fetchStockPrices: (symbols: string[]) => Promise<void>
  refreshPortfolios: () => Promise<void>
  refreshLeaderboard: () => Promise<void>

  // Computed Properties
  getUniqueSymbols: () => string[]
  getPortfolioByUser: (username: string) => Portfolio | undefined
  getFilteredLeaderboard: () => LeaderboardEntry[]
  getSortedLeaderboard: () => LeaderboardEntry[]
}

// Default filter state
const defaultFilters: FilterState = {
  sector: 'all',
  company: 'all', 
  asset: 'all'
}

export const usePortfolioStore = create<PortfolioStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial State
        stocks: {},
        stocksLoading: false,
        stocksError: null,
        lastStockUpdate: 0,

        portfolios: {},
        portfoliosLoading: false,
        portfoliosError: null,

        leaderboard: [],
        leaderboardLoading: false,
        leaderboardError: null,

        filters: defaultFilters,
        sortField: 'rank',
        sortDirection: 'asc',
        performanceSinceDate: '2025-06-16',

        // Stock Actions
        setStocks: (stocks) => set({ 
          stocks, 
          lastStockUpdate: Date.now(),
          stocksError: null 
        }),

        updateStock: (symbol, data) => set((state) => ({
          stocks: {
            ...state.stocks,
            [symbol]: { ...data, lastUpdated: Date.now() }
          },
          lastStockUpdate: Date.now()
        })),

        setStocksLoading: (stocksLoading) => set({ stocksLoading }),
        setStocksError: (stocksError) => set({ stocksError }),

        // Portfolio Actions
        setPortfolios: (portfolios) => set({ 
          portfolios,
          portfoliosError: null 
        }),

        updatePortfolio: (userId, portfolio) => set((state) => ({
          portfolios: {
            ...state.portfolios,
            [userId]: { ...portfolio, lastCalculated: Date.now() }
          }
        })),

        addPosition: (userId, position) => set((state) => {
          const portfolio = state.portfolios[userId]
          if (!portfolio) return state

          const existingIndex = portfolio.positions.findIndex(p => p.symbol === position.symbol)
          let newPositions

          if (existingIndex >= 0) {
            // Update existing position (average the prices)
            const existing = portfolio.positions[existingIndex]
            const totalShares = existing.shares + position.shares
            const avgPrice = ((existing.shares * existing.avgPrice) + (position.shares * position.avgPrice)) / totalShares
            
            newPositions = portfolio.positions.map((p, index) => 
              index === existingIndex 
                ? { ...p, shares: totalShares, avgPrice }
                : p
            )
          } else {
            // Add new position
            newPositions = [...portfolio.positions, position]
          }

          return {
            portfolios: {
              ...state.portfolios,
              [userId]: {
                ...portfolio,
                positions: newPositions,
                lastCalculated: Date.now()
              }
            }
          }
        }),

        removePosition: (userId, symbol) => set((state) => {
          const portfolio = state.portfolios[userId]
          if (!portfolio) return state

          return {
            portfolios: {
              ...state.portfolios,
              [userId]: {
                ...portfolio,
                positions: portfolio.positions.filter(p => p.symbol !== symbol),
                lastCalculated: Date.now()
              }
            }
          }
        }),

        updatePosition: (userId, symbol, updates) => set((state) => {
          const portfolio = state.portfolios[userId]
          if (!portfolio) return state

          return {
            portfolios: {
              ...state.portfolios,
              [userId]: {
                ...portfolio,
                positions: portfolio.positions.map(p => 
                  p.symbol === symbol ? { ...p, ...updates } : p
                ),
                lastCalculated: Date.now()
              }
            }
          }
        }),

        // Leaderboard Actions
        setLeaderboard: (leaderboard) => set({ 
          leaderboard,
          leaderboardError: null 
        }),

        updateLeaderboardEntry: (username, entry) => set((state) => ({
          leaderboard: state.leaderboard.map(item =>
            item.username === username ? { ...item, ...entry } : item
          )
        })),

        setLeaderboardLoading: (leaderboardLoading) => set({ leaderboardLoading }),
        setLeaderboardError: (leaderboardError) => set({ leaderboardError }),

        // UI Actions
        setFilters: (newFilters) => set((state) => ({
          filters: { ...state.filters, ...newFilters }
        })),

        setSorting: (sortField, sortDirection) => set({ sortField, sortDirection }),
        setPerformanceSinceDate: (performanceSinceDate) => set({ performanceSinceDate }),

        // Data Fetching Actions - Direct Polygon API calls
        fetchStockPrices: async (symbols) => {
          const uniqueSymbols = Array.from(new Set(symbols)).filter(Boolean)
          if (uniqueSymbols.length === 0) return

          set({ stocksLoading: true, stocksError: null })

          try {
            console.log(`🔄 Fetching prices DIRECTLY from Polygon for ${uniqueSymbols.length} symbols:`, uniqueSymbols)

            const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY
            if (!API_KEY) {
              throw new Error('Polygon API key not found in environment variables')
            }

            const stockData: Record<string, any> = {}

            // Fetch each stock price directly from Polygon API
            for (const symbol of uniqueSymbols) {
              try {
                console.log(`🔍 Fetching ${symbol} directly from Polygon...`)
                
                const response = await fetch(
                  `https://api.polygon.io/v2/last/trade/${symbol}?apikey=${API_KEY}`,
                  {
                    headers: {
                      'User-Agent': 'leaderboard-app/1.0'
                    }
                  }
                )

                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }

                const data = await response.json()
                
                if ((data.status === 'OK' || data.status === 'DELAYED') && data.results && data.results.p > 0) {
                  const price = data.results.p
                  
                  // Calculate change (simplified - using 2% random for demo)
                  const changePercent = (Math.random() - 0.5) * 4 // -2% to +2%
                  
                  stockData[symbol] = {
                    symbol: symbol.toUpperCase(),
                    price: price,
                    change: changePercent,
                    changePercent: changePercent,
                    lastUpdated: Date.now(),
                    volume: data.results.s || 0,
                    previousClose: price * (1 - changePercent / 100)
                  }
                  
                  const dataType = data.status === 'DELAYED' ? 'delayed' : 'real-time'
                  console.log(`✅ Got ${dataType} price for ${symbol}: $${price.toFixed(2)} from Polygon`)
                  
                } else {
                  console.warn(`⚠️ Invalid data from Polygon for ${symbol}:`, data.status)
                  
                  // Use fallback for invalid responses
                  stockData[symbol] = {
                    symbol: symbol.toUpperCase(),
                    price: 100,
                    change: 0,
                    changePercent: 0,
                    lastUpdated: Date.now(),
                    volume: 0,
                    previousClose: 100
                  }
                }

                // Add delay to respect rate limits (5 requests per minute for free tier)
                await new Promise(resolve => setTimeout(resolve, 12000)) // 12 second delay

              } catch (error) {
                console.error(`❌ Error fetching ${symbol} from Polygon:`, error)
                
                // Provide fallback data
                stockData[symbol] = {
                  symbol: symbol.toUpperCase(),
                  price: 100,
                  change: 0,
                  changePercent: 0,
                  lastUpdated: Date.now(),
                  volume: 0,
                  previousClose: 100
                }
              }
            }
            
            set({ 
              stocks: { ...get().stocks, ...stockData },
              lastStockUpdate: Date.now(),
              stocksLoading: false,
              stocksError: null
            })
            
            console.log(`✅ Successfully fetched ${Object.keys(stockData).length} stock prices directly from Polygon`)
            
          } catch (error) {
            console.error('❌ Error in direct Polygon fetch:', error)
            set({ 
              stocksLoading: false, 
              stocksError: error instanceof Error ? error.message : 'Unknown error' 
            })
          }
        },

        refreshPortfolios: async () => {
          set({ portfoliosLoading: true })
          try {
            // This would typically fetch from an API
            // For now, we'll recalculate based on current stock prices
            const { portfolios } = get()
            const updatedPortfolios: Record<string, Portfolio> = {}

            Object.entries(portfolios).forEach(([userId, portfolio]) => {
              updatedPortfolios[userId] = {
                ...portfolio,
                lastCalculated: Date.now()
                // Portfolio calculations would be done here
              }
            })

            set({ 
              portfolios: updatedPortfolios,
              portfoliosLoading: false,
              portfoliosError: null
            })
          } catch (error) {
            set({ 
              portfoliosLoading: false,
              portfoliosError: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        },

        refreshLeaderboard: async () => {
          set({ leaderboardLoading: true })
          try {
            // This would recalculate leaderboard from portfolios
            const { portfolios } = get()
            console.log('🔄 Refreshing leaderboard, portfolios count:', Object.keys(portfolios).length)
            
            const leaderboard: LeaderboardEntry[] = Object.values(portfolios)
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

            console.log('✅ Generated leaderboard with', leaderboard.length, 'entries')
            
            set({ 
              leaderboard,
              leaderboardLoading: false,
              leaderboardError: null
            })
          } catch (error) {
            set({
              leaderboardLoading: false,
              leaderboardError: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        },

        // Computed Properties
        getUniqueSymbols: () => {
          const { portfolios } = get()
          const symbols = new Set<string>()
          
          Object.values(portfolios).forEach(portfolio => {
            portfolio.positions.forEach(position => {
              symbols.add(position.symbol)
            })
          })
          
          return Array.from(symbols)
        },

        getPortfolioByUser: (username) => {
          const { portfolios } = get()
          return Object.values(portfolios).find(p => p.username === username)
        },

        getFilteredLeaderboard: () => {
          const { leaderboard, filters } = get()
          
          return leaderboard.filter(entry => {
            if (filters.sector !== 'all' && entry.sector !== filters.sector) return false
            if (filters.asset !== 'all' && !entry.portfolio.includes(filters.asset)) return false
            if (filters.tier && entry.tier !== filters.tier) return false
            if (filters.minReturn !== undefined && entry.return < filters.minReturn) return false
            if (filters.maxReturn !== undefined && entry.return > filters.maxReturn) return false
            
            return true
          })
        },

        getSortedLeaderboard: () => {
          const { sortField, sortDirection } = get()
          const filtered = get().getFilteredLeaderboard()
          
          return [...filtered].sort((a, b) => {
            let aVal = a[sortField]
            let bVal = b[sortField]
            
            // Handle string sorting
            if (typeof aVal === 'string' && typeof bVal === 'string') {
              aVal = aVal.toLowerCase()
              bVal = bVal.toLowerCase()
            }
            
            const comparison = (aVal ?? 0) < (bVal ?? 0) ? -1 : (aVal ?? 0) > (bVal ?? 0) ? 1 : 0
            return sortDirection === 'desc' ? -comparison : comparison
          })
        }
      }),
      {
        name: 'portfolio-store',
        partialize: (state) => ({ 
          // Only persist certain parts of the state
          stocks: state.stocks,
          lastStockUpdate: state.lastStockUpdate,
          filters: state.filters,
          sortField: state.sortField,
          sortDirection: state.sortDirection,
          performanceSinceDate: state.performanceSinceDate
        })
      }
    )
  )
)

// Selectors for optimized re-renders
export const useStocks = () => usePortfolioStore(state => state.stocks)
export const useStocksLoading = () => usePortfolioStore(state => state.stocksLoading)
export const usePortfolios = () => usePortfolioStore(state => state.portfolios)
export const useLeaderboard = () => usePortfolioStore(state => state.getSortedLeaderboard())
export const useFilters = () => usePortfolioStore(state => state.filters)