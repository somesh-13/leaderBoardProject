'use client'

import { useState } from 'react'
import { X, Filter, Calendar } from 'lucide-react'

interface MobileFiltersProps {
  isOpen: boolean
  onClose: () => void
  filterSector: string
  filterCompany: string
  filterAsset: string
  performanceSinceDate: string
  setFilterSector: (value: string) => void
  setFilterCompany: (value: string) => void
  setFilterAsset: (value: string) => void
  setTempPerformanceDate: (value: string) => void
  handleApplyPerformanceDate: () => void
  onApplyFilters: () => void
}

export default function MobileFilters({
  isOpen,
  onClose,
  filterSector,
  filterCompany,
  filterAsset,
  performanceSinceDate,
  setFilterSector,
  setFilterCompany,
  setFilterAsset,
  setTempPerformanceDate,
  handleApplyPerformanceDate,
  onApplyFilters
}: MobileFiltersProps) {
  const [tempFilters, setTempFilters] = useState({
    sector: filterSector,
    company: filterCompany,
    asset: filterAsset,
    date: performanceSinceDate
  })

  const handleApply = () => {
    setFilterSector(tempFilters.sector)
    setFilterCompany(tempFilters.company)
    setFilterAsset(tempFilters.asset)
    setTempPerformanceDate(tempFilters.date)
    handleApplyPerformanceDate()
    onApplyFilters()
    onClose()
  }

  const handleReset = () => {
    const resetFilters = {
      sector: 'all',
      company: 'all',
      asset: 'all',
      date: '2025-06-16'
    }
    setTempFilters(resetFilters)
    setFilterSector(resetFilters.sector)
    setFilterCompany(resetFilters.company)
    setFilterAsset(resetFilters.asset)
    setTempPerformanceDate(resetFilters.date)
    handleApplyPerformanceDate()
    onApplyFilters()
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Bottom Sheet Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 rounded-t-xl shadow-xl md:hidden transform transition-transform">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Filter Leaderboard
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close filters"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Sector Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sector
              </label>
              <select 
                value={tempFilters.sector}
                onChange={(e) => setTempFilters({...tempFilters, sector: e.target.value})}
                className="w-full py-3 px-4 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            {/* Company Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Stock
              </label>
              <select 
                value={tempFilters.company}
                onChange={(e) => setTempFilters({...tempFilters, company: e.target.value})}
                className="w-full py-3 px-4 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter by primary stock"
              >
                <option value="all">All Stocks</option>
                <option value="AAPL">Apple (AAPL)</option>
                <option value="TSLA">Tesla (TSLA)</option>
                <option value="MSFT">Microsoft (MSFT)</option>
                <option value="GOOGL">Google (GOOGL)</option>
                <option value="JPM">JPMorgan (JPM)</option>
                <option value="META">Meta (META)</option>
                <option value="NVDA">NVIDIA (NVDA)</option>
                <option value="PLTR">Palantir (PLTR)</option>
              </select>
            </div>

            {/* Asset Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Asset Type
              </label>
              <select 
                value={tempFilters.asset}
                onChange={(e) => setTempFilters({...tempFilters, asset: e.target.value})}
                className="w-full py-3 px-4 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter by asset type"
              >
                <option value="all">All Assets</option>
                <option value="stocks">Stocks</option>
                <option value="etfs">ETFs</option>
                <option value="options">Options</option>
              </select>
            </div>

            {/* Performance Since Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Performance Since
              </label>
              <input
                type="date"
                value={tempFilters.date}
                onChange={(e) => setTempFilters({...tempFilters, date: e.target.value})}
                max={new Date().toISOString().split('T')[0]}
                className="w-full py-3 px-4 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Select performance start date"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 px-4 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors min-h-[48px]"
              aria-label="Reset all filters"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-3 px-4 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors min-h-[48px]"
              aria-label="Apply filters"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  )
}