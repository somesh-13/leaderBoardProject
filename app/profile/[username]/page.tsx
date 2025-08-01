'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'
import TierBadge from '@/components/TierBadge'
import { getPriceWithFallback, getMultipleHistoricalPrices, getMultipleDividends } from '@/lib/finnhub'

interface Strategy {
  id: string
  name: string
  type: 'Keltner Channel' | 'Bollinger Bands' | 'Moving Average'
  parameters: string
  return: number
  trades: number
  winRate: number
}

interface PortfolioPosition {
  symbol: string
  shares: number
  avgPrice: number
  currentPrice: number
  historicalPrice?: number | null
  return: number
  performanceSinceDate?: number
  pnl: number
  pnlPct: number
  dividend: number
  dividendPct: number
  totalReturnPct: number
}

interface Portfolio {
  totalValue: number
  dayChange: number
  totalReturn: number
  positions: PortfolioPosition[]
}

type TabType = 'Total Value' | 'Day Change' | 'Total Return'

const leaderboardUsers: Record<string, any> = {
  'Matt': {
    username: 'Matt',
    tier: 'S' as const,
    rank: 1,
    totalReturn: 45.2,
    followers: 1847,
    following: 67,
    sector: 'Technology',
    portfolio: ['RKLB', 'AMZN', 'SOFI', 'ASTS', 'BRK.B', 'CELH', 'OSCR', 'EOG', 'BROS', 'ABCL']
  },
  'Amit': {
    username: 'Amit',
    tier: 'S' as const,
    rank: 2,
    totalReturn: 42.8,
    followers: 1523,
    following: 89,
    sector: 'Technology',
    portfolio: ['PLTR', 'HOOD', 'TSLA', 'AMD', 'JPM', 'NBIS', 'GRAB', 'AAPL', 'V', 'DUOL']
  },
  'Steve': {
    username: 'Steve',
    tier: 'S' as const,
    rank: 3,
    totalReturn: 39.5,
    followers: 1298,
    following: 124,
    sector: 'Technology',
    portfolio: ['META', 'MSTR', 'MSFT', 'HIMS', 'AVGO', 'CRWD', 'NFLX', 'CRM', 'PYPL', 'MU']
  },
  'Tannor': {
    username: 'Tannor',
    tier: 'S' as const,
    rank: 4,
    totalReturn: 37.1,
    followers: 1156,
    following: 98,
    sector: 'Technology',
    portfolio: ['NVDA', 'NU', 'NOW', 'MELI', 'SHOP', 'TTD', 'ASML', 'APP', 'COIN', 'TSM']
  },
  'Kris': {
    username: 'Kris',
    tier: 'S' as const,
    rank: 5,
    totalReturn: 34.7,
    followers: 987,
    following: 145,
    sector: 'Healthcare',
    portfolio: ['UNH', 'GOOGL', 'MRVL', 'AXON', 'ELF', 'ORCL', 'CSCO', 'LLY', 'NVO', 'TTWO']
  },
  'TradeMaster': {
    username: 'TradeMaster',
    tier: 'A' as const,
    rank: 6,
    totalReturn: 22.5,
    followers: 634,
    following: 203,
    sector: 'Technology',
    portfolio: ['AAPL']
  },
  'StockGuru': {
    username: 'StockGuru',
    tier: 'A' as const,
    rank: 7,
    totalReturn: 18.2,
    followers: 456,
    following: 156,
    sector: 'Technology',
    portfolio: ['TSLA']
  },
  'InvestPro': {
    username: 'InvestPro',
    tier: 'A' as const,
    rank: 8,
    totalReturn: 15.7,
    followers: 298,
    following: 187,
    sector: 'Healthcare',
    portfolio: ['JNJ']
  }
}

