/**
 * Centralized Portfolio Calculations
 * 
 * All portfolio metrics, returns, and performance calculations
 * Used by the global state and components
 */

import { 
  Position, 
  StockData, 
  PortfolioMetrics, 
  PortfolioCalculationInput,
  Portfolio 
} from '@/lib/types/portfolio'

export interface PositionMetrics {
  symbol: string
  shares: number
  avgPrice: number
  currentPrice: number
  currentValue: number
  invested: number
  unrealizedGain: number
  unrealizedGainPercent: number
  sinceDateGain: number
  sinceDateGainPercent: number
  dayChange: number
  dayChangePercent: number
  dayChangeValue: number
}

/**
 * Calculate metrics for a single position
 */
export function calculatePositionMetrics(
  position: Position,
  stockData: StockData,
  historicalPrice?: number
): PositionMetrics {
  const currentPrice = stockData.price || 0
  // Use historical price from stock data if available, then fallback to parameter, then previous close
  const basePrice = stockData.historicalPrice || historicalPrice || stockData.previousClose || currentPrice
  const previousClose = stockData.previousClose || currentPrice
  const currentValue = position.shares * currentPrice
  const invested = position.shares * position.avgPrice
  
  // Calculate performance since the selected date (using basePrice)
  const sinceDateValue = position.shares * basePrice
  const sinceDateGain = currentValue - sinceDateValue
  const sinceDateGainPercent = sinceDateValue > 0 ? (sinceDateGain / sinceDateValue) * 100 : 0
  
  // Keep original unrealized gain calculation based on purchase price
  const unrealizedGain = currentValue - invested
  const unrealizedGainPercent = invested > 0 ? (unrealizedGain / invested) * 100 : 0
  
  const dayPriceChange = currentPrice - previousClose
  const dayChangePercent = previousClose > 0 ? (dayPriceChange / previousClose) * 100 : 0
  const dayChangeValue = position.shares * dayPriceChange

  return {
    symbol: position.symbol,
    shares: position.shares,
    avgPrice: position.avgPrice,
    currentPrice,
    currentValue,
    invested,
    unrealizedGain,
    unrealizedGainPercent,
    sinceDateGain,
    sinceDateGainPercent,
    dayChange: dayPriceChange,
    dayChangePercent,
    dayChangeValue
  }
}

/**
 * Calculate comprehensive portfolio metrics
 */
export function calculatePortfolioMetrics(
  input: PortfolioCalculationInput
): PortfolioMetrics {
  const { positions, stockPrices, historicalPrices = {} } = input
  
  let totalValue = 0
  let totalInvested = 0
  let totalDayChange = 0
  let positionMetrics: PositionMetrics[] = []
  
  // Calculate metrics for each position
  positions.forEach(position => {
    const stockData = stockPrices[position.symbol]
    if (!stockData) {
      console.warn(`⚠️ No stock data found for ${position.symbol}`)
      return
    }
    
    const historicalPrice = historicalPrices[position.symbol]
    const metrics = calculatePositionMetrics(position, stockData, historicalPrice)
    
    positionMetrics.push(metrics)
    totalValue += metrics.currentValue
    totalInvested += metrics.invested
    totalDayChange += metrics.dayChangeValue
  })
  
  // Calculate portfolio-level metrics
  const totalReturn = totalValue - totalInvested
  const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0
  const dayChangePercent = totalValue > 0 ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0
  
  // Calculate since-date performance for the portfolio
  let totalSinceDateValue = 0
  positionMetrics.forEach(metrics => {
    totalSinceDateValue += metrics.sinceDateGain
  })
  const totalSinceDatePercent = totalValue > 0 ? (totalSinceDateValue / (totalValue - totalSinceDateValue)) * 100 : 0
  
  // Find best and worst performers based on since-date performance
  const sortedByReturn = [...positionMetrics].sort((a, b) => b.sinceDateGainPercent - a.sinceDateGainPercent)
  
  const topPerformer = sortedByReturn.length > 0 
    ? { symbol: sortedByReturn[0].symbol, return: sortedByReturn[0].sinceDateGainPercent }
    : { symbol: '', return: 0 }
    
  const worstPerformer = sortedByReturn.length > 0
    ? { symbol: sortedByReturn[sortedByReturn.length - 1].symbol, return: sortedByReturn[sortedByReturn.length - 1].sinceDateGainPercent }
    : { symbol: '', return: 0 }

  return {
    totalValue,
    totalInvested,
    totalReturn,
    totalReturnPercent,
    totalSinceDateReturn: totalSinceDateValue,
    totalSinceDatePercent,
    dayChange: totalDayChange,
    dayChangePercent,
    topPerformer,
    worstPerformer
  }
}

/**
 * Calculate tier based on return percentage
 */
export function calculateTier(returnPercent: number): 'S' | 'A' | 'B' | 'C' {
  if (returnPercent >= 30) return 'S'
  if (returnPercent >= 15) return 'A'
  if (returnPercent >= 5) return 'B'
  return 'C'
}

/**
 * Determine primary sector from positions
 */
export function calculatePrimarySector(positions: Position[]): string {
  const sectorWeights: Record<string, number> = {}
  
  positions.forEach(position => {
    const sector = position.sector || 'Technology' // Default sector
    const value = position.shares * position.avgPrice
    sectorWeights[sector] = (sectorWeights[sector] || 0) + value
  })
  
  // Find sector with highest weight
  let primarySector = 'Technology'
  let maxWeight = 0
  
  Object.entries(sectorWeights).forEach(([sector, weight]) => {
    if (weight > maxWeight) {
      maxWeight = weight
      primarySector = sector
    }
  })
  
  return primarySector
}

/**
 * Determine primary stock (largest position by value)
 */
