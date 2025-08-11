'use client'

import Link from 'next/link'
import { BackgroundLines } from '@/components/ui/background-lines'
import { useState, useEffect } from 'react'
import { getCurrentPrice } from '@/lib/polygon'

export default function Home() {
  const [marketAssets, setMarketAssets] = useState([
    { name: 'S&P 500', symbol: 'SPY', value: 4783.45, change: 1.2, type: 'Index' },
    { name: 'NASDAQ', symbol: 'QQQ', value: 15234.78, change: -0.8, type: 'Index' },
    { name: 'Apple', symbol: 'AAPL', value: 175.23, change: 0.5, type: 'Stock' },
    { name: 'Tesla', symbol: 'TSLA', value: 245.67, change: 2.8, type: 'Stock' },
    { name: 'Microsoft', symbol: 'MSFT', value: 325.12, change: -1.2, type: 'Stock' },
    { name: 'Meta', symbol: 'META', value: 298.45, change: 0.3, type: 'Stock' }
  ])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMarketData = async () => {
      setIsLoading(true)
      const assetTemplates = [
        { name: 'S&P 500', symbol: 'SPY', type: 'Index' },
        { name: 'NASDAQ', symbol: 'QQQ', type: 'Index' },
        { name: 'Apple', symbol: 'AAPL', type: 'Stock' },
        { name: 'Tesla', symbol: 'TSLA', type: 'Stock' },
        { name: 'Microsoft', symbol: 'MSFT', type: 'Stock' },
        { name: 'Meta', symbol: 'META', type: 'Stock' }
      ]
      
      const updatedAssets = await Promise.all(
        assetTemplates.map(async (asset) => {
          const { price, change } = await getCurrentPrice(asset.symbol)
          return {
            ...asset,
            value: price,
            change: change
          }
        })
      )
      setMarketAssets(updatedAssets)
      setIsLoading(false)
    }

    fetchMarketData()
  }, [])

  return (
    <div>
      {/* Hero Section with Background Lines */}
      <BackgroundLines className="h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-black dark:to-blue-950">
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent leading-tight">
              Compete
            </h1>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent leading-tight">
              Trade
            </h1>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-12 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent leading-tight">
              Win!
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed font-medium">
              In a world where you can buy even the smelliest coins, why not invest in true market legends? 
              Tokenize your trading skills, compete against the best, and claim your spot atop the leaderboard!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/leaderboard" className="btn-primary text-center text-lg px-8 py-4 font-semibold transform hover:scale-105 transition-all">
                View Leaderboard
              </Link>
              <Link href="/terminal" className="btn-secondary text-center text-lg px-8 py-4 font-semibold transform hover:scale-105 transition-all">
                Test a Strategy
              </Link>
            </div>
          </div>
        </div>
      </BackgroundLines>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Market Overview */}
      <div className="mb-16">
        {/* Market Assets Table */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Market Overview
          </h3>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading market data...</span>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Asset</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Price</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Change</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {marketAssets.map((asset, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{asset.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{asset.symbol}</p>
                        </div>
                      </td>
                      <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                        {asset.value.toLocaleString()}
                      </td>
                      <td className={`py-3 text-right font-semibold ${
                        asset.change >= 0 ? 'text-gain' : 'text-loss'
                      }`}>
                        {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          asset.type === 'Index' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                          asset.type === 'Crypto' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                          'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {asset.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Tier Rankings</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Climb from C to S tier based on your annual returns and trading performance.
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Strategy Testing</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Test Bollinger Bands, Keltner Channels, and other strategies via our chat terminal.
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">User Profiles</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Follow top traders and explore their strategies to improve your own performance.
          </p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Live Trading</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time portfolio tracking with live market data and instant performance updates.
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}