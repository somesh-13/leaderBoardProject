'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
  TooltipItem
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns'
import type { HistoricalDataPoint, TimeRange } from '@/lib/services/historicalPriceService'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

interface StockPriceChartProps {
  ticker: string
  data: HistoricalDataPoint[]
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  className?: string
}

const TIME_RANGE_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '1D', value: '1D' },
  { label: '5D', value: '5D' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
  { label: '2Y', value: '2Y' },
  { label: '5Y', value: '5Y' }
]

export default function StockPriceChart({ 
  ticker, 
  data, 
  timeRange, 
  onTimeRangeChange, 
  className = '' 
}: StockPriceChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [data])

  // Determine if the stock is up or down
  const firstPrice = data.length > 0 ? data[0].close : 0
  const lastPrice = data.length > 0 ? data[data.length - 1].close : 0
  const isPositive = lastPrice >= firstPrice
  const changePercent = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0

  // Chart data configuration
  const chartData = {
    labels: data.map(point => new Date(point.timestamp)),
    datasets: [
      {
        label: `${ticker} Price`,
        data: data.map(point => point.close),
        borderColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        backgroundColor: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2
      }
    ]
  }

  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (tooltipItems: TooltipItem<'line'>[]) => {
            const date = new Date(tooltipItems[0].parsed.x)
            return date.toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: timeRange === '1D' ? 'numeric' : undefined,
              minute: timeRange === '1D' ? '2-digit' : undefined
            })
          },
          label: (tooltipItem: TooltipItem<'line'>) => {
            const value = tooltipItem.parsed.y
            const dataPoint = data[tooltipItem.dataIndex]
            const lines = [
              `Price: $${value.toFixed(2)}`
            ]
            
            if (dataPoint) {
              lines.push(`Open: $${dataPoint.open.toFixed(2)}`)
              lines.push(`High: $${dataPoint.high.toFixed(2)}`)
              lines.push(`Low: $${dataPoint.low.toFixed(2)}`)
              lines.push(`Volume: ${dataPoint.volume.toLocaleString()}`)
            }
            
            return lines
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            minute: 'HH:mm',
            hour: 'MMM dd HH:mm',
            day: 'MMM dd',
            week: 'MMM dd',
            month: 'MMM yyyy',
            year: 'yyyy'
          }
        },
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          maxTicksLimit: 8
        }
      },
      y: {
        position: 'right',
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6B7280',
          callback: function(value) {
            return '$' + Number(value).toFixed(2)
          }
        }
      }
    },
    elements: {
      point: {
        hoverRadius: 8
      }
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Price Chart</h2>
          <div className="flex gap-1">
            {TIME_RANGE_OPTIONS.map(option => (
              <div
                key={option.value}
                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
        <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Loading chart...</div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Price Chart</h2>
          <div className="flex gap-1">
            {TIME_RANGE_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => onTimeRangeChange(option.value)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  timeRange === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-2">No chart data available</div>
            <div className="text-sm text-gray-400 dark:text-gray-500">Try selecting a different time range</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${className}`}>
      {/* Header with time range selector */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {ticker} Price Chart
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({timeRange})
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          {TIME_RANGE_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => onTimeRangeChange(option.value)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                timeRange === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>

      {/* Chart info */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{data.length} data points</span>
        <span>
          Range: ${Math.min(...data.map(d => d.low)).toFixed(2)} - ${Math.max(...data.map(d => d.high)).toFixed(2)}
        </span>
      </div>
    </div>
  )
}