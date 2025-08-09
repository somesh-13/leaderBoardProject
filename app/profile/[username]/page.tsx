'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Target, Calendar, Briefcase } from 'lucide-react'
import { useUserPortfolio, useInitializeDemoData } from '@/lib/hooks/usePortfolioData'
import { useStocks } from '@/lib/store/portfolioStore'
import { formatCurrency, formatPercentage } from '@/lib/utils/portfolioCalculations'



export default function ProfilePage() {
  // Initialize demo data
  useInitializeDemoData()
  
  const params = useParams()
  const username = params.username as string
  
  // Get portfolio data from global state
  const { portfolio, loading, error } = useUserPortfolio(username)
  const stocks = useStocks()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The user &quot;{username}&quot; doesn&apos;t exist or their portfolio data couldn&apos;t be loaded.
          </p>
          <Link 
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Leaderboard
          </Link>
        </div>
      </div>
    )
  }

  // Calculate additional metrics
  const totalPositions = portfolio.positions.length
  const topPosition = portfolio.positions.reduce((top, position) => {
    const stockData = stocks[position.symbol]
    if (!stockData) return top
    
    const currentValue = position.shares * stockData.price
    const topValue = top ? (stocks[top.symbol] ? top.shares * stocks[top.symbol].price : 0) : 0
    
    return currentValue > topValue ? position : top
  }, portfolio.positions[0])

  const worstPosition = portfolio.positions.reduce((worst: any, position) => {
    const stockData = stocks[position.symbol]
    if (!stockData) return worst
    
    const currentPrice = stockData.price
    const gainPercent = ((currentPrice - position.avgPrice) / position.avgPrice) * 100
    
    if (!worst) return position
    
    const worstStockData = stocks[worst.symbol]
    if (!worstStockData) return position
    
    const worstGainPercent = ((worstStockData.price - worst.avgPrice) / worst.avgPrice) * 100
    
    return gainPercent < worstGainPercent ? position : worst
  }, null)

  const getTierBadgeStyle = (tier: string) => {
    const styles = {
      'S': 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
      'A': 'bg-gradient-to-r from-green-400 to-green-600 text-white', 
      'B': 'bg-gradient-to-r from-blue-400 to-blue-600 text-white',
      'C': 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
    }
    return styles[tier as keyof typeof styles] || styles.C
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/leaderboard"
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {portfolio.username}&apos;s Portfolio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Last updated {formatDate(portfolio.lastCalculated)}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getTierBadgeStyle(portfolio.tier)}`}>
            {portfolio.tier} Tier
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Portfolio Stats */}
          <div className="lg:col-span-2">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(portfolio.totalValue)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Invested: {formatCurrency(portfolio.totalInvested)}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Return</p>
                    <p className={`text-2xl font-bold ${portfolio.totalReturnPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatPercentage(portfolio.totalReturnPercent, { showSign: true })}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${portfolio.totalReturnPercent >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                    {portfolio.totalReturnPercent >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`text-sm ${portfolio.totalReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(portfolio.totalReturn, { showSign: true })}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Day Change</p>
                    <p className={`text-2xl font-bold ${portfolio.dayChangePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatPercentage(portfolio.dayChangePercent, { showSign: true })}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`text-sm ${portfolio.dayChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(portfolio.dayChange, { showSign: true })}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Primary Sector</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {portfolio.sector}
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                    <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Primary: {portfolio.primaryStock}
                  </span>
                </div>
              </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Holdings ({totalPositions} positions)
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Shares
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Avg Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Current Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Current Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Return
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {portfolio.positions.map((position) => {
                      const stockData = stocks[position.symbol]
                      const currentPrice = stockData?.price || 0
                      const currentValue = position.shares * currentPrice
                      const invested = position.shares * position.avgPrice
                      const returnAmount = currentValue - invested
                      const returnPercent = invested > 0 ? (returnAmount / invested) * 100 : 0

                      return (
                        <tr key={position.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {position.symbol}
                              </span>
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                {position.sector || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {position.shares.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(position.avgPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(currentPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(currentValue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className={`${returnPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              <div className="font-medium">
                                {formatPercentage(returnPercent, { showSign: true })}
                              </div>
                              <div className="text-xs">
                                {formatCurrency(returnAmount, { showSign: true })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Performer */}
            {topPosition && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Top Position
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {topPosition.symbol}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {topPosition.shares.toLocaleString()} shares
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {stocks[topPosition.symbol] 
                        ? formatCurrency(topPosition.shares * stocks[topPosition.symbol].price)
                        : 'Loading...'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Worst Performer */}
            {worstPosition && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Needs Attention
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {worstPosition.symbol}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {worstPosition.shares.toLocaleString()} shares
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {stocks[worstPosition.symbol] 
                        ? formatCurrency(worstPosition.shares * stocks[worstPosition.symbol].price)
                        : 'Loading...'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Portfolio Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Positions</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {totalPositions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sector</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {portfolio.sector}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tier</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${getTierBadgeStyle(portfolio.tier)}`}>
                    {portfolio.tier}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Update</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(portfolio.lastCalculated)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}