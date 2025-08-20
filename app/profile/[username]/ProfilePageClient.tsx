'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Target, Calendar, Briefcase } from 'lucide-react'
import { usePortfolioSnapshotAPI } from '@/lib/hooks/useApiData'
import { formatCurrency, formatPercentage } from '@/lib/utils/portfolioCalculations'
import StockLink from '@/components/navigation/StockLink'

interface ProfilePageClientProps {
  username: string
}

export default function ProfilePageClient({ username }: ProfilePageClientProps) {
  // Fetch portfolio data from API
  const { data: portfolio, loading, error } = usePortfolioSnapshotAPI(username)

  // Use portfolio metrics directly from API
  const portfolioMetrics = useMemo(() => {
    if (!portfolio) {
      return {
        totalValue: 0,
        totalInvested: 0,
        totalReturn: 0,
        totalReturnPercent: 0,
        dayChange: 0,
        dayChangePercent: 0,
        primarySector: 'N/A',
        primaryStock: 'N/A'
      }
    }

    return {
      totalValue: portfolio.totalValue,
      totalInvested: portfolio.invested,
      totalReturn: portfolio.totalValue - portfolio.invested,
      totalReturnPercent: portfolio.totalReturnPct,
      dayChange: portfolio.dayChangeValue,
      dayChangePercent: portfolio.dayChangePct,
      primarySector: portfolio.primarySector,
      primaryStock: portfolio.positions[0]?.symbol || 'N/A'
    }
  }, [portfolio])

  // Simplified loading state
  const isLoading = loading

  // Show error if API call failed or user not found
  const shouldShowError = error || (!loading && !portfolio)

  if (isLoading) {
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

  // Only show error if we have data loaded but can't find the specific user
  if (shouldShowError) {
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
  const totalPositions = portfolio?.positions?.length || 0
  const topPosition = portfolio?.positions?.reduce((top, position) => {
    const currentValue = position.currentValue
    const topValue = top ? top.currentValue : 0
    
    return currentValue > topValue ? position : top
  }, portfolio?.positions[0]) || null

  const worstPosition = portfolio?.positions?.reduce((worst: typeof portfolio.positions[0] | null, position) => {
    const returnPercent = position.returnPct
    
    if (!worst) return position
    
    const worstReturnPercent = worst.returnPct
    
    return returnPercent < worstReturnPercent ? position : worst
  }, null) || null

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
              {portfolio?.user?.username || username}&apos;s Portfolio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Last updated {portfolio?.lastUpdated ? formatDate(new Date(portfolio.lastUpdated).getTime()) : 'Never'}
            </p>
          </div>
          <div className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-500 text-white">
            Portfolio
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Portfolio Stats */}
          <div className="lg:col-span-2">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Return</p>
                    <p className={`text-2xl font-bold ${portfolioMetrics.totalReturnPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatPercentage(portfolioMetrics.totalReturnPercent, { showSign: true })}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${portfolioMetrics.totalReturnPercent >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                    {portfolioMetrics.totalReturnPercent >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`text-sm ${portfolioMetrics.totalReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(portfolioMetrics.totalReturn, { showSign: true })}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Day Change</p>
                    <p className={`text-2xl font-bold ${portfolioMetrics.dayChangePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatPercentage(portfolioMetrics.dayChangePercent, { showSign: true })}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`text-sm ${portfolioMetrics.dayChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(portfolioMetrics.dayChange, { showSign: true })}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Primary Sector</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {portfolioMetrics.primarySector}
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                    <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Primary: <StockLink ticker={portfolioMetrics.primaryStock} className="hover:text-blue-600 dark:hover:text-blue-400">{portfolioMetrics.primaryStock}</StockLink>
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
                        Avg Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Current Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Return
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {portfolio?.positions.map((position) => {
                      const returnPercent = position.returnPct
                      
                      // Format percentage with fallback
                      const formattedReturn = returnPercent >= 0 ? 
                        `+${returnPercent.toFixed(2)}%` : 
                        `${returnPercent.toFixed(2)}%`

                      return (
                        <tr key={position.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <StockLink ticker={position.symbol} className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                                {position.symbol}
                              </StockLink>
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                {position.sector || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(position.avgPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(position.currentPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className={`${returnPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              <div className="font-medium">
                                {formattedReturn}
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
                    <StockLink ticker={topPosition.symbol} className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                      {topPosition.symbol}
                    </StockLink>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {topPosition.shares.toLocaleString()} shares
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(topPosition.currentValue)}
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
                    <StockLink ticker={worstPosition.symbol} className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                      {worstPosition.symbol}
                    </StockLink>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {worstPosition.shares.toLocaleString()} shares
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Value</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(worstPosition.currentValue)}
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
                    {portfolioMetrics.primarySector}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tier</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${getTierBadgeStyle(portfolio?.tier || 'Bronze')}`}>
                    {portfolio?.tier}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Update</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {portfolio?.lastUpdated ? formatDate(new Date(portfolio.lastUpdated).getTime()) : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Return</span>
                  <span className={`text-sm font-medium ${portfolioMetrics.totalReturnPercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatPercentage(portfolioMetrics.totalReturnPercent, { showSign: true })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Day Change</span>
                  <span className={`text-sm font-medium ${portfolioMetrics.dayChangePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatPercentage(portfolioMetrics.dayChangePercent, { showSign: true })}
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