export default function UserProfile() {
  const params = useParams()
  const username = params.username as string
  const [activeTab, setActiveTab] = useState<'portfolio' | 'strategies' | 'performance'>('portfolio')
  const [activePortfolioTab, setActivePortfolioTab] = useState<TabType>('Total Value')

  const user = useMemo(() => leaderboardUsers[username] || {
    username: username,
    tier: 'C' as const,
    rank: 99,
    totalReturn: 5.2,
    followers: 12,
    following: 45,
    sector: 'Mixed',
    portfolio: ['SPY', 'QQQ', 'BND']
  }, [username])

  const [portfolio, setPortfolio] = useState<Portfolio>({
    totalValue: user.rank <= 5 ? 125450.32 - (user.rank - 1) * 15000 : 67123.45 - (user.rank - 6) * 5000,
    dayChange: user.rank <= 5 ? 2.45 - (user.rank - 1) * 0.5 : 1.23 - (user.rank - 6) * 0.3,
    totalReturn: user.totalReturn,
    positions: []
  })
  
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [performanceSinceDate, setPerformanceSinceDate] = useState(() => {
    // Default to June 16, 2025 (Monday - valid trading day) for demo purposes
    return '2025-06-16'
  })
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false)
  const [isLoadingDividends, setIsLoadingDividends] = useState(false)

  useEffect(() => {
    const fetchPortfolioPrices = async () => {
      if (!user.portfolio || user.portfolio.length === 0) {
        setIsLoadingPrices(false)
        return
      }
      
      setIsLoadingPrices(true)
      
      try {
        const positions = await Promise.all(
          user.portfolio.map(async (symbol: string) => {
            const { price } = await getPriceWithFallback(symbol)
            // Use deterministic values based on symbol to avoid infinite loops
            const shares = 50 + (symbol.charCodeAt(0) % 100)
            const avgPrice = price * (0.85 + (symbol.charCodeAt(1) % 30) / 100)
            const returnPct = ((price - avgPrice) / avgPrice) * 100
            
            return {
              symbol,
              shares,
              avgPrice: Number(avgPrice.toFixed(2)),
              currentPrice: price,
              return: Number(returnPct.toFixed(2))
            }
          })
        )

        setPortfolio(prev => ({
          ...prev,
          positions
        }))
      } catch (error) {
        console.error('Error fetching portfolio prices:', error)
      } finally {
        setIsLoadingPrices(false)
      }
    }

    fetchPortfolioPrices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  // Fetch historical prices and dividends when date changes
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!user.portfolio || user.portfolio.length === 0 || portfolio.positions.length === 0) {
        return
      }
      
      setIsLoadingHistorical(true)
      setIsLoadingDividends(true)
      
      try {
        const [historicalPrices, dividends] = await Promise.all([
          getMultipleHistoricalPrices(user.portfolio, performanceSinceDate),
          getMultipleDividends(user.portfolio, performanceSinceDate, new Date().toISOString().split('T')[0])
        ])
        
        setPortfolio(prev => ({
          ...prev,
          positions: prev.positions.map(position => {
            const historicalPrice = historicalPrices[position.symbol]
            const dividend = dividends[position.symbol] || 0
            
            // Calculate P&L metrics
            const pnl = historicalPrice ? position.currentPrice - historicalPrice : 0
            const pnlPct = historicalPrice ? ((position.currentPrice - historicalPrice) / historicalPrice) * 100 : 0
            const dividendPct = historicalPrice ? (dividend / historicalPrice) * 100 : 0
            const totalReturnPct = pnlPct + dividendPct
              
            return {
              ...position,
              historicalPrice,
              performanceSinceDate: pnlPct,
              pnl,
              pnlPct,
              dividend,
              dividendPct,
              totalReturnPct
            }
          })
        }))
      } catch (error) {
        console.error('Error fetching historical data:', error)
      } finally {
        setIsLoadingHistorical(false)
        setIsLoadingDividends(false)
      }
    }

    if (portfolio.positions.length > 0) {
      fetchHistoricalData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performanceSinceDate, portfolio.positions.length])

  // Calculate portfolio totals with equal $1,000 positions
  const calculatePortfolioTotals = useCallback(() => {
    if (portfolio.positions.length === 0) {
      return {
        initialTotal: 0,
        finalTotal: 0,
        portfolioPL: 0,
        portfolioReturnPct: 0
      }
    }

    let initialTotal = 0
    let finalTotal = 0

    portfolio.positions.forEach(position => {
      if (position.historicalPrice && position.historicalPrice > 0) {
        const investment = 1000 // $1,000 per stock
        const shares = investment / position.historicalPrice
        const finalValue = shares * position.currentPrice
        
        initialTotal += investment
        finalTotal += finalValue
      }
    })

    const portfolioPL = finalTotal - initialTotal
    const portfolioReturnPct = initialTotal > 0 ? (portfolioPL / initialTotal) * 100 : 0

    return {
      initialTotal,
      finalTotal,
      portfolioPL,
      portfolioReturnPct
    }
  }, [portfolio.positions])

  const portfolioTotals = calculatePortfolioTotals()

  const mockStrategies: Strategy[] = [
    {
      id: '1',
      name: user.rank === 1 ? 'Tech Momentum' : user.rank === 2 ? 'Growth Focus' : 'Conservative Blend',
      type: 'Keltner Channel',
      parameters: '20-day EMA, 2x ATR',
      return: user.totalReturn * 0.7,
      trades: user.rank === 1 ? 45 : user.rank === 2 ? 38 : 22,
      winRate: user.rank === 1 ? 67 : user.rank === 2 ? 64 : 58
    },
    {
      id: '2', 
      name: user.rank === 1 ? 'Value Oscillator' : user.rank === 2 ? 'Trend Rider' : 'Safe Haven',
      type: 'Bollinger Bands',
      parameters: '20-day SMA, 2x std dev',
      return: user.totalReturn * 0.4,
      trades: user.rank === 1 ? 32 : user.rank === 2 ? 28 : 18,
      winRate: user.rank === 1 ? 72 : user.rank === 2 ? 69 : 61
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="card text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.username.charAt(0)}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{user.username}</h1>
            <TierBadge tier={user.tier} className="mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Rank #{user.rank} • {user.totalReturn}% Annual Return
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {user.followers.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {user.following}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Following</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button className="btn-primary w-full">Follow</button>
              <button className="btn-secondary w-full">Invest in Strategy</button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'portfolio', name: 'Portfolio' },
                { id: 'strategies', name: 'Strategies' },
                { id: 'performance', name: 'Performance' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              {/* Portfolio Summary Tabs */}
              <div className="card">
                <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                  <nav className="-mb-px flex space-x-8">
                    {(['Total Value', 'Day Change', 'Total Return'] as TabType[]).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActivePortfolioTab(tab)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activePortfolioTab === tab
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </nav>
                </div>
                
                {/* Tab Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activePortfolioTab === 'Total Value' && (
                    <>
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Current Portfolio Value
                        </h3>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          ${portfolioTotals.finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Total Positions
                        </h3>
                        <p className="text-3xl font-bold">
                          {portfolio.positions.length}
                        </p>
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Total Return Percentage
                        </h3>
                        <p className={`text-3xl font-bold ${
                          portfolioTotals.portfolioReturnPct >= 0 ? 'text-gain' : 'text-loss'
                        }`}>
                          {portfolioTotals.portfolioReturnPct >= 0 ? '+' : ''}{portfolioTotals.portfolioReturnPct.toFixed(2)}%
                        </p>
                      </div>
                    </>
                  )}
                  
                  {activePortfolioTab === 'Day Change' && (
                    <>
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Daily Change
                        </h3>
                        <p className={`text-3xl font-bold ${
                          portfolio.dayChange >= 0 ? 'text-gain' : 'text-loss'
                        }`}>
                          {portfolio.dayChange >= 0 ? '+' : ''}{portfolio.dayChange.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Daily P&L
                        </h3>
                        <p className={`text-3xl font-bold ${
                          portfolio.dayChange >= 0 ? 'text-gain' : 'text-loss'
                        }`}>
                          ${((portfolio.totalValue * portfolio.dayChange) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Best Performer
                        </h3>
                        <p className="text-lg font-bold text-gain">
                          {portfolio.positions.length > 0 ? portfolio.positions[0].symbol : 'N/A'}
                        </p>
                      </div>
                    </>
                  )}
                  
                  {activePortfolioTab === 'Total Return' && (
                    <>
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Total Return Since {new Date(performanceSinceDate).toLocaleDateString()}
                        </h3>
                        <p className={`text-3xl font-bold ${
                          portfolio.totalReturn >= 0 ? 'text-gain' : 'text-loss'
                        }`}>
                          {portfolio.totalReturn >= 0 ? '+' : ''}{portfolio.totalReturn.toFixed(2)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Total Dividends
                        </h3>
                        <p className="text-3xl font-bold text-green-600">
                          ${portfolio.positions.reduce((sum, pos) => sum + (pos.dividend || 0), 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Capital Gains
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                          ${portfolio.positions.reduce((sum, pos) => sum + (pos.pnl || 0), 0).toFixed(2)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <h3 className="text-lg font-semibold">Positions</h3>
                  <div className="flex items-center gap-2">
                    <label htmlFor="performanceDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Performance Since:
                    </label>
                    <input
                      id="performanceDate"
                      type="date"
                      value={performanceSinceDate}
                      onChange={(e) => setPerformanceSinceDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {isLoadingHistorical && (
                      <div className="text-xs text-gray-500">Loading...</div>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Stock Symbol</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">{new Date(performanceSinceDate + 'T00:00:00').toLocaleDateString()} Closing Price</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString()} Current Price</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">P&L</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">P&L %</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Dividend</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Dividend %</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">Total Return %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingPrices ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-500 dark:text-gray-400">
                            Loading portfolio data...
                          </td>
                        </tr>
                      ) : (
                        portfolio.positions
                          .filter(position => {
                            if (activePortfolioTab === 'Total Value') return true
                            if (activePortfolioTab === 'Day Change') return position.return !== 0
                            if (activePortfolioTab === 'Total Return') return position.totalReturnPct !== undefined
                            return true
                          })
                          .map((position) => (
                          <tr key={position.symbol} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <td className="py-3 px-2 font-medium text-blue-600 dark:text-blue-400">
                              {position.symbol}
                            </td>
                            <td className="py-3 px-2 text-right font-mono text-sm">
                              {position.historicalPrice ? (
                                `$${position.historicalPrice.toFixed(2)}`
                              ) : (
                                <span className="text-gray-400 text-xs">
                                  {isLoadingHistorical ? 'Loading...' : 'N/A'}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-right font-mono text-sm font-medium">
                              ${position.currentPrice.toFixed(2)}
                            </td>
                            <td className={`py-3 px-2 text-right font-mono text-sm font-semibold ${
                              (position.pnl || 0) >= 0 ? 'text-gain' : 'text-loss'
                            }`}>
                              {position.pnl ? (
                                `${(position.pnl >= 0) ? '+' : ''}$${position.pnl.toFixed(2)}`
                              ) : (
                                <span className="text-gray-400 text-xs">
                                  {isLoadingHistorical ? 'Loading...' : '$0.00'}
                                </span>
                              )}
                            </td>
                            <td className={`py-3 px-2 text-right font-mono text-sm font-semibold ${
                              (position.pnlPct || 0) >= 0 ? 'text-gain' : 'text-loss'
                            }`}>
                              {position.pnlPct !== undefined ? (
                                `${(position.pnlPct >= 0) ? '+' : ''}${position.pnlPct.toFixed(2)}%`
                              ) : (
                                <span className="text-gray-400 text-xs">
                                  {isLoadingHistorical ? 'Loading...' : '0.00%'}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-right font-mono text-sm text-green-600 dark:text-green-400 font-medium">
                              {position.dividend !== undefined ? (
                                `$${position.dividend.toFixed(2)}`
                              ) : (
                                <span className="text-gray-400 text-xs">
                                  {isLoadingDividends ? 'Loading...' : '$0.00'}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-right font-mono text-sm text-green-600 dark:text-green-400 font-medium">
                              {position.dividendPct !== undefined ? (
                                `${position.dividendPct.toFixed(2)}%`
                              ) : (
                                <span className="text-gray-400 text-xs">
                                  {isLoadingDividends ? 'Loading...' : '0.00%'}
                                </span>
                              )}
                            </td>
                            <td className={`py-3 px-2 text-right font-mono text-sm font-bold ${
                              (position.totalReturnPct || 0) >= 0 ? 'text-gain' : 'text-loss'
                            }`}>
                              {position.totalReturnPct !== undefined ? (
                                `${(position.totalReturnPct >= 0) ? '+' : ''}${position.totalReturnPct.toFixed(2)}%`
                              ) : (
                                <span className="text-gray-400 text-xs">
                                  {isLoadingHistorical || isLoadingDividends ? 'Loading...' : '0.00%'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Portfolio Summary with Equal $1,000 Positions */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Portfolio Performance Summary</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Based on equal $1,000 investment in each stock on {new Date(performanceSinceDate).toLocaleDateString()}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Current Portfolio Value
                    </h4>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${portfolioTotals.finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Initial Investment
                    </h4>
                    <p className="text-2xl font-bold">
                      ${portfolioTotals.initialTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Portfolio Profit/Loss
                    </h4>
                    <p className={`text-2xl font-bold ${
                      portfolioTotals.portfolioPL >= 0 ? 'text-gain' : 'text-loss'
                    }`}>
                      {portfolioTotals.portfolioPL >= 0 ? '+' : ''}${portfolioTotals.portfolioPL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Portfolio Total Return
                    </h4>
                    <p className={`text-2xl font-bold ${
                      portfolioTotals.portfolioReturnPct >= 0 ? 'text-gain' : 'text-loss'
                    }`}>
                      {portfolioTotals.portfolioReturnPct >= 0 ? '+' : ''}{portfolioTotals.portfolioReturnPct.toFixed(2)}%
                    </p>
                  </div>
                </div>
                
                {isLoadingHistorical && (
                  <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Calculating portfolio totals...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Strategies Tab */}
          {activeTab === 'strategies' && (
            <div className="space-y-4">
              {mockStrategies.map((strategy) => (
                <div key={strategy.id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{strategy.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {strategy.type} • {strategy.parameters}
                      </p>
                    </div>
                    <span className={`text-lg font-bold ${
                      strategy.return >= 0 ? 'text-gain' : 'text-loss'
                    }`}>
                      {strategy.return >= 0 ? '+' : ''}{strategy.return.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Total Trades</p>
                      <p className="font-semibold">{strategy.trades}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Win Rate</p>
                      <p className="font-semibold">{strategy.winRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Return</p>
                      <p className={`font-semibold ${
                        strategy.return >= 0 ? 'text-gain' : 'text-loss'
                      }`}>
                        {strategy.return >= 0 ? '+' : ''}{strategy.return.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Performance Chart</h3>
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Chart.js integration would go here for {user.username}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}