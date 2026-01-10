'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react'
import type { RevenueEstimatesData, RevenueDataPoint, RevenueMetrics } from '@/lib/types/earnings'

interface RevenueEstimatesChartProps {
  ticker: string
  companyName: string
  currentPrice?: number
}

export default function RevenueEstimatesChart({ ticker, companyName, currentPrice }: RevenueEstimatesChartProps) {
  const [viewType, setViewType] = useState<'quarterly' | 'yearly'>('quarterly')
  const [data, setData] = useState<RevenueEstimatesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null)

  // Fetch revenue data
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/earnings/${ticker}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch earnings data: ${response.status}`)
        }
        
        const revenueData: RevenueEstimatesData = await response.json()
        setData(revenueData)
        
        // Calculate metrics
        const currentData = viewType === 'quarterly' ? revenueData.quarterly : revenueData.yearly
        const historicalData = currentData.filter(d => d.isHistorical)
        const projectedData = currentData.filter(d => !d.isHistorical)
        
        if (currentData.length > 0) {
          const historicalPeak = Math.max(...historicalData.map(d => d.revenue), 0)
          const latestData = currentData[currentData.length - 1]
          const latestHistoricalData = historicalData[historicalData.length - 1]
          const firstProjectedData = projectedData[0]
          
          let growthRate = 0
          if (latestHistoricalData && firstProjectedData) {
            growthRate = ((firstProjectedData.revenue - latestHistoricalData.revenue) / latestHistoricalData.revenue) * 100
          }
          
          setMetrics({
            historicalPeak,
            latestRevenue: latestData?.revenue || 0,
            projectedGrowthRate: growthRate,
            latestPeriod: latestData?.period || ''
          })
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        console.error('Error fetching revenue data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (ticker) {
      fetchRevenueData()
    }
  }, [ticker])

  // Update metrics when view type changes
  useEffect(() => {
    if (data) {
      const currentData = viewType === 'quarterly' ? data.quarterly : data.yearly
      const historicalData = currentData.filter(d => d.isHistorical)
      const projectedData = currentData.filter(d => !d.isHistorical)
      
      if (currentData.length > 0) {
        const historicalPeak = Math.max(...historicalData.map(d => d.revenue), 0)
        const latestData = currentData[currentData.length - 1]
        const latestHistoricalData = historicalData[historicalData.length - 1]
        const firstProjectedData = projectedData[0]
        
        let growthRate = 0
        if (latestHistoricalData && firstProjectedData) {
          growthRate = ((firstProjectedData.revenue - latestHistoricalData.revenue) / latestHistoricalData.revenue) * 100
        }
        
        setMetrics({
          historicalPeak,
          latestRevenue: latestData?.revenue || 0,
          projectedGrowthRate: growthRate,
          latestPeriod: latestData?.period || ''
        })
      }
    }
  }, [viewType, data])

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as RevenueDataPoint
      const isProjected = !dataPoint.isHistorical
      
      return (
        <div className="bg-gray-900 dark:bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl">
          <p className="text-white font-semibold mb-2">
            {label}
            {isProjected && <span className="ml-2 text-xs text-blue-400">(Projected)</span>}
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-cyan-400">
                <DollarSign className="w-3 h-3" />
                Revenue
              </span>
              <span className="text-white font-medium">
                ${dataPoint.revenue >= 1000 
                  ? `${(dataPoint.revenue / 1000).toFixed(2)}B` 
                  : `${dataPoint.revenue.toFixed(0)}M`}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Revenue Estimates
        </h2>
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">Unable to load revenue data</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // No data state
  if (!data || (data.quarterly.length === 0 && data.yearly.length === 0)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Revenue Estimates
        </h2>
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No revenue data available for {ticker}</p>
          </div>
        </div>
      </div>
    )
  }

  const currentData = viewType === 'quarterly' ? data.quarterly : data.yearly
  
  // Format revenue for display
  const formatRevenue = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}B`
    }
    return `$${value.toFixed(0)}M`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Revenue Estimates
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.companyName} ({ticker})
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 inline-flex">
          <button
            onClick={() => setViewType('quarterly')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              viewType === 'quarterly'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Quarterly
          </button>
          <button
            onClick={() => setViewType('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              viewType === 'yearly'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/10 border border-cyan-200 dark:border-cyan-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-gray-600 dark:text-gray-400 text-xs font-medium">Historical Peak</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatRevenue(metrics.historicalPeak)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200 dark:border-blue-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-gray-600 dark:text-gray-400 text-xs font-medium">Latest {viewType === 'quarterly' ? 'Quarter' : 'Year'}</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatRevenue(metrics.latestRevenue)}
            </p>
            <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">{metrics.latestPeriod}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-200 dark:border-purple-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-gray-600 dark:text-gray-400 text-xs font-medium">Projected Growth</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.projectedGrowthRate > 0 ? '+' : ''}{metrics.projectedGrowthRate.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="period" 
              stroke="#9CA3AF"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              label={{ 
                value: 'Revenue ($M)', 
                angle: -90, 
                position: 'insideLeft', 
                fill: '#9CA3AF',
                style: { fontSize: 12 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="revenue"
              radius={[4, 4, 0, 0]}
            >
              {currentData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isHistorical ? '#22d3ee' : '#67e8f9'}
                  opacity={entry.isHistorical ? 1 : 0.6}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-300">Historical (Actual)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-300 opacity-60 rounded"></div>
            <span className="text-gray-600 dark:text-gray-300">Projected (Estimates)</span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-4 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-xs">
          Data sourced from company financial reports • Real historical data with analyst projections
        </p>
      </div>
    </div>
  )
}
