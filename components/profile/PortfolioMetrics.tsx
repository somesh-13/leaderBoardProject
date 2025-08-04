"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Metric } from '@/components/ui/metric'
import { cn } from '@/lib/utils'

interface PortfolioMetricsProps {
  totalValue: number
  dayChange: number
  totalReturn: number
  isLoading?: boolean
  className?: string
}

export default function PortfolioMetrics({ 
  totalValue, 
  dayChange, 
  totalReturn, 
  isLoading = false,
  className 
}: PortfolioMetricsProps) {
  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="text-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-l-4 border-l-blue-500", className)}>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
          <Metric
            label="Total Portfolio Value"
            value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            size="lg"
            tooltip="Current market value of all positions"
            className="md:px-4"
          />
          
          <Metric
            label="Day Change"
            value={`${dayChange >= 0 ? '+' : ''}${dayChange.toFixed(2)}%`}
            change={dayChange}
            trend={dayChange >= 0 ? 'up' : 'down'}
            size="lg"
            tooltip="Portfolio performance today"
            className="pt-6 md:pt-0 md:px-4"
          />
          
          <Metric
            label="Total Return"
            value={`${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%`}
            change={totalReturn}
            trend={totalReturn >= 0 ? 'up' : 'down'}
            size="lg"
            tooltip="Total portfolio performance since inception"
            className="pt-6 md:pt-0 md:px-4"
          />
        </div>
        
        {/* Performance Indicator Bar */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Portfolio Performance</span>
            <span className={cn(
              "font-medium",
              totalReturn >= 30 ? "text-green-600 dark:text-green-400" :
              totalReturn >= 15 ? "text-yellow-600 dark:text-yellow-400" :
              totalReturn >= 0 ? "text-blue-600 dark:text-blue-400" :
              "text-red-600 dark:text-red-400"
            )}>
              {totalReturn >= 30 ? "Exceptional" :
               totalReturn >= 15 ? "Strong" :
               totalReturn >= 0 ? "Positive" :
               "Needs Improvement"}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-500 ease-out",
                totalReturn >= 30 ? "bg-green-500" :
                totalReturn >= 15 ? "bg-yellow-500" :
                totalReturn >= 0 ? "bg-blue-500" :
                "bg-red-500"
              )}
              style={{ 
                width: `${Math.min(Math.max((totalReturn + 20) * 2, 5), 100)}%` 
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}