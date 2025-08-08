'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Users, ArrowRight, TrendingUp } from 'lucide-react'
import { useInitializeDemoData, useLeaderboardData } from '@/lib/hooks/usePortfolioData'
import { formatPercentage } from '@/lib/utils/portfolioCalculations'

export default function ProfilePage() {
  // const router = useRouter()
  
  // Initialize demo data
  useInitializeDemoData()
  const { leaderboard, loading } = useLeaderboardData()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-8 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getTierColor = (tier: string) => {
    const colors = {
      'S': 'from-yellow-400 to-yellow-600',
      'A': 'from-green-400 to-green-600',
      'B': 'from-blue-400 to-blue-600', 
      'C': 'from-gray-400 to-gray-600'
    }
    return colors[tier as keyof typeof colors] || colors.C
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Trader Profiles
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore detailed portfolios, performance metrics, and trading strategies of our top performers.
          </p>
        </div>

        {/* Leaderboard Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leaderboard.slice(0, 12).map((trader) => (
            <Link 
              key={trader.username}
              href={`/profile/${trader.username}`}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Rank Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-400 dark:text-gray-500">
                      #{trader.rank}
                    </div>
                    {trader.rank <= 3 && (
                      <span className="text-2xl">
                        {trader.rank === 1 ? '🥇' : trader.rank === 2 ? '🥈' : '🥉'}
                      </span>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r text-white ${getTierColor(trader.tier)}`}>
                    {trader.tier} Tier
                  </div>
                </div>

                {/* Profile Info */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Image 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${trader.username}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                      alt={trader.username}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {trader.username}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {trader.sector} • {trader.primaryStock}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className={`h-4 w-4 ${trader.return >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Annual Return
                    </span>
                  </div>
                  <div className={`text-2xl font-bold ${trader.return >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatPercentage(trader.return, { showSign: true })}
                  </div>
                </div>

                {/* Portfolio Preview */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Portfolio ({trader.portfolio?.length || 0} positions):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {trader.portfolio?.slice(0, 4).map((stock) => (
                      <span 
                        key={stock}
                        className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded"
                      >
                        {stock}
                      </span>
                    ))}
                    {trader.portfolio && trader.portfolio.length > 4 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        +{trader.portfolio.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* View Profile CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    View Full Portfolio
                  </span>
                  <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-all duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Back to Leaderboard */}
        <div className="text-center mt-12">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Users className="h-4 w-4" />
            Back to Leaderboard
          </Link>
        </div>
      </div>
    </div>
  )
}