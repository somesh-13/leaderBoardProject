/**
 * Portfolio Symbols Utility
 * 
 * Extracts and manages stock symbols from portfolio data
 * Used to determine which symbols need price updates
 */

import { INITIAL_PORTFOLIOS } from '@/lib/data/initialPortfolios'
import type { Portfolio, Position } from '@/lib/types/portfolio'

/**
 * Get all unique symbols from all portfolios
 * Returns uppercase, deduplicated array of stock symbols
 */
export function selectAllPortfolioSymbols(): string[] {
  const symbolSet = new Set<string>()
  
  // Extract symbols from INITIAL_PORTFOLIOS object
  Object.values(INITIAL_PORTFOLIOS).forEach(portfolio => {
    portfolio.positions.forEach(position => {
      symbolSet.add(position.symbol.toUpperCase())
    })
  })
  
  const symbols = Array.from(symbolSet).sort()
  
  console.log(`📊 Collected ${symbols.length} unique portfolio symbols:`, symbols)
  
  return symbols
}

/**
 * Get symbols for a specific portfolio by username
 */
export function getPortfolioSymbols(username: string): string[] {
  const portfolio = Object.values(INITIAL_PORTFOLIOS).find(p => 
    p.username.toLowerCase() === username.toLowerCase()
  )
  
  if (!portfolio) {
    console.warn(`⚠️ Portfolio not found for username: ${username}`)
    return []
  }
  
  const symbols = portfolio.positions
    .map(pos => pos.symbol.toUpperCase())
    .sort()
  
  console.log(`📊 Portfolio symbols for ${username}:`, symbols)
  
  return symbols
}

/**
 * Get symbols from a list of portfolios
 * Useful for dynamic portfolio data
 */
export function extractSymbolsFromPortfolios(portfolios: Portfolio[]): string[] {
  const symbolSet = new Set<string>()
  
  portfolios.forEach(portfolio => {
    portfolio.positions.forEach(position => {
      symbolSet.add(position.symbol.toUpperCase())
    })
  })
  
  return Array.from(symbolSet).sort()
}

/**
 * Get symbols from a list of positions
 * Most granular extraction method
 */
export function extractSymbolsFromPositions(positions: Position[]): string[] {
  const symbolSet = new Set<string>()
  
  positions.forEach(position => {
    symbolSet.add(position.symbol.toUpperCase())
  })
  
  return Array.from(symbolSet).sort()
}

/**
 * Get symbols grouped by sector
 * Useful for sector-based analysis
 */
export function getSymbolsBySector(): Record<string, string[]> {
  const sectorMap: Record<string, string[]> = {}
  
  Object.values(INITIAL_PORTFOLIOS).forEach(portfolio => {
    portfolio.positions.forEach(position => {
      const sector = position.sector || 'Unknown'
      const symbol = position.symbol.toUpperCase()
      
      if (!sectorMap[sector]) {
        sectorMap[sector] = []
      }
      
      if (!sectorMap[sector].includes(symbol)) {
        sectorMap[sector].push(symbol)
      }
    })
  })
  
  // Sort symbols within each sector
  Object.keys(sectorMap).forEach(sector => {
    sectorMap[sector].sort()
  })
  
  console.log(`📊 Symbols by sector:`, Object.keys(sectorMap).map(sector => 
    `${sector}: ${sectorMap[sector].length} symbols`
  ))
  
  return sectorMap
}

/**
 * Get the most commonly held symbols across all portfolios
 * Returns symbols with their frequency count
 */
export function getMostCommonSymbols(): Array<{symbol: string, count: number}> {
  const symbolCounts = new Map<string, number>()
  
  Object.values(INITIAL_PORTFOLIOS).forEach(portfolio => {
    portfolio.positions.forEach(position => {
      const symbol = position.symbol.toUpperCase()
      symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1)
    })
  })
  
  const sorted = Array.from(symbolCounts.entries())
    .map(([symbol, count]) => ({ symbol, count }))
    .sort((a, b) => b.count - a.count)
  
  console.log(`📊 Most common symbols:`, sorted.slice(0, 10))
  
  return sorted
}

/**
 * Check if a symbol is held in any portfolio
 */
export function isSymbolHeld(symbol: string): boolean {
  const allSymbols = selectAllPortfolioSymbols()
  return allSymbols.includes(symbol.toUpperCase())
}

/**
 * Get portfolio usernames that hold a specific symbol
 */
export function getHoldersOfSymbol(symbol: string): string[] {
  const holders: string[] = []
  const upperSymbol = symbol.toUpperCase()
  
  Object.values(INITIAL_PORTFOLIOS).forEach(portfolio => {
    const hasSymbol = portfolio.positions.some(pos => 
      pos.symbol.toUpperCase() === upperSymbol
    )
    
    if (hasSymbol) {
      holders.push(portfolio.username)
    }
  })
  
  return holders.sort()
}

/**
 * Get summary statistics about portfolio symbols
 */
export function getSymbolStats(): {
  totalUniqueSymbols: number
  totalPositions: number
  avgPositionsPerPortfolio: number
  sectorsRepresented: number
  mostHeldSymbol: string
  mostHeldCount: number
} {
  const allSymbols = selectAllPortfolioSymbols()
  const totalPositions = Object.values(INITIAL_PORTFOLIOS)
    .reduce((sum, portfolio) => sum + portfolio.positions.length, 0)
  
  const portfolioCount = Object.keys(INITIAL_PORTFOLIOS).length
  const avgPositionsPerPortfolio = totalPositions / portfolioCount
  
  const sectorMap = getSymbolsBySector()
  const sectorsRepresented = Object.keys(sectorMap).length
  
  const commonSymbols = getMostCommonSymbols()
  const mostHeld = commonSymbols[0] || { symbol: 'N/A', count: 0 }
  
  return {
    totalUniqueSymbols: allSymbols.length,
    totalPositions,
    avgPositionsPerPortfolio: Math.round(avgPositionsPerPortfolio * 10) / 10,
    sectorsRepresented,
    mostHeldSymbol: mostHeld.symbol,
    mostHeldCount: mostHeld.count
  }
}