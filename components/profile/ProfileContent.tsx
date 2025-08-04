'use client'

import { useState } from 'react'
import PortfolioPerformanceChart from '@/components/PortfolioPerformanceChart'
import ProfileHeader from '@/components/profile/ProfileHeader'
import PortfolioMetrics from '@/components/profile/PortfolioMetrics'
import PositionsTable from '@/components/profile/PositionsTable'
import { Card, CardContent } from '@/components/ui/card'

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

interface ProfileContentProps {
  user: {
    username: string
    tier: 'S' | 'A' | 'B' | 'C'
    rank: number
    totalReturn: number
    followers: number
    following: number
    portfolio: string[]
  }
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'strategies'>('portfolio')

  const mockPortfolio: Portfolio = {
    totalValue: 125450.32,
    dayChange: 2.45,
    totalReturn: user.totalReturn,
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky Profile Header */}
      <ProfileHeader user={user} isSticky={true} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8" role="tablist">
            {[
              { id: 'portfolio', name: 'Portfolio & Performance' },
              { id: 'strategies', name: 'Strategies' }
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Portfolio & Performance Tab */}
        {activeTab === 'portfolio' && (
          <div 
            role="tabpanel" 
            id="portfolio-panel"
            aria-labelledby="portfolio-tab"
            className="space-y-8"
          >
            {/* Portfolio Metrics */}
            <PortfolioMetrics
              totalValue={mockPortfolio.totalValue}
              dayChange={mockPortfolio.dayChange}
              totalReturn={mockPortfolio.totalReturn}
            />

            {/* Performance Chart */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                  Portfolio Performance Over Time
                </h3>
                <PortfolioPerformanceChart user={user} />
              </CardContent>
            </Card>

            {/* Positions Table */}
            <PositionsTable positions={mockPortfolio.positions} />
          </div>
        )}

        {/* Strategies Tab */}
        {activeTab === 'strategies' && (
          <div 
            role="tabpanel" 
            id="strategies-panel"
            aria-labelledby="strategies-tab"
            className="space-y-6"
          >
            {mockStrategies.map((strategy) => (
              <Card key={strategy.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {strategy.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        <span className="font-medium">{strategy.type}</span> • {strategy.parameters}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-bold ${
                        strategy.return >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {strategy.return >= 0 ? '+' : ''}{strategy.return}%
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Total Return
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {strategy.trades}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Total Trades
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {strategy.winRate}%
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Win Rate
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${
                        strategy.return >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {strategy.return >= 0 ? '+' : ''}{strategy.return}%
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Performance
                      </p>
                    </div>
                  </div>

                  {/* Strategy Performance Bar */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Strategy Performance</span>
                      <span className={`font-medium ${
                        strategy.return >= 25 ? 'text-green-600 dark:text-green-400' :
                        strategy.return >= 15 ? 'text-yellow-600 dark:text-yellow-400' :
                        strategy.return >= 0 ? 'text-blue-600 dark:text-blue-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {strategy.return >= 25 ? 'Excellent' :
                         strategy.return >= 15 ? 'Good' :
                         strategy.return >= 0 ? 'Fair' :
                         'Poor'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${
                          strategy.return >= 25 ? 'bg-green-500' :
                          strategy.return >= 15 ? 'bg-yellow-500' :
                          strategy.return >= 0 ? 'bg-blue-500' :
                          'bg-red-500'
                        }`}
                        style={{ 
                          width: `${Math.min(Math.max((strategy.return + 10) * 2.5, 5), 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}