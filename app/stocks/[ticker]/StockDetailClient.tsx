'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface StockDetailData {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: string
  dayHigh: number
  dayLow: number
  open: number
  previousClose: number
  pe?: number
  yearHigh?: number
  yearLow?: number
  avgVolume?: number
  lastUpdated: string
}

interface StockDetailClientProps {
  ticker: string
}

export default function StockDetailClient({ ticker }: StockDetailClientProps) {
  const [stockData, setStockData] = useState<StockDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStockDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/stocks/${ticker}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${ticker}`)
        }
        
        const data = await response.json()
        setStockData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        console.error('Error fetching stock details:', err)
      } finally {
        setLoading(false)
      }
    }

    if (ticker) {
      fetchStockDetail()
    }
  }, [ticker])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !stockData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📈</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Stock Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || `Unable to find data for "${ticker}". Please check the symbol and try again.`}
          </p>
          <Link 
            href="/screener"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Market Screener
          </Link>
        </div>
      </div>
    )
  }

  const isPositive = stockData.changePercent >= 0
  const changeColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
  const changeBgColor = isPositive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/screener"
            className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {stockData.ticker}
              </h1>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${changeBgColor} ${changeColor}`}>
                {isPositive ? '+' : ''}{stockData.changePercent.toFixed(2)}%
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {stockData.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Price Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Price</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${stockData.price.toFixed(2)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${changeBgColor}`}>
                  {isPositive ? (
                    <TrendingUp className={`h-8 w-8 ${changeColor}`} />
                  ) : (
                    <TrendingDown className={`h-8 w-8 ${changeColor}`} />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-lg font-semibold ${changeColor}`}>
                  {isPositive ? '+' : ''}${stockData.change.toFixed(2)}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Last updated: {stockData.lastUpdated}
                </span>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Price Chart
              </h2>
              <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">Chart coming soon</p>
                </div>
              </div>
            </div>

            {/* News Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Latest News
              </h2>
              <div className="space-y-4">
                <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">News feed coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Key Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Open</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${stockData.open.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Previous Close</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${stockData.previousClose.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Day High</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${stockData.dayHigh.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Day Low</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${stockData.dayLow.toFixed(2)}
                  </span>
                </div>
                {stockData.yearHigh && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">52W High</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${stockData.yearHigh.toFixed(2)}
                    </span>
                  </div>
                )}
                {stockData.yearLow && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">52W Low</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${stockData.yearLow.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Volume & Market Cap */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Trading Info
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Volume</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stockData.volume.toLocaleString()}
                  </span>
                </div>
                {stockData.avgVolume && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Volume</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stockData.avgVolume.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Market Cap</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stockData.marketCap}
                  </span>
                </div>
                {stockData.pe && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">P/E Ratio</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stockData.pe.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/terminal"
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  Test Strategy
                </Link>
                <Link
                  href="/leaderboard"
                  className="w-full flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
                >
                  <TrendingUp className="h-4 w-4" />
                  View Traders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}