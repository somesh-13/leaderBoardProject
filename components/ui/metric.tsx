"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricProps {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  className?: string
  size?: 'sm' | 'md' | 'lg'
  tooltip?: string
}

export function Metric({ 
  label, 
  value, 
  change, 
  trend, 
  className, 
  size = 'md',
  tooltip 
}: MetricProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })
    }
    return val
  }

  const getTrendColor = () => {
    if (trend === 'up' || (typeof change === 'number' && change > 0)) {
      return 'text-green-600 dark:text-green-400'
    }
    if (trend === 'down' || (typeof change === 'number' && change < 0)) {
      return 'text-red-600 dark:text-red-400'
    }
    return 'text-gray-900 dark:text-white'
  }

  const getTrendIcon = () => {
    if (trend === 'up' || (typeof change === 'number' && change > 0)) {
      return <TrendingUp className="h-4 w-4" />
    }
    if (trend === 'down' || (typeof change === 'number' && change < 0)) {
      return <TrendingDown className="h-4 w-4" />
    }
    return null
  }

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  return (
    <div className={cn("text-center", className)} title={tooltip}>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </p>
      <div className="flex items-center justify-center gap-2">
        <p className={cn(
          "font-bold",
          sizeClasses[size],
          getTrendColor()
        )}>
          {formatValue(value)}
        </p>
        {getTrendIcon()}
      </div>
      {change !== undefined && (
        <p className={cn(
          "text-sm font-medium mt-1",
          getTrendColor()
        )}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}%
        </p>
      )}
    </div>
  )
}