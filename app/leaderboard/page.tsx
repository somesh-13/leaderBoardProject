'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { Filter, RotateCcw } from 'lucide-react'
import { getPriceWithFallback, getMultipleHistoricalPrices } from '@/lib/finnhub'
import { AnimatedTooltip } from '@/components/ui/animated-tooltip'
import TraderCard from '@/components/leaderboard/TraderCard'
import MobileFilters from '@/components/leaderboard/MobileFilters'
import FloatingActions from '@/components/leaderboard/FloatingActions'

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

type SortField = 'rank' | 'username' | 'return' | 'tier' | 'primaryStock' | 'sector'
type SortDirection = 'asc' | 'desc'

export default function Leaderboard() {
  const [filterSector, setFilterSector] = useState('all')
  const [filterCompany, setFilterCompany] = useState('all')
  const [filterAsset, setFilterAsset] = useState('all')
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [isLoadingReturns, setIsLoadingReturns] = useState(true)
  const [performanceSinceDate, setPerformanceSinceDate] = useState(() => {
    // Default to June 16, 2025 (Monday - valid trading day) for demo purposes
    return '2025-06-16'
  })
  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Calculate tier based on return percentage - moved before usage
  const calculateTier = (returnValue: number): 'S' | 'A' | 'B' | 'C' => {
    if (returnValue >= 30) return 'S'
    if (returnValue >= 15) return 'A'  
    if (returnValue >= 10) return 'B'
    return 'C'
  }

  const mockData: LeaderboardEntry[] = useMemo(() => {
    const rawData = [
      { rank: 1, username: 'Matt', return: 45.2, sector: 'Technology', primaryStock: 'RKLB', portfolio: ['RKLB', 'AMZN', 'SOFI', 'ASTS', 'BRK.B', 'CELH', 'OSCR', 'EOG', 'BROS', 'ABCL'] },
      { rank: 2, username: 'Amit', return: 42.8, sector: 'Technology', primaryStock: 'PLTR', portfolio: ['PLTR', 'HOOD', 'TSLA', 'AMD', 'JPM', 'NBIS', 'GRAB', 'AAPL', 'V', 'DUOL'] },
      { rank: 3, username: 'Steve', return: 39.5, sector: 'Technology', primaryStock: 'META', portfolio: ['META', 'MSTR', 'MSFT', 'HIMS', 'AVGO', 'CRWD', 'NFLX', 'CRM', 'PYPL', 'MU'] },
      { rank: 4, username: 'Tannor', return: 37.1, sector: 'Technology', primaryStock: 'NVDA', portfolio: ['NVDA', 'NU', 'NOW', 'MELI', 'SHOP', 'TTD', 'ASML', 'APP', 'COIN', 'TSM'] },
      { rank: 5, username: 'Kris', return: 34.7, sector: 'Healthcare', primaryStock: 'UNH', portfolio: ['UNH', 'GOOGL', 'MRVL', 'AXON', 'ELF', 'ORCL', 'CSCO', 'LLY', 'NVO', 'TTWO'] },
      { rank: 6, username: 'TradeMaster', return: 22.5, sector: 'Technology', primaryStock: 'AAPL', portfolio: ['AAPL'] },
      { rank: 7, username: 'StockGuru', return: 18.2, sector: 'Technology', primaryStock: 'TSLA', portfolio: ['TSLA'] },
      { rank: 8, username: 'InvestPro', return: 15.7, sector: 'Healthcare', primaryStock: 'JNJ', portfolio: ['JNJ'] },
      { rank: 9, username: 'MarketWiz', return: 12.4, sector: 'Finance', primaryStock: 'JPM', portfolio: ['JPM'] },
      { rank: 10, username: 'BullRunner', return: 9.8, sector: 'Technology', primaryStock: 'MSFT', portfolio: ['MSFT'] },
    ]
    
    // Automatically calculate tiers based on returns
    return rawData.map(entry => ({
      ...entry,
      tier: calculateTier(entry.return)
    }))
  }, [calculateTier])

  // Calculate portfolio returns with equal $1,000 positions
  const calculatePortfolioReturn = useCallback(async (portfolio: string[]) => {
    try {
      // Get current prices
      const currentPrices: Record<string, number> = {}
      await Promise.all(
        portfolio.map(async (symbol) => {
          const { price } = await getPriceWithFallback(symbol)
          currentPrices[symbol] = price
        })
      )

      // Get historical prices
      const historicalPrices = await getMultipleHistoricalPrices(portfolio, performanceSinceDate)

      let initialTotal = 0
      let finalTotal = 0

      portfolio.forEach(symbol => {
        const currentPrice = currentPrices[symbol]
        const historicalPrice = historicalPrices[symbol]
        
        if (currentPrice && historicalPrice && historicalPrice > 0) {
          const investment = 1000 // $1,000 per stock
          const shares = investment / historicalPrice
          const finalValue = shares * currentPrice
          
          initialTotal += investment
          finalTotal += finalValue
        }
      })

      if (initialTotal > 0) {
        const portfolioPL = finalTotal - initialTotal
        const portfolioReturnPct = (portfolioPL / initialTotal) * 100
        return portfolioReturnPct
      }
      
      return 0
    } catch (error) {
      console.error('Error calculating portfolio return:', error)
      return 0
    }
  }, [performanceSinceDate])

  useEffect(() => {
    const calculateAllReturns = async () => {
      setIsLoadingReturns(true)
      
      const updatedData = await Promise.all(
        mockData.map(async (entry) => {
          const calculatedReturn = await calculatePortfolioReturn(entry.portfolio)
          return {
            ...entry,
            calculatedReturn
          }
        })
      )

      // Sort by calculated return and update ranks
      updatedData.sort((a, b) => (b.calculatedReturn || 0) - (a.calculatedReturn || 0))
      updatedData.forEach((entry, index) => {
        entry.rank = index + 1
      })

      setLeaderboardData(updatedData)
      setIsLoadingReturns(false)
    }

    calculateAllReturns()
    // eslint-disable-next-line react-hooks/exhaustive-deps  
  }, [performanceSinceDate])

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField, sortDirection])

  const sortedAndFilteredData = useMemo(() => {
    const data = (leaderboardData.length > 0 ? leaderboardData : mockData).filter(entry => {
      if (filterSector !== 'all' && entry.sector !== filterSector) return false
      if (filterCompany !== 'all' && entry.primaryStock !== filterCompany) return false
      return true
    })

    return [...data].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'rank':
          aValue = a.rank
          bValue = b.rank
          break
        case 'username':
          aValue = a.username.toLowerCase()
          bValue = b.username.toLowerCase()
          break
        case 'return':
          aValue = a.calculatedReturn !== undefined ? a.calculatedReturn : a.return
          bValue = b.calculatedReturn !== undefined ? b.calculatedReturn : b.return
          break
        case 'tier':
          const tierOrder = { 'S': 4, 'A': 3, 'B': 2, 'C': 1 }
          aValue = tierOrder[a.tier]
          bValue = tierOrder[b.tier]
          break
        case 'primaryStock':
          aValue = a.primaryStock.toLowerCase()
          bValue = b.primaryStock.toLowerCase()
          break
        case 'sector':
          aValue = a.sector.toLowerCase()
          bValue = b.sector.toLowerCase()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [leaderboardData, mockData, filterSector, filterCompany, sortField, sortDirection])

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none"
      onClick={() => handleSort(field)}
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

  // Tier-to-Icon Mapping based on Wall Street Bets documentation
  const tierIconMap = {
    'S': 'bottts',      // Bold and unique icons for top traders
    'A': 'avataaars',   // Clean avatars for high performers  
    'B': 'miniavs',     // Simplified but friendly avatars for solid performers
    'C': 'micah',       // Approachable, lighthearted icons for average entrants
    'F': 'identicon'    // Abstract/generic icons for lowest tier
  }

  const getTraderIcon = (tier: 'S' | 'A' | 'B' | 'C' | 'F', seed: string) => {
    const style = tierIconMap[tier] || 'identicon'
    const backgroundColor = {
      'S': 'ffd700,ff6b6b,4ecdc4', // Gold/vibrant for elite
      'A': 'c0392b,e74c3c,3498db', // Red/blue for expert
      'B': 'f39c12,e67e22,2ecc71', // Orange/green for intermediate
      'C': '95a5a6,7f8c8d,34495e', // Gray for beginner
      'F': '2c3e50,34495e,7f8c8d'  // Dark gray for lowest
    }[tier] || '95a5a6,7f8c8d,34495e'
    
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${backgroundColor}&colorful=1`
  }

  const getTierBadgeUrl = (tier: 'S' | 'A' | 'B' | 'C') => {
    return `https://api.dicebear.com/9.x/initials/svg?seed=${tier}`
  }

  const getTierTooltipData = (tier: 'S' | 'A' | 'B' | 'C', traderName: string) => {
    const tierData = {
      'S': {
        name: "S Tier",
        designation: "Elite • Top 5% of investors • Returns ≥30% • Legendary status with exceptional market performance",
        image: getTierBadgeUrl('S')
      },
      'A': {
        name: "A Tier", 
        designation: "Expert • Strong performers • Returns 15-30% • Skilled traders with consistent profits",
        image: getTierBadgeUrl('A')
      },
      'B': {
        name: "B Tier",
        designation: "Intermediate • Steady growth • Returns 10-15% • Solid foundation with room for improvement", 
        image: getTierBadgeUrl('B')
      },
      'C': {
        name: "C Tier",
        designation: "Beginner • Learning phase • Returns 0-10% • Starting journey with basic market understanding",
        image: getTierBadgeUrl('C')
      }
    }
    return tierData[tier]
  }

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
              {sortedAndFilteredData.map((entry) => (
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
                      <img 
                        src={getTierBadgeUrl(entry.tier)}
                        alt={`${entry.tier} Tier`}
                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600"
                        title={`${entry.tier} Tier`}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-medium">
                    {entry.primaryStock}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {entry.portfolio.slice(0, 3).map((stock, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          {stock}
                        </span>
                      ))}
                      {entry.portfolio.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          +{entry.portfolio.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {entry.sector}
                  </td>
                </tr>
              ))}
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