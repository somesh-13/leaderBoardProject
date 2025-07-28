'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import TierBadge from '@/components/TierBadge'
import { getPriceWithFallback } from '@/lib/finnhub'

interface Strategy {
  id: string
  name: string
  type: 'Keltner Channel' | 'Bollinger Bands' | 'Moving Average'
  parameters: string
  return: number
  trades: number
  winRate: number
}

interface Portfolio {
  totalValue: number
  dayChange: number
  totalReturn: number
  positions: {
    symbol: string
    shares: number
    avgPrice: number
    currentPrice: number
    return: number
  }[]
}

export default function UserProfile() {
  const params = useParams()
  const username = params.username as string
  const [activeTab, setActiveTab] = useState<'portfolio' | 'strategies' | 'performance'>('portfolio')

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

  const user = leaderboardUsers[username] || {
    username: username,
    tier: 'C' as const,
    rank: 99,
    totalReturn: 5.2,
    followers: 12,
    following: 45,
    sector: 'Mixed',
    portfolio: ['SPY', 'QQQ', 'BND']
  }

  const [portfolio, setPortfolio] = useState<Portfolio>({
    totalValue: user.rank <= 5 ? 125450.32 - (user.rank - 1) * 15000 : 67123.45 - (user.rank - 6) * 5000,
    dayChange: user.rank <= 5 ? 2.45 - (user.rank - 1) * 0.5 : 1.23 - (user.rank - 6) * 0.3,
    totalReturn: user.totalReturn,
    positions: []
  })

  useEffect(() => {
    const fetchPortfolioPrices = async () => {
      const positions = await Promise.all(
        user.portfolio.map(async (symbol: string) => {
          const { price } = await getPriceWithFallback(symbol)
          const shares = Math.floor(50 + Math.random() * 100)
          const avgPrice = price * (0.85 + Math.random() * 0.3)
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
    }

    if (user.portfolio && user.portfolio.length > 0) {
      fetchPortfolioPrices()
    }
  }, [user.portfolio])

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card text-center">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Total Value
                  </h3>
                  <p className="text-2xl font-bold">
                    ${portfolio.totalValue.toLocaleString()}
                  </p>
                </div>
                <div className="card text-center">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Day Change
                  </h3>
                  <p className={`text-2xl font-bold ${
                    portfolio.dayChange >= 0 ? 'text-gain' : 'text-loss'
                  }`}>
                    {portfolio.dayChange >= 0 ? '+' : ''}{portfolio.dayChange}%
                  </p>
                </div>
                <div className="card text-center">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Total Return
                  </h3>
                  <p className={`text-2xl font-bold ${
                    portfolio.totalReturn >= 0 ? 'text-gain' : 'text-loss'
                  }`}>
                    {portfolio.totalReturn >= 0 ? '+' : ''}{portfolio.totalReturn}%
                  </p>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Positions</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2">Symbol</th>
                        <th className="text-left py-2">Shares</th>
                        <th className="text-left py-2">Avg Price</th>
                        <th className="text-left py-2">Current</th>
                        <th className="text-left py-2">Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.positions.map((position) => (
                        <tr key={position.symbol} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 font-medium">{position.symbol}</td>
                          <td className="py-3">{position.shares}</td>
                          <td className="py-3">${position.avgPrice}</td>
                          <td className="py-3">${position.currentPrice}</td>
                          <td className={`py-3 font-semibold ${
                            position.return >= 0 ? 'text-gain' : 'text-loss'
                          }`}>
                            {position.return >= 0 ? '+' : ''}{position.return}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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