/**
 * Historical Data Integration
 * Simulates historical performance data for portfolio tracking
 */

import { Portfolio } from '@/lib/types/portfolio'

interface HistoricalDataPoint {
  date: string
  price: number
  volume: number
}

// interface PortfolioHistoricalData {
//   userId: string
//   symbol: string
//   data: HistoricalDataPoint[]
// }

/**
 * Generate realistic historical data for a stock symbol
 */
export function generateHistoricalData(
  symbol: string,
  startPrice: number,
  days: number = 365
): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = []
  let currentPrice = startPrice
  const volatility = getVolatilityForSymbol(symbol)
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    // Generate realistic price movement
    const randomChange = (Math.random() - 0.5) * 2 * volatility
    const trendFactor = getTrendFactor(symbol, i / days)
    currentPrice *= (1 + (randomChange + trendFactor) / 100)
    
    // Ensure price stays positive
    currentPrice = Math.max(currentPrice, 0.01)
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(currentPrice * 100) / 100,
      volume: Math.floor(Math.random() * 1000000) + 100000
    })
  }
  
  return data
}

/**
 * Calculate portfolio historical performance
 */
export function calculateHistoricalPerformance(
  portfolio: Portfolio,
  historicalData: Record<string, HistoricalDataPoint[]>
): { totalValue: number; totalReturn: number; totalReturnPercent: number } {
  let totalCurrentValue = 0
  const totalInvested = portfolio.positions.reduce((sum, pos) => sum + (pos.shares * pos.avgPrice), 0)
  
  portfolio.positions.forEach(position => {
    const stockHistory = historicalData[position.symbol]
    if (stockHistory && stockHistory.length > 0) {
      const currentPrice = stockHistory[stockHistory.length - 1].price
      totalCurrentValue += position.shares * currentPrice
    } else {
      // Fallback to average price if no historical data
      totalCurrentValue += position.shares * position.avgPrice
    }
  })
  
  const totalReturn = totalCurrentValue - totalInvested
  const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0
  
  return {
    totalValue: totalCurrentValue,
    totalReturn,
    totalReturnPercent
  }
}

/**
 * Get volatility percentage for different stock symbols
 */
function getVolatilityForSymbol(symbol: string): number {
  const volatilityMap: Record<string, number> = {
    // High volatility growth stocks
    'RKLB': 8, 'ASTS': 10, 'PLTR': 7, 'TSLA': 6, 'AMD': 5,
    // Medium volatility tech stocks
    'NVDA': 4, 'META': 4, 'MSFT': 3, 'GOOGL': 3, 'NOW': 5,
    // Lower volatility established stocks
    'AMZN': 3, 'UNH': 2, 'BRK.B': 2, 'AXON': 4,
    // Financial/fintech stocks
    'SOFI': 6, 'HOOD': 7, 'NU': 8, 'MSTR': 9,
    // Healthcare
    'HIMS': 6,
    // International
    'MELI': 5, 'MRVL': 4
  }
  
  return volatilityMap[symbol] || 4 // Default 4% daily volatility
}

/**
 * Get trend factor for stock performance over time
 */
function getTrendFactor(symbol: string, timeProgress: number): number {
  // timeProgress: 0 to 1 (start to end of period)
  
  const trendMap: Record<string, (t: number) => number> = {
    // Strong uptrend stocks
    'RKLB': (t) => 0.3 + Math.sin(t * Math.PI * 4) * 0.1, // 30% annual growth with cycles
    'ASTS': (t) => 0.25 + Math.sin(t * Math.PI * 3) * 0.15,
    'PLTR': (t) => 0.2 + Math.cos(t * Math.PI * 2) * 0.1,
    
    // Established growth
    'NVDA': (t) => 0.15 + Math.sin(t * Math.PI) * 0.05,
    'META': (t) => 0.12 + Math.cos(t * Math.PI * 1.5) * 0.03,
    'MSFT': (t) => 0.1 + Math.sin(t * Math.PI * 0.5) * 0.02,
    
    // Volatile growth
    'TSLA': (t) => 0.2 * Math.sin(t * Math.PI * 6) + 0.05,
    'MSTR': (t) => 0.4 * Math.sin(t * Math.PI * 8) - 0.1,
    
    // Steady growth
    'AMZN': (t) => 0.08 + Math.sin(t * Math.PI) * 0.02,
    'GOOGL': (t) => 0.09 + Math.cos(t * Math.PI) * 0.02,
    'UNH': (t) => 0.07 + Math.sin(t * Math.PI * 0.3) * 0.01,
    'BRK.B': () => 0.06 + Math.sin(timeProgress * Math.PI * 0.2) * 0.005
  }
  
  const trendFunction = trendMap[symbol] || (() => 0.05) // Default 5% annual growth
  return trendFunction(timeProgress)
}

