'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import TierBadge from '@/components/TierBadge'
import { getPriceWithFallback, getMultipleHistoricalPrices } from '@/lib/finnhub'

interface LeaderboardEntry {
  rank: number
  username: string
  return: number
  calculatedReturn?: number
  tier: 'S' | 'A' | 'B' | 'C'
  sector: string
  primaryStock: string
  portfolio: string[]
}

export default function Leaderboard() {
  const [filterSector, setFilterSector] = useState('all')
  const [filterCompany, setFilterCompany] = useState('all')
  const [filterAsset, setFilterAsset] = useState('all')
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [isLoadingReturns, setIsLoadingReturns] = useState(true)
  const [performanceSinceDate, setPerformanceSinceDate] = useState(() => {
    // Default to June 16, 2025 (Monday - valid trading day) for demo purposes
    return '2025-06-16'
  })

  const mockData: LeaderboardEntry[] = useMemo(() => [
    { rank: 1, username: 'Matt', return: 45.2, tier: 'S', sector: 'Technology', primaryStock: 'RKLB', portfolio: ['RKLB', 'AMZN', 'SOFI', 'ASTS', 'BRK.B', 'CELH', 'OSCR', 'EOG', 'BROS', 'ABCL'] },
    { rank: 2, username: 'Amit', return: 42.8, tier: 'S', sector: 'Technology', primaryStock: 'PLTR', portfolio: ['PLTR', 'HOOD', 'TSLA', 'AMD', 'JPM', 'NBIS', 'GRAB', 'AAPL', 'V', 'DUOL'] },
    { rank: 3, username: 'Steve', return: 39.5, tier: 'S', sector: 'Technology', primaryStock: 'META', portfolio: ['META', 'MSTR', 'MSFT', 'HIMS', 'AVGO', 'CRWD', 'NFLX', 'CRM', 'PYPL', 'MU'] },
    { rank: 4, username: 'Tannor', return: 37.1, tier: 'S', sector: 'Technology', primaryStock: 'NVDA', portfolio: ['NVDA', 'NU', 'NOW', 'MELI', 'SHOP', 'TTD', 'ASML', 'APP', 'COIN', 'TSM'] },
    { rank: 5, username: 'Kris', return: 34.7, tier: 'S', sector: 'Healthcare', primaryStock: 'UNH', portfolio: ['UNH', 'GOOGL', 'MRVL', 'AXON', 'ELF', 'ORCL', 'CSCO', 'LLY', 'NVO', 'TTWO'] },
    { rank: 6, username: 'TradeMaster', return: 22.5, tier: 'A', sector: 'Technology', primaryStock: 'AAPL', portfolio: ['AAPL'] },
    { rank: 7, username: 'StockGuru', return: 18.2, tier: 'A', sector: 'Technology', primaryStock: 'TSLA', portfolio: ['TSLA'] },
    { rank: 8, username: 'InvestPro', return: 15.7, tier: 'A', sector: 'Healthcare', primaryStock: 'JNJ', portfolio: ['JNJ'] },
    { rank: 9, username: 'MarketWiz', return: 12.4, tier: 'B', sector: 'Finance', primaryStock: 'JPM', portfolio: ['JPM'] },
    { rank: 10, username: 'BullRunner', return: 9.8, tier: 'B', sector: 'Technology', primaryStock: 'MSFT', portfolio: ['MSFT'] },
  ], [])

  // Calculate portfolio returns with equal $1,000 positions
  const calculatePortfolioReturn = useCallback(async (portfolio: string[]) => {
    try {
      // Get current prices
      const currentPrices: Record<string, number> = {}
      await Promise.all(
        portfolio.map(async (symbol) => {
          const { price } = await getPriceWithFallback(symbol)
          currentPrices[symbol] = price
        })
      )

      // Get historical prices
      const historicalPrices = await getMultipleHistoricalPrices(portfolio, performanceSinceDate)

      let initialTotal = 0
      let finalTotal = 0

      portfolio.forEach(symbol => {
        const currentPrice = currentPrices[symbol]
        const historicalPrice = historicalPrices[symbol]
        
        if (currentPrice && historicalPrice && historicalPrice > 0) {
          const investment = 1000 // $1,000 per stock
          const shares = investment / historicalPrice
          const finalValue = shares * currentPrice
          
          initialTotal += investment
          finalTotal += finalValue
        }
      })

      if (initialTotal > 0) {
        const portfolioPL = finalTotal - initialTotal
        const portfolioReturnPct = (portfolioPL / initialTotal) * 100
        return portfolioReturnPct
      }
      
      return 0
    } catch (error) {
      console.error('Error calculating portfolio return:', error)
      return 0
    }
  }, [performanceSinceDate])

  useEffect(() => {
    const calculateAllReturns = async () => {
      setIsLoadingReturns(true)
      
      const updatedData = await Promise.all(
        mockData.map(async (entry) => {
          const calculatedReturn = await calculatePortfolioReturn(entry.portfolio)
          return {
            ...entry,
            calculatedReturn
          }
        })
      )

      // Sort by calculated return and update ranks
      updatedData.sort((a, b) => (b.calculatedReturn || 0) - (a.calculatedReturn || 0))
      updatedData.forEach((entry, index) => {
        entry.rank = index + 1
      })

      setLeaderboardData(updatedData)
      setIsLoadingReturns(false)
    }

    calculateAllReturns()
    // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [performanceSinceDate])

  const filteredData = (leaderboardData.length > 0 ? leaderboardData : mockData).filter(entry => {
    if (filterSector !== 'all' && entry.sector !== filterSector) return false
    if (filterCompany !== 'all' && entry.primaryStock !== filterCompany) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compete with the best traders and climb the tier rankings based on your annual returns.
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sector</label>
            <select 
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Sectors</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Consumer">Consumer</option>
              <option value="Utilities">Utilities</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Company</label>
            <select 
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Companies</option>
              <option value="AAPL">Apple (AAPL)</option>
              <option value="TSLA">Tesla (TSLA)</option>
              <option value="MSFT">Microsoft (MSFT)</option>
              <option value="GOOGL">Google (GOOGL)</option>
              <option value="JPM">JPMorgan (JPM)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Asset Type</label>
            <select 
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Assets</option>
              <option value="stocks">Stocks</option>
              <option value="etfs">ETFs</option>
              <option value="options">Options</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Performance Since</label>
            <input
              type="date"
              value={performanceSinceDate}
              onChange={(e) => setPerformanceSinceDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trader
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Annual Return
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Primary Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Portfolio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sector
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.map((entry) => (
                <tr 
                  key={entry.rank} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        #{entry.rank}
                      </span>
                      {entry.rank <= 3 && (
                        <span className="ml-2 text-2xl">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      href={`/profile/${entry.username}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {entry.username}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isLoadingReturns ? (
                      <div className="text-gray-500 text-sm">Calculating...</div>
                    ) : (
                      <span className={`text-2xl font-bold ${
                        (entry.calculatedReturn !== undefined ? entry.calculatedReturn : entry.return) >= 0 ? 'text-gain' : 'text-loss'
                      }`}>
                        {(entry.calculatedReturn !== undefined ? entry.calculatedReturn : entry.return) >= 0 ? '+' : ''}
                        {(entry.calculatedReturn !== undefined ? entry.calculatedReturn : entry.return).toFixed(2)}%
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TierBadge tier={entry.tier} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-medium">
                    {entry.primaryStock}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {entry.portfolio.slice(0, 3).map((stock, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          {stock}
                        </span>
                      ))}
                      {entry.portfolio.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          +{entry.portfolio.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {entry.sector}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tier Explanation */}
      <div className="card mt-8">
        <h3 className="text-lg font-semibold mb-4">Tier System</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <TierBadge tier="S" className="mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Top 5% of investors
            </p>
          </div>
          <div className="text-center">
            <TierBadge tier="A" className="mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Returns ≥15%
            </p>
          </div>
          <div className="text-center">
            <TierBadge tier="B" className="mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Returns 10-15%
            </p>
          </div>
          <div className="text-center">
            <TierBadge tier="C" className="mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Returns 0-10%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}