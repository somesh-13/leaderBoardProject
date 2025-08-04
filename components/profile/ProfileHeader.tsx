"use client"

import { useState, useEffect } from 'react'
import TierBadge from '@/components/TierBadge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ProfileHeaderProps {
  user: {
    username: string
    tier: 'S' | 'A' | 'B' | 'C'
    rank: number
    totalReturn: number
    followers: number
    following: number
  }
  isSticky?: boolean
}

export default function ProfileHeader({ user, isSticky = false }: ProfileHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    if (!isSticky) return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isSticky])

  return (
    <div className={cn(
      "transition-all duration-300 ease-in-out",
      isSticky && "sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm",
      isSticky && isScrolled && "shadow-md border-b border-gray-200 dark:border-gray-700"
    )}>
      <div className={cn(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        isSticky && isScrolled ? "py-3" : "py-6"
      )}>
        <Card className={cn(
          "transition-all duration-300",
          isSticky && isScrolled && "shadow-sm"
        )}>
          <div className="p-6">
            <div className={cn(
              "flex items-center gap-6 transition-all duration-300",
              isSticky && isScrolled ? "flex-row" : "flex-col sm:flex-row"
            )}>
              {/* Avatar */}
              <div className={cn(
                "flex-shrink-0 transition-all duration-300",
                isSticky && isScrolled ? "w-12 h-12" : "w-20 h-20"
              )}>
                <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className={cn(
                    "font-bold text-white transition-all duration-300",
                    isSticky && isScrolled ? "text-lg" : "text-2xl"
                  )}>
                    {user.username.charAt(0)}
                  </span>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <h1 className={cn(
                    "font-bold transition-all duration-300",
                    isSticky && isScrolled ? "text-xl" : "text-2xl"
                  )}>
                    {user.username}
                  </h1>
                  <TierBadge tier={user.tier} />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Rank #{user.rank} • 
                  <span className={cn(
                    "font-semibold ml-1",
                    user.totalReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {user.totalReturn >= 0 ? '+' : ''}{user.totalReturn}% Annual Return
                  </span>
                </p>
                
                {/* Social Stats - Hide when sticky and scrolled */}
                <div className={cn(
                  "flex justify-center sm:justify-start gap-6 mb-4 transition-all duration-300",
                  isSticky && isScrolled && "opacity-0 h-0 overflow-hidden"
                )}>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {user.followers.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {user.following}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Following</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={cn(
                "flex gap-2 transition-all duration-300",
                isSticky && isScrolled ? "flex-col sm:flex-row" : "flex-col sm:flex-row"
              )}>
                <button 
                  className={cn(
                    "bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    isSticky && isScrolled ? "px-3 py-1 text-sm" : "px-4 py-2"
                  )}
                  aria-label={`Follow ${user.username}`}
                >
                  Follow
                </button>
                <button 
                  className={cn(
                    "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
                    isSticky && isScrolled ? "px-3 py-1 text-sm" : "px-4 py-2"
                  )}
                  aria-label={`Invest in ${user.username}'s strategy`}
                >
                  Invest
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}