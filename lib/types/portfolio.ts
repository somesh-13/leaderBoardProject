/**
 * Portfolio and Stock Data Types
 * 
 * Centralized type definitions for the leaderboard application
 */

export interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
  lastUpdated: number
  volume?: number
  high?: number
  low?: number
  open?: number
  previousClose?: number
}

export interface Position {
  symbol: string
  shares: number
  avgPrice: number
  datePurchased?: string
  sector?: string
}

export interface Portfolio {
  userId: string
  username: string
  positions: Position[]
  totalValue: number
  totalInvested: number
  totalReturn: number
  totalReturnPercent: number
  dayChange: number
  dayChangePercent: number
  tier: 'S' | 'A' | 'B' | 'C'
  sector: string
  primaryStock: string
  lastCalculated: number
}

export interface LeaderboardEntry {
  rank: number
  username: string
  return: number
  calculatedReturn?: number
  tier: 'S' | 'A' | 'B' | 'C'
  sector: string
  primaryStock: string
  portfolio: string[]
  totalValue?: number
  dayChange?: number
  positions?: Position[]
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: number
}

export interface StockPriceRequest {
  symbols: string[]
  includeDetails?: boolean
}

export interface StockPriceResponse {
  [symbol: string]: StockData
}

export interface PortfolioCalculationInput {
  positions: Position[]
  stockPrices: Record<string, StockData>
  historicalPrices?: Record<string, number>
}

export interface PortfolioMetrics {
  totalValue: number
  totalInvested: number
  totalReturn: number
  totalReturnPercent: number
  dayChange: number
  dayChangePercent: number
  topPerformer: {
    symbol: string
    return: number
  }
  worstPerformer: {
    symbol: string
    return: number
  }
}

export type SortField = 'rank' | 'username' | 'return' | 'tier' | 'primaryStock' | 'sector' | 'totalValue'
export type SortDirection = 'asc' | 'desc'

export interface FilterState {
  sector: string
  company: string
  asset: string
  tier?: string
  minReturn?: number
  maxReturn?: number
}