'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Filter, RotateCcw } from 'lucide-react'
import { AnimatedTooltip } from '@/components/ui/animated-tooltip'
import TraderCard from '@/components/leaderboard/TraderCard'
import MobileFilters from '@/components/leaderboard/MobileFilters'
import FloatingActions from '@/components/leaderboard/FloatingActions'

// Import new hooks and types
import { useInitializeDemoData, useLeaderboardData, usePortfolioFilters, useAutoRefresh } from '@/lib/hooks/usePortfolioData'
import { usePortfolioStore } from '@/lib/store/portfolioStore'
import { SortField } from '@/lib/types/portfolio'

export default function Leaderboard() {
  // Initialize demo data on first load
  useInitializeDemoData()
  
  // Use global state hooks
  const { leaderboard, loading: isLoadingReturns } = useLeaderboardData()
  const { filters, sortField, sortDirection, filteredData, setFilters, setSorting } = usePortfolioFilters()
  const store = usePortfolioStore()
  
  // Debug logging
  console.log('🔍 Leaderboard component - leaderboard length:', leaderboard.length)
  console.log('🔍 Leaderboard component - filteredData length:', filteredData.length)
  console.log('🔍 Leaderboard component - isLoadingReturns:', isLoadingReturns)
  
  // Local UI state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  
  // Auto-refresh every 5 minutes
  useAutoRefresh(5 * 60 * 1000)
  
  // Extract filter values for backward compatibility
  const filterSector = filters.sector
  const filterCompany = filters.company
  const filterAsset = filters.asset
  const performanceSinceDate = store.performanceSinceDate
  
  // Update filter functions
  const setFilterSector = (sector: string) => setFilters({ sector })
  const setFilterCompany = (company: string) => setFilters({ company })
  const setFilterAsset = (asset: string) => setFilters({ asset })
  const setPerformanceSinceDate = (date: string) => store.setPerformanceSinceDate(date)

  // Get leaderboard data from global state - no need for mock data anymore
  const leaderboardData = leaderboard
  
  // Handle refresh functionality
  // const handleRefresh = () => {
  //   console.log('🔄 Refreshing leaderboard data...')
  //   refreshAll()
  // }
  
  // Handle sorting with global state
  const handleSortClick = (field: SortField) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'
    setSorting(field, newDirection)
  }

  // Use the filtered and sorted data directly from global state
  // Since filteredData comes from store.leaderboard which might be outdated,
  // we need to apply sorting and filtering to the dynamically calculated leaderboard
  const sortedAndFilteredData = useMemo(() => {
    let data = leaderboardData
    
    // Apply filters
    if (filters.sector !== 'all') {
      data = data.filter(entry => entry.sector === filters.sector)
    }
    if (filters.company !== 'all') {
      data = data.filter(entry => entry.portfolio.includes(filters.company))
    }
    if (filters.asset !== 'all') {
      data = data.filter(entry => entry.portfolio.includes(filters.asset))
    }
    
    // Apply sorting
    return [...data].sort((a, b) => {
      let aVal: any
      let bVal: any
      
      switch (sortField) {
        case 'rank':
          aVal = a.rank
          bVal = b.rank
          break
        case 'username':
          aVal = a.username
          bVal = b.username
          break
        case 'return':
          aVal = a.calculatedReturn !== undefined ? a.calculatedReturn : a.return
          bVal = b.calculatedReturn !== undefined ? b.calculatedReturn : b.return
          break
        case 'tier':
          aVal = a.tier
          bVal = b.tier
          break
        case 'primaryStock':
          aVal = a.primaryStock
          bVal = b.primaryStock
          break
        case 'sector':
          aVal = a.sector
          bVal = b.sector
          break
        case 'totalValue':
          aVal = a.totalValue || 0
          bVal = b.totalValue || 0
          break
        default:
          aVal = 0
          bVal = 0
      }
      
      // Handle string sorting
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      const comparison = (aVal ?? 0) < (bVal ?? 0) ? -1 : (aVal ?? 0) > (bVal ?? 0) ? 1 : 0
      return sortDirection === 'desc' ? -comparison : comparison
    }).map((entry, index) => ({ ...entry, rank: index + 1 }))
  }, [leaderboardData, filters, sortField, sortDirection])

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none"
      onClick={() => handleSortClick(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <span className="flex flex-col">
          <span className={`text-xs leading-none ${sortField === field && sortDirection === 'asc' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-gray-600'}`}>▲</span>
          <span className={`text-xs leading-none ${sortField === field && sortDirection === 'desc' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-gray-600'}`}>▼</span>
        </span>
      </div>
    </th>
  )



  // const getTraderIcon = (tier: 'S' | 'A' | 'B' | 'C' | 'F', seed: string) => {
  //   const style = tierIconMap[tier] || 'identicon'
  //   const backgroundColor = {
  //     'S': 'ffd700,ff6b6b,4ecdc4', // Gold/vibrant for elite
  //     'A': 'c0392b,e74c3c,3498db', // Red/blue for expert
  //     'B': 'f39c12,e67e22,2ecc71', // Orange/green for intermediate
  //     'C': '95a5a6,7f8c8d,34495e', // Gray for beginner
  //     'F': '2c3e50,34495e,7f8c8d'  // Dark gray for lowest
  //   }[tier] || '95a5a6,7f8c8d,34495e'
    
  //   return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${backgroundColor}&colorful=1`
  // }

  const getTierBadgeUrl = (tier: 'S' | 'A' | 'B' | 'C') => {
    return `https://api.dicebear.com/9.x/initials/svg?seed=${tier}`
  }

  // const getTierTooltipData = (tier: 'S' | 'A' | 'B' | 'C') => {
  //   const tierData = {
  //     'S': {
  //       name: "S Tier",
  //       designation: "Elite • Top 5% of investors • Returns ≥30% • Legendary status with exceptional market performance",
  //       image: getTierBadgeUrl('S')
  //     },
  //     'A': {
  //       name: "A Tier", 
  //       designation: "Expert • Strong performers • Returns 15-30% • Skilled traders with consistent profits",
  //       image: getTierBadgeUrl('A')
  //     },
  //     'B': {
  //       name: "B Tier",
  //       designation: "Intermediate • Steady growth • Returns 10-15% • Solid foundation with room for improvement", 
  //       image: getTierBadgeUrl('B')
  //     },
  //     'C': {
  //       name: "C Tier",
  //       designation: "Beginner • Learning phase • Returns 0-10% • Starting journey with basic market understanding",
  //       image: getTierBadgeUrl('C')
  //     }
  //   }
  //   return tierData[tier]
  // }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Leaderboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Compete with the best traders and climb the tier rankings based on your annual returns.
        </p>
        
        {/* GOATS with Animated Tooltips */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
            🏆 Hall of Fame
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-sm md:text-base px-4">
            Top performing traders leading the leaderboard
          </p>
          <div className="flex justify-center">
            <AnimatedTooltip 
              items={sortedAndFilteredData.slice(0, 6).map((user) => ({
                id: user.rank,
                name: user.username,
                designation: `Rank #${user.rank} • ${user.tier} Tier • ${(user.calculatedReturn !== undefined ? user.calculatedReturn : user.return).toFixed(1)}% Return`,
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`
              }))}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="flex justify-between items-center mb-6 md:hidden">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors min-h-[48px] shadow-sm"
          aria-label="Open filters"
        >
          <Filter className="h-5 w-5" />
          Filters
        </button>
        <button
          onClick={() => {
            setFilterSector('all')
            setFilterCompany('all')
            setFilterAsset('all')
            setPerformanceSinceDate('2025-06-16')
          }}
          className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors min-h-[48px]"
          aria-label="Reset filters"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      {/* Desktop Filters */}
      <div className="card mb-8 hidden md:block">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sector</label>
            <select 
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Filter by sector"
            >
              <option value="all">All Sectors</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Consumer">Consumer</option>
              <option value="Utilities">Utilities</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Company</label>
            <select 
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Filter by company"
            >
              <option value="all">All Companies</option>
              <option value="AAPL">Apple (AAPL)</option>
              <option value="TSLA">Tesla (TSLA)</option>
              <option value="MSFT">Microsoft (MSFT)</option>
              <option value="GOOGL">Google (GOOGL)</option>
              <option value="JPM">JPMorgan (JPM)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Asset Type</label>
            <select 
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Filter by asset type"
            >
              <option value="all">All Assets</option>
              <option value="stocks">Stocks</option>
              <option value="etfs">ETFs</option>
              <option value="options">Options</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Performance Since</label>
            <input
              type="date"
              value={performanceSinceDate}
              onChange={(e) => setPerformanceSinceDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Select performance start date"
            />
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <MobileFilters
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filterSector={filterSector}
        filterCompany={filterCompany}
        filterAsset={filterAsset}
        performanceSinceDate={performanceSinceDate}
        setFilterSector={setFilterSector}
        setFilterCompany={setFilterCompany}
        setFilterAsset={setFilterAsset}
        setPerformanceSinceDate={setPerformanceSinceDate}
        onApplyFilters={() => {}}
      />

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {sortedAndFilteredData.map((entry) => (
          <TraderCard
            key={entry.rank}
            entry={entry}
            isLoadingReturns={isLoadingReturns}
          />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <SortableHeader field="rank">Rank</SortableHeader>
                <SortableHeader field="username">Trader</SortableHeader>
                <SortableHeader field="return">Annual Return</SortableHeader>
                <SortableHeader field="tier">Tier</SortableHeader>
                <SortableHeader field="primaryStock">Primary Stock</SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Portfolio
                </th>
                <SortableHeader field="sector">Sector</SortableHeader>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedAndFilteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {isLoadingReturns ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span>Loading leaderboard data...</span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium">No traders found</p>
                        <p className="text-sm mt-1">Adjust your filters or check back later.</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                sortedAndFilteredData.map((entry) => (
                  <tr 
                    key={entry.rank} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        #{entry.rank}
                      </span>
                      {entry.rank <= 3 && (
                        <span className="ml-2 text-2xl">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      href={`/profile/${entry.username}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium min-h-[44px] flex items-center"
                      aria-label={`View ${entry.username}'s profile`}
                    >
                      {entry.username}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isLoadingReturns ? (
                      <div className="text-gray-500 text-sm">Calculating...</div>
                    ) : (
                      <span className={`text-2xl font-bold ${
                        (entry.calculatedReturn !== undefined ? entry.calculatedReturn : entry.return) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {(entry.calculatedReturn !== undefined ? entry.calculatedReturn : entry.return) >= 0 ? '+' : ''}
                        {(entry.calculatedReturn !== undefined ? entry.calculatedReturn : entry.return).toFixed(2)}%
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center">
                      <Image 
                        src={getTierBadgeUrl(entry.tier)}
                        alt={`${entry.tier} Tier`}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600"
                        title={`${entry.tier} Tier`}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-medium">
                    {entry.primaryStock}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {entry.portfolio.slice(0, 6).map((stock, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          {stock}
                        </span>
                      ))}
                      {entry.portfolio.length > 6 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          +{entry.portfolio.length - 6}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {entry.sector}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <FloatingActions
        onOpenFilters={() => setIsMobileFiltersOpen(true)}
        onResetFilters={() => {
          setFilterSector('all')
          setFilterCompany('all')
          setFilterAsset('all')
          setPerformanceSinceDate('2025-06-16')
        }}
      />

    </div>
  )
}