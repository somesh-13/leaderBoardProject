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

      </div>
    </div>
  )
}