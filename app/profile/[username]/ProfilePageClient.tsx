'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Briefcase, RefreshCw } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/utils/portfolioCalculations'
import StockLink from '@/components/navigation/StockLink'
import { APIResponse, Position, PortfolioSnapshot, SectorAllocation, User } from '@/lib/types/leaderboard'

interface PortfolioSnapshotResponse extends PortfolioSnapshot {
  user: User;
  positions: Position[];
  sectorAllocations: SectorAllocation[];
}

interface ProfilePageClientProps {
  username: string
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<PortfolioSnapshotResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data: APIResponse<PortfolioSnapshotResponse> = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'API request failed')
  }
  
  if (!data.data) {
    throw new Error('No data received')
  }
  
  return data.data
}

export default function ProfilePageClient({ username }: ProfilePageClientProps) {
  const [lastRefreshAt, setLastRefreshAt] = useState<Date>(new Date())

  // Fetch portfolio snapshot from MongoDB-enabled API
  const { 
    data: portfolioSnapshot, 
    error, 
    isLoading,
    mutate: refreshPortfolio
  } = useSWR<PortfolioSnapshotResponse>(
    `/api/portfolio/${encodeURIComponent(username)}/snapshot`,
    fetcher,
    {
      refreshInterval: 30000, // Auto-refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      onSuccess: () => setLastRefreshAt(new Date())
    }
  )

  const handleRefresh = async () => {
    await refreshPortfolio()
    setLastRefreshAt(new Date())
  }

  console.log('🔍 ProfilePageClient Debug:', {
    username,
    portfolioSnapshot: portfolioSnapshot ? 'Found' : 'Not found',
    isLoading,
    error: error?.message,
    lastRefresh: lastRefreshAt.toLocaleTimeString()
  })

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

  if (error || !portfolioSnapshot) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error?.message || `The user "${username}" doesn't exist or their portfolio data couldn't be loaded.`}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <Link 
              href="/leaderboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Leaderboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { user, positions, sectorAllocations, totalValue, invested, totalReturnPct, dayChangePct, dayChangeValue, lastUpdated } = portfolioSnapshot

  // Calculate additional metrics
  const totalReturn = totalValue - invested
  const totalPositions = positions.length

  // Find best and worst performing positions
  const bestPosition = positions.reduce((best: Position, pos: Position) => 
    (pos.returnPct > (best?.returnPct || -Infinity)) ? pos : best, positions[0]
  )

  const worstPosition = positions.reduce((worst: Position, pos: Position) => 
    (pos.returnPct < (worst?.returnPct || Infinity)) ? pos : worst, positions[0]
  )

  // Calculate primary sector value
  const primarySectorAllocation = sectorAllocations[0]

  // Remove unused function

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
              {user.displayName}&apos;s Portfolio
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Last updated {formatDate(lastUpdated)}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
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
                    <p className={`text-2xl font-bold ${totalReturnPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatPercentage(totalReturnPct, { showSign: true })}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${totalReturnPct >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                    {totalReturnPct >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`text-sm ${totalReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(totalReturn, { showSign: true })}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    on {formatCurrency(invested)} invested
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Day Change</p>
                    <p className={`text-2xl font-bold ${dayChangePct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatPercentage(dayChangePct, { showSign: true })}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`text-sm ${dayChangeValue >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(dayChangeValue, { showSign: true })}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Portfolio Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(totalValue)}
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                    <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {totalPositions} positions
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Shares
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Avg Cost
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Current Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Market Value
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Return
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {positions.map((position) => (
                      <tr key={position.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <StockLink 
                              ticker={position.symbol} 
                              className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {position.symbol}
                            </StockLink>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {position.sector || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                          {position.shares.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                          {formatCurrency(position.avgPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                          {formatCurrency(position.currentPrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                          {formatCurrency(position.currentValue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <div className={`${position.returnPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            <div className="font-medium">
                              {formatPercentage(position.returnPct, { showSign: true })}
                            </div>
                            <div className="text-xs">
                              {formatCurrency(position.returnValue, { showSign: true })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Best Performer */}
            {bestPosition && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Best Performer
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <StockLink 
                      ticker={bestPosition.symbol} 
                      className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {bestPosition.symbol}
                    </StockLink>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {bestPosition.shares.toLocaleString()} shares
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Return</p>
                    <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                      {formatPercentage(bestPosition.returnPct, { showSign: true })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Worst Performer */}
            {worstPosition && bestPosition.symbol !== worstPosition.symbol && (
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
                    <StockLink 
                      ticker={worstPosition.symbol} 
                      className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {worstPosition.symbol}
                    </StockLink>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {worstPosition.shares.toLocaleString()} shares
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Return</p>
                    <p className="text-xl font-semibold text-red-600 dark:text-red-400">
                      {formatPercentage(worstPosition.returnPct, { showSign: true })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sector Allocation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Sector Allocation
              </h3>
              <div className="space-y-3">
                {sectorAllocations.map((allocation, index) => (
                  <div key={allocation.sector} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-3 h-3 rounded-full`}
                        style={{ 
                          backgroundColor: `hsl(${index * 360 / sectorAllocations.length}, 70%, 50%)`
                        }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {allocation.sector}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {allocation.percentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(allocation.value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Portfolio Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Value</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(totalValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Invested</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(invested)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Positions</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {totalPositions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Primary Sector</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {primarySectorAllocation?.sector || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Refresh</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {lastRefreshAt.toLocaleTimeString()}
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