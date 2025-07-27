'use client'

import { useState } from 'react'
import TierBadge from '@/components/TierBadge'

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

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'strategies' | 'performance'>('portfolio')

  const mockUser = {
    username: 'TradeMaster',
    tier: 'S' as const,
    rank: 1,
    totalReturn: 42.5,
    followers: 1247,
    following: 89
  }

  const mockPortfolio: Portfolio = {
    totalValue: 125450.32,
    dayChange: 2.45,
    totalReturn: 42.5,
    positions: [
      { symbol: 'AAPL', shares: 50, avgPrice: 175.23, currentPrice: 182.45, return: 4.12 },
      { symbol: 'TSLA', shares: 25, avgPrice: 245.67, currentPrice: 268.90, return: 9.45 },
      { symbol: 'MSFT', shares: 40, avgPrice: 325.12, currentPrice: 341.78, return: 5.12 },
      { symbol: 'GOOGL', shares: 15, avgPrice: 2845.33, currentPrice: 2912.67, return: 2.37 },
    ]
  }

  const mockStrategies: Strategy[] = [
    {
      id: '1',
      name: 'Tech Momentum',
      type: 'Keltner Channel',
      parameters: '20-day EMA, 2x ATR',
      return: 28.5,
      trades: 45,
      winRate: 67
    },
    {
      id: '2', 
      name: 'Value Oscillator',
      type: 'Bollinger Bands',
      parameters: '20-day SMA, 2x std dev',
      return: 15.3,
      trades: 32,
      winRate: 72
    },
    {
      id: '3',
      name: 'Trend Following',
      type: 'Moving Average',
      parameters: '50/200 day crossover',
      return: 12.8,
      trades: 18,
      winRate: 78
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
                {mockUser.username.charAt(0)}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{mockUser.username}</h1>
            <TierBadge tier={mockUser.tier} className="mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Rank #{mockUser.rank} • {mockUser.totalReturn}% Annual Return
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {mockUser.followers.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {mockUser.following}
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
                    ${mockPortfolio.totalValue.toLocaleString()}
                  </p>
                </div>
                <div className="card text-center">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Day Change
                  </h3>
                  <p className={`text-2xl font-bold ${
                    mockPortfolio.dayChange >= 0 ? 'text-gain' : 'text-loss'
                  }`}>
                    {mockPortfolio.dayChange >= 0 ? '+' : ''}{mockPortfolio.dayChange}%
                  </p>
                </div>
                <div className="card text-center">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Total Return
                  </h3>
                  <p className="text-2xl font-bold text-gain">
                    +{mockPortfolio.totalReturn}%
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
                      {mockPortfolio.positions.map((position) => (
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
                      {strategy.return >= 0 ? '+' : ''}{strategy.return}%
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
                        {strategy.return >= 0 ? '+' : ''}{strategy.return}%
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
                  Chart.js integration would go here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}