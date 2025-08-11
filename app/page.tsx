'use client'

import Link from 'next/link'
import { BackgroundLines } from '@/components/ui/background-lines'

export default function Home() {

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
              <Link href="/screener" className="btn-secondary text-center text-lg px-8 py-4 font-semibold transform hover:scale-105 transition-all">
                Market Screener
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