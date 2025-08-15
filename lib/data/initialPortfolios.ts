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
      { symbol: 'RKLB', shares: Math.floor(1000 / 26.55), avgPrice: 26.55, sector: 'Aerospace' }, // 37 shares
      { symbol: 'AMZN', shares: Math.floor(1000 / 216.10), avgPrice: 216.10, sector: 'Technology' }, // 4 shares
      { symbol: 'SOFI', shares: Math.floor(1000 / 14.90), avgPrice: 14.90, sector: 'Financial' }, // 67 shares
      { symbol: 'ASTS', shares: Math.floor(1000 / 41.91), avgPrice: 41.91, sector: 'Aerospace' }, // 23 shares
      { symbol: 'BRK.B', shares: Math.floor(1000 / 490.23), avgPrice: 490.23, sector: 'Financial' }, // 2 shares
      { symbol: 'CELH', shares: Math.floor(1000 / 43.49), avgPrice: 43.49, sector: 'Consumer' }, // 22 shares
      { symbol: 'OSCR', shares: Math.floor(1000 / 14.95), avgPrice: 14.95, sector: 'Healthcare' }, // 66 shares
      { symbol: 'EOG', shares: Math.floor(1000 / 123.18), avgPrice: 123.18, sector: 'Energy' }, // 8 shares
      { symbol: 'BROS', shares: Math.floor(1000 / 70.81), avgPrice: 70.81, sector: 'Consumer' }, // 14 shares
      { symbol: 'ABCL', shares: Math.floor(1000 / 3.16), avgPrice: 3.16, sector: 'Healthcare' } // 316 shares
    ],
    totalValue: 22750.00,
    totalInvested: 10000.00, // 10 positions × $1000 each
    totalReturn: 12750.00,
    totalReturnPercent: 127.5,
    dayChange: 345.60,
    dayChangePercent: 1.54,
    tier: calculateTier(127.5),
    sector: 'Aerospace',
    primaryStock: 'RKLB',
    lastCalculated: Date.now()
  },
  'amit': {
    userId: 'amit',
    username: 'Amit',
    positions: [
      { symbol: 'PLTR', shares: Math.floor(1000 / 141.41), avgPrice: 141.41, sector: 'Technology' }, // 7 shares
      { symbol: 'HOOD', shares: Math.floor(1000 / 76.75), avgPrice: 76.75, sector: 'Financial' }, // 13 shares
      { symbol: 'TSLA', shares: Math.floor(1000 / 329.13), avgPrice: 329.13, sector: 'Automotive' }, // 3 shares
      { symbol: 'AMD', shares: Math.floor(1000 / 126.39), avgPrice: 126.39, sector: 'Technology' }, // 7 shares
      { symbol: 'JPM', shares: Math.floor(1000 / 270.36), avgPrice: 270.36, sector: 'Financial' }, // 3 shares
      { symbol: 'NBIS', shares: Math.floor(1000 / 50.46), avgPrice: 50.46, sector: 'Technology' }, // 19 shares
      { symbol: 'GRAB', shares: Math.floor(1000 / 4.71), avgPrice: 4.71, sector: 'Technology' }, // 212 shares
      { symbol: 'AAPL', shares: Math.floor(1000 / 198.42), avgPrice: 198.42, sector: 'Technology' }, // 5 shares
      { symbol: 'V', shares: Math.floor(1000 / 355.48), avgPrice: 355.48, sector: 'Financial' }, // 2 shares
      { symbol: 'DUOL', shares: Math.floor(1000 / 474.90), avgPrice: 474.90, sector: 'Technology' } // 2 shares
    ],
    totalValue: 28950.00,
    totalInvested: 10000.00, // 10 positions × $1000 each
    totalReturn: 18950.00,
    totalReturnPercent: 189.5,
    dayChange: -234.50,
    dayChangePercent: -0.81,
    tier: calculateTier(189.5),
    sector: 'Technology',
    primaryStock: 'PLTR',
    lastCalculated: Date.now()
  },
  'steve': {
    userId: 'steve',
    username: 'Steve',
    positions: [
      { symbol: 'META', shares: Math.floor(1000 / 702.12), avgPrice: 702.12, sector: 'Technology' }, // 1 share
      { symbol: 'MSTR', shares: Math.floor(1000 / 382.25), avgPrice: 382.25, sector: 'Technology' }, // 2 shares
      { symbol: 'MSFT', shares: Math.floor(1000 / 479.14), avgPrice: 479.14, sector: 'Technology' }, // 2 shares
      { symbol: 'HIMS', shares: Math.floor(1000 / 59.78), avgPrice: 59.78, sector: 'Healthcare' }, // 16 shares
      { symbol: 'AVGO', shares: Math.floor(1000 / 252.10), avgPrice: 252.10, sector: 'Technology' }, // 3 shares
      { symbol: 'CRWD', shares: Math.floor(1000 / 479.39), avgPrice: 479.39, sector: 'Technology' }, // 2 shares
      { symbol: 'NFLX', shares: Math.floor(1000 / 1225.35), avgPrice: 1225.35, sector: 'Technology' }, // 0 shares
      { symbol: 'CRM', shares: Math.floor(1000 / 263.88), avgPrice: 263.88, sector: 'Technology' }, // 3 shares
      { symbol: 'PYPL', shares: Math.floor(1000 / 72.26), avgPrice: 72.26, sector: 'Financial' }, // 13 shares
      { symbol: 'MU', shares: Math.floor(1000 / 119.84), avgPrice: 119.84, sector: 'Technology' } // 8 shares
    ],
    totalValue: 31200.00,
    totalInvested: 10000.00, // 10 positions × $1000 each
    totalReturn: 21200.00,
    totalReturnPercent: 212.0,
    dayChange: 156.75,
    dayChangePercent: 0.50,
    tier: calculateTier(212.0),
    sector: 'Technology',
    primaryStock: 'META',
    lastCalculated: Date.now()
  },
  'tannor': {
    userId: 'tannor',
    username: 'Tannor',
    positions: [
      { symbol: 'NVDA', shares: Math.floor(1000 / 144.69), avgPrice: 144.69, sector: 'Technology' }, // 6 shares
      { symbol: 'NU', shares: Math.floor(1000 / 12.39), avgPrice: 12.39, sector: 'Financial' }, // 80 shares
      { symbol: 'NOW', shares: Math.floor(1000 / 1005.13), avgPrice: 1005.13, sector: 'Technology' }, // 0 shares
      { symbol: 'MELI', shares: Math.floor(1000 / 2454.76), avgPrice: 2454.76, sector: 'Technology' }, // 0 shares
      { symbol: 'SHOP', shares: Math.floor(1000 / 108.37), avgPrice: 108.37, sector: 'Technology' }, // 9 shares
      { symbol: 'TTD', shares: Math.floor(1000 / 70.25), avgPrice: 70.25, sector: 'Technology' }, // 14 shares
      { symbol: 'ASML', shares: Math.floor(1000 / 775.23), avgPrice: 775.23, sector: 'Technology' }, // 1 share
      { symbol: 'APP', shares: Math.floor(1000 / 370.68), avgPrice: 370.68, sector: 'Technology' }, // 2 shares
      { symbol: 'COIN', shares: Math.floor(1000 / 261.57), avgPrice: 261.57, sector: 'Financial' }, // 3 shares
      { symbol: 'TSM', shares: Math.floor(1000 / 215.68), avgPrice: 215.68, sector: 'Technology' } // 4 shares
    ],
    totalValue: 26480.00,
    totalInvested: 10000.00, // 10 positions × $1000 each
    totalReturn: 16480.00,
    totalReturnPercent: 164.8,
    dayChange: 387.20,
    dayChangePercent: 1.48,
    tier: calculateTier(164.8),
    sector: 'Technology',
    primaryStock: 'NVDA',
    lastCalculated: Date.now()
  },
  'kris': {
    userId: 'kris',
    username: 'Kris',
    positions: [
      { symbol: 'UNH', shares: Math.floor(1000 / 307.66), avgPrice: 307.66, sector: 'Healthcare' }, // 3 shares
      { symbol: 'GOOGL', shares: Math.floor(1000 / 176.77), avgPrice: 176.77, sector: 'Technology' }, // 5 shares
      { symbol: 'MRVL', shares: Math.floor(1000 / 70.42), avgPrice: 70.42, sector: 'Technology' }, // 14 shares
      { symbol: 'AXON', shares: Math.floor(1000 / 780.61), avgPrice: 780.61, sector: 'Technology' }, // 1 share
      { symbol: 'ELF', shares: Math.floor(1000 / 126.21), avgPrice: 126.21, sector: 'Consumer' }, // 7 shares
      { symbol: 'ORCL', shares: Math.floor(1000 / 211.10), avgPrice: 211.10, sector: 'Technology' }, // 4 shares
      { symbol: 'CSCO', shares: Math.floor(1000 / 65.51), avgPrice: 65.51, sector: 'Technology' }, // 15 shares
      { symbol: 'LLY', shares: Math.floor(1000 / 807.58), avgPrice: 807.58, sector: 'Healthcare' }, // 1 share
      { symbol: 'NVO', shares: Math.floor(1000 / 77.02), avgPrice: 77.02, sector: 'Healthcare' }, // 12 shares
      { symbol: 'TTWO', shares: Math.floor(1000 / 238.60), avgPrice: 238.60, sector: 'Technology' } // 4 shares
    ],
    totalValue: 25350.00,
    totalInvested: 10000.00, // 10 positions × $1000 each
    totalReturn: 15350.00,
    totalReturnPercent: 153.5,
    dayChange: 289.45,
    dayChangePercent: 1.15,
    tier: calculateTier(153.5),
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