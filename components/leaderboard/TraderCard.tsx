'use client'

import Link from 'next/link'

interface LeaderboardEntry {
  rank: number
  username: string
  return: number
  calculatedReturn?: number
  tier: 'S' | 'A' | 'B' | 'C'
  sector: string
  primaryStock: string
  portfolio: string[]
}

interface TraderCardProps {
  entry: LeaderboardEntry
  isLoadingReturns: boolean
}

export default function TraderCard({ entry, isLoadingReturns }: TraderCardProps) {
  const returnValue = entry.calculatedReturn !== undefined ? entry.calculatedReturn : entry.return
  
  const getPodiumIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  const getTierBadgeUrl = (tier: string) => {
    return `https://api.dicebear.com/9.x/initials/svg?seed=${tier}`
  }

  const getSectorColor = (sector: string) => {
    switch (sector) {
      case 'Technology': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'Healthcare': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Finance': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Consumer': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  return (
    <div 
      className={`rounded-lg shadow-md bg-white dark:bg-gray-800 p-4 mb-3 border-l-4 transition-all hover:shadow-lg ${
        entry.rank <= 3 
          ? entry.rank === 1 
            ? 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800' 
            : entry.rank === 2
            ? 'border-l-gray-400 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/20 dark:to-gray-800'
            : 'border-l-amber-600 bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800'
          : 'border-l-blue-500'
      }`}
      role="region" 
      aria-label={`Trader card: ${entry.username}`}
    >
      {/* Header: Rank, Name, Tier */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              #{entry.rank}
            </span>
            {getPodiumIcon(entry.rank) && (
              <span className="text-2xl" role="img" aria-label={`Rank ${entry.rank}`}>
                {getPodiumIcon(entry.rank)}
              </span>
            )}
          </div>
          <Link 
            href={`/profile/${entry.username}`}
            className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors min-h-[44px] flex items-center"
            aria-label={`View ${entry.username}'s profile`}
          >
            {entry.username}
          </Link>
        </div>
        
        <div className="flex items-center">
          <img 
            src={getTierBadgeUrl(entry.tier)}
            alt={`${entry.tier} Tier`}
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
        </div>
      </div>

      {/* Performance & Primary Stock */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Annual Return</span>
          {isLoadingReturns ? (
            <div className="text-sm text-gray-500">Calculating...</div>
          ) : (
            <span className={`text-2xl font-bold ${
              returnValue >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {returnValue >= 0 ? '+' : ''}{returnValue.toFixed(2)}%
            </span>
          )}
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Primary Stock</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {entry.primaryStock}
          </span>
        </div>
      </div>

      {/* Sector Badge */}
      <div className="flex justify-center mb-3">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSectorColor(entry.sector)}`}>
          {entry.sector}
        </span>
      </div>

      {/* Portfolio Preview */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Portfolio</span>
          <button 
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline min-h-[32px] px-2"
            aria-label={`View full portfolio for ${entry.username}`}
          >
            View Full
          </button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.portfolio.slice(0, 3).map((stock, index) => (
            <span 
              key={index} 
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
            >
              {stock}
            </span>
          ))}
          {entry.portfolio.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
              +{entry.portfolio.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  )
}