/**
 * Create historical data cache for multiple symbols
 */
export function createHistoricalDataCache(
  portfolios: Record<string, Portfolio>,
  days: number = 365
): Record<string, HistoricalDataPoint[]> {
  const cache: Record<string, HistoricalDataPoint[]> = {}
  
  // Get all unique symbols from portfolios
  const allSymbols = new Set<string>()
  Object.values(portfolios).forEach(portfolio => {
    portfolio.positions.forEach(position => {
      allSymbols.add(position.symbol)
    })
  })
  
  // Generate historical data for each symbol
  Array.from(allSymbols).forEach(symbol => {
    const startPrice = getBasePrice(symbol)
    cache[symbol] = generateHistoricalData(symbol, startPrice, days)
  })
  
  return cache
}

/**
 * Get base price for stock symbol (simulated current prices)
 */
function getBasePrice(symbol: string): number {
  const basePrices: Record<string, number> = {
    'RKLB': 18.50, 'ASTS': 15.20, 'AMZN': 178.00, 'SOFI': 10.45, 'BRK.B': 455.00,
    'PLTR': 65.00, 'HOOD': 32.00, 'TSLA': 248.00, 'AMD': 142.00,
    'META': 582.00, 'MSTR': 425.00, 'MSFT': 435.00, 'HIMS': 13.20,
    'NVDA': 145.00, 'NU': 12.80, 'NOW': 1025.00, 'MELI': 2150.00,
    'UNH': 618.00, 'GOOGL': 186.00, 'MRVL': 102.00, 'AXON': 720.00
  }
  
  return basePrices[symbol] || 100 // Default price
}

/**
 * Performance analytics for a portfolio over time
 */
export interface PerformanceMetrics {
  maxDrawdown: number
  volatility: number
  sharpeRatio: number
  bestDay: number
  worstDay: number
  winRate: number
}

export function calculatePerformanceMetrics(
  historicalData: HistoricalDataPoint[]
): PerformanceMetrics {
  if (historicalData.length < 2) {
    return {
      maxDrawdown: 0,
      volatility: 0,
      sharpeRatio: 0,
      bestDay: 0,
      worstDay: 0,
      winRate: 0
    }
  }
  
  const dailyReturns = []
  let maxValue = historicalData[0].price
  let maxDrawdown = 0
  let upDays = 0
  
  for (let i = 1; i < historicalData.length; i++) {
    const prevPrice = historicalData[i - 1].price
    const currentPrice = historicalData[i].price
    const dailyReturn = (currentPrice - prevPrice) / prevPrice
    
    dailyReturns.push(dailyReturn)
    
    if (dailyReturn > 0) upDays++
    
    if (currentPrice > maxValue) {
      maxValue = currentPrice
    }
    
    const drawdown = (maxValue - currentPrice) / maxValue
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }
  
  const avgReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length
  const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length
  const volatility = Math.sqrt(variance) * Math.sqrt(252) // Annualized
  
  const riskFreeRate = 0.05 // 5% annual risk-free rate
  const sharpeRatio = volatility > 0 ? ((avgReturn * 252) - riskFreeRate) / volatility : 0
  
  const bestDay = Math.max(...dailyReturns)
  const worstDay = Math.min(...dailyReturns)
  const winRate = upDays / dailyReturns.length
  
  return {
    maxDrawdown: maxDrawdown * 100,
    volatility: volatility * 100,
    sharpeRatio,
    bestDay: bestDay * 100,
    worstDay: worstDay * 100,
    winRate: winRate * 100
  }
}