export function calculatePrimaryStock(
  positions: Position[],
  stockPrices: Record<string, StockData>
): string {
  let primaryStock = positions[0]?.symbol || ''
  let maxValue = 0
  
  positions.forEach(position => {
    const stockData = stockPrices[position.symbol]
    if (!stockData) return
    
    const value = position.shares * stockData.price
    if (value > maxValue) {
      maxValue = value
      primaryStock = position.symbol
    }
  })
  
  return primaryStock
}

/**
 * Calculate complete portfolio from positions and stock data
 */
export function calculateCompletePortfolio(
  userId: string,
  username: string,
  positions: Position[],
  stockPrices: Record<string, StockData>,
  historicalPrices?: Record<string, number>
): Portfolio {
  const metrics = calculatePortfolioMetrics({
    positions,
    stockPrices,
    historicalPrices
  })
  
  const tier = calculateTier(metrics.totalReturnPercent)
  const sector = calculatePrimarySector(positions)
  const primaryStock = calculatePrimaryStock(positions, stockPrices)
  
  return {
    userId,
    username,
    positions,
    totalValue: metrics.totalValue,
    totalInvested: metrics.totalInvested,
    totalReturn: metrics.totalReturn,
    totalReturnPercent: metrics.totalReturnPercent,
    dayChange: metrics.dayChange,
    dayChangePercent: metrics.dayChangePercent,
    tier,
    sector,
    primaryStock,
    lastCalculated: Date.now()
  }
}

/**
 * Format currency values
 */
export function formatCurrency(value: number, options: { 
  compact?: boolean 
  showSign?: boolean 
} = {}): string {
  const { compact = false, showSign = false } = options
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short'
  })
  
  let formatted = formatter.format(Math.abs(value))
  
  if (showSign) {
    const sign = value >= 0 ? '+' : '-'
    formatted = sign + formatted
  } else if (value < 0) {
    formatted = '-' + formatted
  }
  
  return formatted
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, options: {
  decimals?: number
  showSign?: boolean
} = {}): string {
  const { decimals = 2, showSign = false } = options
  
  const formatted = Math.abs(value).toFixed(decimals) + '%'
  
  if (showSign) {
    const sign = value >= 0 ? '+' : '-'
    return sign + formatted
  }
  
  return value < 0 ? '-' + formatted : formatted
}

/**
 * Calculate portfolio diversity score (0-100)
 */
export function calculateDiversityScore(positions: Position[]): number {
  if (positions.length <= 1) return 0
  
  // Calculate based on:
  // 1. Number of positions (more = better)
  // 2. Even distribution of position sizes
  // 3. Sector diversity (if available)
  
  const positionCount = positions.length
  const maxPositions = 20 // Ideal number of positions
  const positionScore = Math.min(positionCount / maxPositions, 1) * 40
  
  // Calculate concentration (lower concentration = better diversity)
  const totalValue = positions.reduce((sum, pos) => sum + (pos.shares * pos.avgPrice), 0)
  const positionWeights = positions.map(pos => (pos.shares * pos.avgPrice) / totalValue)
  
  // Herfindahl index (lower = more diverse)
  const herfindahlIndex = positionWeights.reduce((sum, weight) => sum + weight * weight, 0)
  const concentrationScore = (1 - herfindahlIndex) * 60
  
  return Math.round(positionScore + concentrationScore)
}

/**
 * Test helper for validating calculations
 */
export function runPortfolioCalculationTests(): boolean {
  console.log('🧪 Running portfolio calculation tests...')
  
  // Test data
  const testPositions: Position[] = [
    { symbol: 'AAPL', shares: 10, avgPrice: 150 },
    { symbol: 'GOOGL', shares: 2, avgPrice: 2500 }
  ]
  
  const testStockPrices: Record<string, StockData> = {
    'AAPL': { 
      symbol: 'AAPL', 
      price: 180, 
      change: 5, 
      changePercent: 2.86,
      previousClose: 175,
      lastUpdated: Date.now()
    },
    'GOOGL': { 
      symbol: 'GOOGL', 
      price: 2600, 
      change: -50, 
      changePercent: -1.89,
      previousClose: 2650,
      lastUpdated: Date.now()
    }
  }
  
  const metrics = calculatePortfolioMetrics({
    positions: testPositions,
    stockPrices: testStockPrices
  })
  
  // Verify calculations
  const expectedTotalValue = (10 * 180) + (2 * 2600) // 1800 + 5200 = 7000
  const expectedTotalInvested = (10 * 150) + (2 * 2500) // 1500 + 5000 = 6500
  const expectedReturn = expectedTotalValue - expectedTotalInvested // 500
  const expectedReturnPercent = (500 / 6500) * 100 // ~7.69%
  
  const tests = [
    { name: 'Total Value', actual: metrics.totalValue, expected: expectedTotalValue },
    { name: 'Total Invested', actual: metrics.totalInvested, expected: expectedTotalInvested },
    { name: 'Total Return', actual: metrics.totalReturn, expected: expectedReturn },
    { name: 'Return Percent', actual: Math.round(metrics.totalReturnPercent * 100) / 100, expected: Math.round(expectedReturnPercent * 100) / 100 }
  ]
  
  let allPassed = true
  tests.forEach(test => {
    const passed = Math.abs(test.actual - test.expected) < 0.01
    console.log(`${passed ? '✅' : '❌'} ${test.name}: ${test.actual} (expected ${test.expected})`)
    if (!passed) allPassed = false
  })
  
  console.log(`🧪 Portfolio calculation tests ${allPassed ? 'PASSED' : 'FAILED'}`)
  return allPassed
}

// Run tests in development
if (process.env.NODE_ENV === 'development') {
  runPortfolioCalculationTests()
}