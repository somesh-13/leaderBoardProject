'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signIn } from 'next-auth/react'
import { Users, TrendingUp, User, Mail, Shield, Award, BarChart3, DollarSign } from 'lucide-react'
import { useInitializeDemoData, useLeaderboardData } from '@/lib/hooks/usePortfolioData'
import { formatPercentage, formatCurrency } from '@/lib/utils/portfolioCalculations'
import StockLink from '@/components/navigation/StockLink'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  
  // Initialize demo data
  useInitializeDemoData()
  const { leaderboard, loading } = useLeaderboardData()

  // Show sign in prompt if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <User className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please sign in to view your profile and portfolio performance.
            </p>
            <button
              onClick={() => signIn()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              New to the platform?
            </p>
            <Link
              href="/auth/signup"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (status === "loading" || loading) {
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

  // Find user's portfolio data from leaderboard
  const userProfile = leaderboard.find(trader => 
    trader.username.toLowerCase() === session?.user?.username?.toLowerCase()
  )

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              My Profile
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your trading performance and portfolio overview
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <Image 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.username}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                  alt={session?.user?.username || 'User'}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-700"
                />
                {userProfile && userProfile.rank <= 3 && (
                  <div className="absolute -top-2 -right-2 text-3xl">
                    {userProfile.rank === 1 ? '🥇' : userProfile.rank === 2 ? '🥈' : '🥉'}
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {session?.user?.username}
                  </h2>
                  {userProfile && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r text-white ${getTierColor(userProfile.tier)}`}>
                          {userProfile.tier} Tier
                        </div>
                        <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Rank #{userProfile.rank}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{session?.user?.email}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Role: {session?.user?.role || 'User'}</span>
                  </div>
                  {userProfile && (
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Award className="h-4 w-4" />
                      <span>Primary Sector: {userProfile.sector}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {userProfile ? (
          <>
            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Annual Return */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${userProfile.return >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <TrendingUp className={`h-5 w-5 ${userProfile.return >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Annual Return</h3>
                </div>
                <div className={`text-2xl font-bold ${userProfile.return >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatPercentage(userProfile.return, { showSign: true })}
                </div>
              </div>

              {/* Portfolio Value */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Portfolio Value</h3>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(userProfile.totalValue || 100000)}
                </div>
              </div>

              {/* Leaderboard Rank */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Leaderboard Rank</h3>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  #{userProfile.rank} of {leaderboard.length}
                </div>
              </div>
            </div>

            {/* Portfolio Holdings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Portfolio Holdings ({userProfile.portfolio?.length || 0} positions)
                  </h3>
                </div>
                
                {userProfile.portfolio && userProfile.portfolio.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {userProfile.portfolio.map((stock, index) => (
                      <StockLink 
                        key={`${stock}-${index}`}
                        ticker={stock}
                        className="flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors font-semibold text-blue-800 dark:text-blue-200"
                      >
                        {stock}
                      </StockLink>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No portfolio holdings found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/leaderboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Users className="h-4 w-4" />
                View Leaderboard
              </Link>
              <Link
                href={`/profile/${session?.user?.username}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                <User className="h-4 w-4" />
                Detailed Profile
              </Link>
            </div>
          </>
        ) : (
          /* No Portfolio Data */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-8 text-center">
              <div className="mb-4">
                <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Portfolio Data
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You don&apos;t have a portfolio set up yet. Create your first portfolio to start competing on the leaderboard!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/leaderboard"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Users className="h-4 w-4" />
                    View Leaderboard
                  </Link>
                  <Link
                    href="/screener"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Stock Screener
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}