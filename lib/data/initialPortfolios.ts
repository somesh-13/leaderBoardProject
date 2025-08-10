/**
 * Initial Portfolio Data Structure
 * Pre-calculated performance data to eliminate loading loops
 */

import { Portfolio } from '@/lib/types/portfolio'

export const INITIAL_PORTFOLIOS: Record<string, Portfolio> = {
  'matt': {
    userId: 'matt',
    username: 'Matt',
    positions: [
      { symbol: 'RKLB', shares: 100, avgPrice: 26.55, sector: 'Aerospace' },
      { symbol: 'AMZN', shares: 5, avgPrice: 216.10, sector: 'Technology' },
      { symbol: 'SOFI', shares: 200, avgPrice: 14.90, sector: 'Financial' },
      { symbol: 'ASTS', shares: 150, avgPrice: 41.91, sector: 'Aerospace' },
      { symbol: 'BRK.B', shares: 10, avgPrice: 490.23, sector: 'Financial' },
      { symbol: 'CELH', shares: 25, avgPrice: 43.49, sector: 'Consumer' },
      { symbol: 'OSCR', shares: 80, avgPrice: 14.95, sector: 'Healthcare' },
      { symbol: 'EOG', shares: 30, avgPrice: 123.18, sector: 'Energy' },
      { symbol: 'BROS', shares: 45, avgPrice: 70.81, sector: 'Consumer' },
      { symbol: 'ABCL', shares: 120, avgPrice: 3.16, sector: 'Healthcare' }
    ],
    totalValue: 22750.00,
    totalInvested: 10000.00,
    totalReturn: 12750.00,
    totalReturnPercent: 127.5,
    dayChange: 345.60,
    dayChangePercent: 1.54,
    tier: 'S' as const,
    sector: 'Aerospace',
    primaryStock: 'RKLB',
    lastCalculated: Date.now()
  },
  'amit': {
    userId: 'amit',
    username: 'Amit',
    positions: [
      { symbol: 'PLTR', shares: 50, avgPrice: 141.41, sector: 'Technology' },
      { symbol: 'HOOD', shares: 75, avgPrice: 76.75, sector: 'Financial' },
      { symbol: 'TSLA', shares: 8, avgPrice: 329.13, sector: 'Automotive' },
      { symbol: 'AMD', shares: 25, avgPrice: 126.39, sector: 'Technology' },
      { symbol: 'JPM', shares: 15, avgPrice: 270.36, sector: 'Financial' },
      { symbol: 'NBIS', shares: 200, avgPrice: 50.46, sector: 'Technology' },
      { symbol: 'GRAB', shares: 180, avgPrice: 4.71, sector: 'Technology' },
      { symbol: 'AAPL', shares: 12, avgPrice: 198.42, sector: 'Technology' },
      { symbol: 'V', shares: 8, avgPrice: 355.48, sector: 'Financial' },
      { symbol: 'DUOL', shares: 35, avgPrice: 474.90, sector: 'Technology' }
    ],
    totalValue: 28950.00,
    totalInvested: 10000.00,
    totalReturn: 18950.00,
    totalReturnPercent: 189.5,
    dayChange: -234.50,
    dayChangePercent: -0.81,
    tier: 'S' as const,
    sector: 'Technology',
    primaryStock: 'PLTR',
    lastCalculated: Date.now()
  },
  'steve': {
    userId: 'steve',
    username: 'Steve',
    positions: [
      { symbol: 'META', shares: 15, avgPrice: 702.12, sector: 'Technology' },
      { symbol: 'MSTR', shares: 12, avgPrice: 382.25, sector: 'Technology' },
      { symbol: 'MSFT', shares: 20, avgPrice: 479.14, sector: 'Technology' },
      { symbol: 'HIMS', shares: 400, avgPrice: 59.78, sector: 'Healthcare' },
      { symbol: 'AVGO', shares: 6, avgPrice: 252.10, sector: 'Technology' },
      { symbol: 'CRWD', shares: 18, avgPrice: 479.39, sector: 'Technology' },
      { symbol: 'NFLX', shares: 9, avgPrice: 1225.35, sector: 'Technology' },
      { symbol: 'CRM', shares: 22, avgPrice: 263.88, sector: 'Technology' },
      { symbol: 'PYPL', shares: 35, avgPrice: 72.26, sector: 'Financial' },
      { symbol: 'MU', shares: 45, avgPrice: 119.84, sector: 'Technology' }
    ],
    totalValue: 31200.00,
    totalInvested: 10000.00,
    totalReturn: 21200.00,
    totalReturnPercent: 212.0,
    dayChange: 156.75,
    dayChangePercent: 0.50,
    tier: 'S' as const,
    sector: 'Technology',
    primaryStock: 'META',
    lastCalculated: Date.now()
  },
  'tannor': {
    userId: 'tannor',
    username: 'Tannor',
    positions: [
      { symbol: 'NVDA', shares: 6, avgPrice: 144.69, sector: 'Technology' },
      { symbol: 'NU', shares: 300, avgPrice: 12.39, sector: 'Financial' },
      { symbol: 'NOW', shares: 4, avgPrice: 1005.13, sector: 'Technology' },
      { symbol: 'MELI', shares: 2, avgPrice: 2454.76, sector: 'Technology' },
      { symbol: 'SHOP', shares: 12, avgPrice: 108.37, sector: 'Technology' },
      { symbol: 'TTD', shares: 28, avgPrice: 70.25, sector: 'Technology' },
      { symbol: 'ASML', shares: 3, avgPrice: 775.23, sector: 'Technology' },
      { symbol: 'APP', shares: 60, avgPrice: 370.68, sector: 'Technology' },
      { symbol: 'COIN', shares: 25, avgPrice: 261.57, sector: 'Financial' },
      { symbol: 'TSM', shares: 40, avgPrice: 215.68, sector: 'Technology' }
    ],
    totalValue: 26480.00,
    totalInvested: 10000.00,
    totalReturn: 16480.00,
    totalReturnPercent: 164.8,
    dayChange: 387.20,
    dayChangePercent: 1.48,
    tier: 'S' as const,
    sector: 'Technology',
    primaryStock: 'NVDA',
    lastCalculated: Date.now()
  },
  'kris': {
    userId: 'kris',
    username: 'Kris',
    positions: [
      { symbol: 'UNH', shares: 8, avgPrice: 307.66, sector: 'Healthcare' },
      { symbol: 'GOOGL', shares: 10, avgPrice: 176.77, sector: 'Technology' },
      { symbol: 'MRVL', shares: 50, avgPrice: 70.42, sector: 'Technology' },
      { symbol: 'AXON', shares: 25, avgPrice: 780.61, sector: 'Technology' },
      { symbol: 'ELF', shares: 85, avgPrice: 126.21, sector: 'Consumer' },
      { symbol: 'ORCL', shares: 35, avgPrice: 211.10, sector: 'Technology' },
      { symbol: 'CSCO', shares: 60, avgPrice: 65.51, sector: 'Technology' },
      { symbol: 'LLY', shares: 4, avgPrice: 807.58, sector: 'Healthcare' },
      { symbol: 'NVO', shares: 20, avgPrice: 77.02, sector: 'Healthcare' },
      { symbol: 'TTWO', shares: 40, avgPrice: 238.60, sector: 'Technology' }
    ],
    totalValue: 25350.00,
    totalInvested: 10000.00,
    totalReturn: 15350.00,
    totalReturnPercent: 153.5,
    dayChange: 289.45,
    dayChangePercent: 1.15,
    tier: 'S' as const,
    sector: 'Technology',
    primaryStock: 'UNH',
    lastCalculated: Date.now()
  }
}

