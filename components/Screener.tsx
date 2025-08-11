'use client'

import { useState, useEffect } from 'react'
import { getCurrentPrice } from '@/lib/polygon'
import { TrendingUp, TrendingDown, Search, Filter } from 'lucide-react'

interface ScreenerAsset {
  name: string
  symbol: string
  price: number
  change: number
  changePercent: number
  volume?: number
  marketCap?: string
  sector: string
  type: 'Stock' | 'Index' | 'ETF'
}

export default function Screener() {
  const [assets, setAssets] = useState<ScreenerAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Trending tickers to fetch
  const trendingTickers = [
    { name: 'S&P 500', symbol: 'SPY', sector: 'Index', type: 'Index' as const },
    { name: 'NASDAQ', symbol: 'QQQ', sector: 'Index', type: 'Index' as const },
    { name: 'Apple', symbol: 'AAPL', sector: 'Technology', type: 'Stock' as const },
    { name: 'Tesla', symbol: 'TSLA', sector: 'Automotive', type: 'Stock' as const },
    { name: 'Microsoft', symbol: 'MSFT', sector: 'Technology', type: 'Stock' as const },
    { name: 'Meta', symbol: 'META', sector: 'Technology', type: 'Stock' as const },
    { name: 'NVIDIA', symbol: 'NVDA', sector: 'Technology', type: 'Stock' as const },
    { name: 'Amazon', symbol: 'AMZN', sector: 'E-commerce', type: 'Stock' as const },
    { name: 'Google', symbol: 'GOOGL', sector: 'Technology', type: 'Stock' as const },
    { name: 'Netflix', symbol: 'NFLX', sector: 'Entertainment', type: 'Stock' as const },
    { name: 'Palantir', symbol: 'PLTR', sector: 'Technology', type: 'Stock' as const },
    { name: 'Rocket Lab', symbol: 'RKLB', sector: 'Aerospace', type: 'Stock' as const },
  ]

  useEffect(() => {
    const fetchScreenerData = async () => {
      setIsLoading(true)
      
      try {
        const updatedAssets = await Promise.all(
          trendingTickers.map(async (ticker) => {
            const { price, change } = await getCurrentPrice(ticker.symbol)
            return {
              ...ticker,
              price,
              change,
              changePercent: change, // getCurrentPrice returns change as percentage
              volume: Math.floor(Math.random() * 10000000), // Mock volume for now
              marketCap: `$${(Math.random() * 1000 + 100).toFixed(1)}B`
            }
          })
        )
        setAssets(updatedAssets)
      } catch (error) {
        console.error('Error fetching screener data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchScreenerData()
  }, [])

  // Filter assets based on selected filter and search term
  const filteredAssets = assets
    .filter(asset => {
      if (filter === 'gainers') return asset.changePercent > 0
      if (filter === 'losers') return asset.changePercent < 0
      return true
    })
    .filter(asset => 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)) // Sort by biggest movers

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8"></div>
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Market Screener
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time data for trending stocks and market indices
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('gainers')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filter === 'gainers'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Gainers
            </button>
            <button
              onClick={() => setFilter('losers')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filter === 'losers'
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <TrendingDown className="h-4 w-4" />
              Losers
            </button>
          </div>
        </div>

        {/* Screener Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Symbol</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Price</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Change</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Volume</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Market Cap</th>
                  <th className="text-right py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-400">Sector</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset, index) => (
                  <tr key={asset.symbol} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{asset.symbol}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{asset.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-gray-900 dark:text-white">
                      ${asset.price.toFixed(2)}
                    </td>
                    <td className={`py-4 px-6 text-right font-semibold ${
                      asset.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      <div className="flex items-center justify-end gap-1">
                        {asset.changePercent >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-600 dark:text-gray-400">
                      {asset.volume?.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right text-gray-600 dark:text-gray-400">
                      {asset.marketCap}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        asset.type === 'Index' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                        asset.sector === 'Technology' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                        asset.sector === 'Aerospace' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        {asset.sector}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Showing {filteredAssets.length} of {assets.length} assets
        </div>
      </div>
    </div>
  )
}
