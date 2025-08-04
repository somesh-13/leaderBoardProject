"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, ExternalLink, Copy, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Position {
  symbol: string
  shares: number
  avgPrice: number
  currentPrice: number
  return: number
}

interface PositionsTableProps {
  positions: Position[]
  isLoading?: boolean
  className?: string
}

export default function PositionsTable({ positions, isLoading = false, className }: PositionsTableProps) {
  const [sortField, setSortField] = useState<keyof Position>('symbol')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: keyof Position) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedPositions = [...positions].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    const modifier = sortDirection === 'asc' ? 1 : -1
    
    if (aValue < bValue) return -1 * modifier
    if (aValue > bValue) return 1 * modifier
    return 0
  })

  const formatCurrency = (value: number) => 
    `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const formatReturn = (value: number) => 
    `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

  const getReturnColor = (returnValue: number) => 
    returnValue >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'

  const getReturnIcon = (returnValue: number) => 
    returnValue >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex justify-between items-center py-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Current Positions</span>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{positions.length} positions</span>
            <button 
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th 
                  className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center gap-1">
                    Symbol
                    {sortField === 'symbol' && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-right py-3 px-2 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  onClick={() => handleSort('shares')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Shares
                    {sortField === 'shares' && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-right py-3 px-2 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  onClick={() => handleSort('avgPrice')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Avg Price
                    {sortField === 'avgPrice' && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-right py-3 px-2 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  onClick={() => handleSort('currentPrice')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Current
                    {sortField === 'currentPrice' && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-right py-3 px-2 font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  onClick={() => handleSort('return')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Return
                    {sortField === 'return' && (
                      <span className="text-blue-500">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPositions.map((position, index) => (
                <tr 
                  key={position.symbol} 
                  className={cn(
                    "border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group",
                    index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/25'
                  )}
                >
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {position.symbol}
                      </span>
                      <button 
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        aria-label={`View ${position.symbol} details`}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right font-mono text-sm">
                    {position.shares}
                  </td>
                  <td className="py-4 px-2 text-right font-mono text-sm">
                    {formatCurrency(position.avgPrice)}
                  </td>
                  <td className="py-4 px-2 text-right font-mono text-sm font-medium">
                    {formatCurrency(position.currentPrice)}
                  </td>
                  <td className={cn("py-4 px-2 text-right font-mono text-sm font-semibold", getReturnColor(position.return))}>
                    <div className="flex items-center justify-end gap-1">
                      {formatReturn(position.return)}
                      {getReturnIcon(position.return)}
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        aria-label={`Copy ${position.symbol}`}
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {sortedPositions.map((position) => (
            <div key={position.symbol} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                  {position.symbol}
                </span>
                <div className={cn("flex items-center gap-1 font-semibold", getReturnColor(position.return))}>
                  {formatReturn(position.return)}
                  {getReturnIcon(position.return)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Shares</p>
                  <p className="font-mono">{position.shares}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Avg Price</p>
                  <p className="font-mono">{formatCurrency(position.avgPrice)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Current</p>
                  <p className="font-mono font-medium">{formatCurrency(position.currentPrice)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Market Value</p>
                  <p className="font-mono">{formatCurrency(position.currentPrice * position.shares)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}