/**
 * Generate initial portfolio with realistic performance data
 */
export function generateInitialPortfolio(
  userId: string,
  username: string,
  stockSymbols: string[],
  targetReturn: number
): Portfolio {
  const positions = stockSymbols.map(symbol => ({
    symbol,
    shares: Math.floor(Math.random() * 100) + 50,
    avgPrice: Math.floor(Math.random() * 200) + 50,
    sector: getSectorForSymbol(symbol)
  }))

  const totalInvested = positions.reduce((sum, pos) => sum + (pos.shares * pos.avgPrice), 0)
  const totalValue = totalInvested * (1 + targetReturn / 100)
  const totalReturn = totalValue - totalInvested

  return {
    userId,
    username,
    positions,
    totalValue,
    totalInvested,
    totalReturn,
    totalReturnPercent: targetReturn,
    dayChange: (Math.random() - 0.5) * 200,
    dayChangePercent: (Math.random() - 0.5) * 4,
    tier: calculateTier(targetReturn),
    sector: getMostCommonSector(positions),
    primaryStock: positions[0].symbol,
    lastCalculated: Date.now()
  }
}

function getSectorForSymbol(symbol: string): string {
  const sectorMap: Record<string, string> = {
    // Aerospace
    'RKLB': 'Aerospace', 'ASTS': 'Aerospace',
    
    // Technology
    'AMZN': 'Technology', 'PLTR': 'Technology', 'META': 'Technology', 'MSTR': 'Technology',
    'MSFT': 'Technology', 'NVDA': 'Technology', 'NOW': 'Technology', 'GOOGL': 'Technology',
    'MRVL': 'Technology', 'AXON': 'Technology', 'AMD': 'Technology', 'MELI': 'Technology',
    'NBIS': 'Technology', 'GRAB': 'Technology', 'AAPL': 'Technology', 'DUOL': 'Technology',
    'AVGO': 'Technology', 'CRWD': 'Technology', 'NFLX': 'Technology', 'CRM': 'Technology',
    'MU': 'Technology', 'SHOP': 'Technology', 'TTD': 'Technology', 'ASML': 'Technology',
    'APP': 'Technology', 'TSM': 'Technology', 'ORCL': 'Technology', 'CSCO': 'Technology',
    'TTWO': 'Technology',
    
    // Financial
    'SOFI': 'Financial', 'HOOD': 'Financial', 'NU': 'Financial', 'BRK.B': 'Financial',
    'JPM': 'Financial', 'V': 'Financial', 'PYPL': 'Financial', 'COIN': 'Financial',
    
    // Healthcare
    'HIMS': 'Healthcare', 'UNH': 'Healthcare', 'OSCR': 'Healthcare', 'ABCL': 'Healthcare',
    'LLY': 'Healthcare', 'NVO': 'Healthcare',
    
    // Consumer
    'CELH': 'Consumer', 'BROS': 'Consumer', 'ELF': 'Consumer',
    
    // Energy
    'EOG': 'Energy',
    
    // Automotive
    'TSLA': 'Automotive'
  }
  return sectorMap[symbol] || 'Technology'
}

function getMostCommonSector(positions: { sector: string }[]): string {
  const sectorCount = positions.reduce((acc, pos) => {
    acc[pos.sector] = (acc[pos.sector] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(sectorCount)
    .sort(([,a], [,b]) => b - a)[0][0]
}

function calculateTier(returnPercent: number): 'S' | 'A' | 'B' | 'C' {
  if (returnPercent >= 40) return 'S'
  if (returnPercent >= 30) return 'A'  
  if (returnPercent >= 20) return 'B'
  return 'C'
}