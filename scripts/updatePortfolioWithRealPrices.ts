/**
 * Script to Update Portfolio avgPrices with Real 6/16/2025 Closing Prices
 * 
 * This script fetches the actual 6/16/2025 closing prices from Polygon.io
 * and updates the initialPortfolios.ts file with the real data.
 * 
 * Usage: npx tsx scripts/updatePortfolioWithRealPrices.ts
 */

import { getBatchPriceData } from '../lib/services/polygonService'
import { INITIAL_PORTFOLIOS } from '../lib/data/initialPortfolios'
import fs from 'fs'
import path from 'path'

// All unique tickers from all portfolios
const ALL_TICKERS = [
  // Matt's tickers
  'RKLB', 'AMZN', 'SOFI', 'ASTS', 'BRK.B', 'CELH', 'OSCR', 'EOG', 'BROS', 'ABCL',
  // Amit's tickers
  'PLTR', 'HOOD', 'TSLA', 'AMD', 'JPM', 'NBIS', 'GRAB', 'AAPL', 'V', 'DUOL',
  // Steve's tickers
  'META', 'MSTR', 'MSFT', 'HIMS', 'AVGO', 'CRWD', 'NFLX', 'CRM', 'PYPL', 'MU',
  // Tannor's tickers
  'NVDA', 'NU', 'NOW', 'MELI', 'SHOP', 'TTD', 'ASML', 'APP', 'COIN', 'TSM',
  // Kris's tickers
  'UNH', 'GOOGL', 'MRVL', 'AXON', 'ELF', 'ORCL', 'CSCO', 'LLY', 'NVO', 'TTWO'
]

async function main() {
  console.log('🚀 Starting portfolio update with real 6/16/2025 closing prices...')
  console.log(`📊 Fetching data for ${ALL_TICKERS.length} unique tickers`)
  
  try {
    // Fetch all price data
    const priceData = await getBatchPriceData(ALL_TICKERS)
    
    console.log('\n📈 Real 6/16/2025 Closing Prices:')
    console.log('=====================================')
    
    const realPrices: Record<string, number> = {}
    const failedTickers: string[] = []
    
    Object.entries(priceData).forEach(([ticker, data]) => {
      if (data.close_2025_06_16 !== null) {
        realPrices[ticker] = data.close_2025_06_16
        console.log(`✅ ${ticker}: $${data.close_2025_06_16.toFixed(2)}`)
      } else {
        failedTickers.push(ticker)
        console.log(`❌ ${ticker}: No data available`)
      }
    })
    
    if (failedTickers.length > 0) {
      console.log(`\n⚠️ Failed to fetch data for ${failedTickers.length} tickers:`, failedTickers)
    }
    
    console.log(`\n✅ Successfully fetched ${Object.keys(realPrices).length} real prices`)
    
    // Generate updated portfolio data
    console.log('\n📝 Generating updated portfolio data...')
    
    const updatedPortfolios = { ...INITIAL_PORTFOLIOS }
    
    // Update each trader's portfolio
    Object.entries(updatedPortfolios).forEach(([, portfolio]) => {
      console.log(`\n🔄 Updating ${portfolio.username}'s portfolio...`)
      
      portfolio.positions = portfolio.positions.map(position => {
        const realPrice = realPrices[position.symbol]
        if (realPrice !== undefined) {
          console.log(`  ${position.symbol}: $${position.avgPrice} → $${realPrice.toFixed(2)}`)
          return {
            ...position,
            avgPrice: realPrice,
            shares: Math.floor(1000 / realPrice) // Recalculate shares for $1000 investment
          }
        } else {
          console.log(`  ${position.symbol}: Keeping current price $${position.avgPrice} (no real data)`)
          return position
        }
      })
    })
    
    // Generate the updated file content
    const fileContent = generateUpdatedPortfolioFile(updatedPortfolios, realPrices)
    
    // Write to a new file for review
    const outputPath = path.join(process.cwd(), 'lib/data/initialPortfolios_updated.ts')
    fs.writeFileSync(outputPath, fileContent, 'utf8')
    
    console.log(`\n✅ Updated portfolio data written to: ${outputPath}`)
    console.log('\n📋 Summary:')
    console.log(`   - Total tickers processed: ${ALL_TICKERS.length}`)
    console.log(`   - Real prices fetched: ${Object.keys(realPrices).length}`)
    console.log(`   - Failed fetches: ${failedTickers.length}`)
    console.log('\n🔍 Review the updated file and replace initialPortfolios.ts when ready')
    
  } catch (error) {
    console.error('❌ Error updating portfolios:', error)
    process.exit(1)
  }
}

function generateUpdatedPortfolioFile(portfolios: typeof INITIAL_PORTFOLIOS, realPrices: Record<string, number>): string {
  const timestamp = new Date().toISOString()
  
  return `/**
 * Initial Portfolio Data Structure
 * Updated with real 6/16/2025 closing prices from Polygon.io
 * Generated on: ${timestamp}
 */

import { Portfolio } from '@/lib/types/portfolio'

export const INITIAL_PORTFOLIOS: Record<string, Portfolio> = {
${Object.entries(portfolios).map(([traderId, portfolio]) => {
  return `  '${traderId}': {
    userId: '${portfolio.userId}',
    username: '${portfolio.username}',
    positions: [
${portfolio.positions.map(position => {
  const isRealPrice = realPrices[position.symbol] !== undefined
  const comment = isRealPrice ? '// Real 6/16/2025 close' : '// Estimated (no real data)'
  return `      { symbol: '${position.symbol}', shares: ${position.shares}, avgPrice: ${position.avgPrice.toFixed(2)}, sector: '${position.sector}' }${comment}`
}).join(',\n')}
    ],
    totalValue: ${portfolio.totalValue.toFixed(2)},
    totalInvested: ${portfolio.totalInvested.toFixed(2)},
    totalReturn: ${portfolio.totalReturn.toFixed(2)},
    totalReturnPercent: ${portfolio.totalReturnPercent.toFixed(1)},
    dayChange: ${portfolio.dayChange.toFixed(2)},
    dayChangePercent: ${portfolio.dayChangePercent.toFixed(2)},
    tier: '${portfolio.tier}' as const,
    sector: '${portfolio.sector}',
    primaryStock: '${portfolio.primaryStock}',
    lastCalculated: Date.now()
  }`
}).join(',\n')}
}

/**
 * Real 6/16/2025 Closing Prices (fetched from Polygon.io)
 */
export const REAL_CLOSING_PRICES_616_2025: Record<string, number> = {
${Object.entries(realPrices).map(([ticker, price]) => {
  return `  '${ticker}': ${price.toFixed(2)}`
}).join(',\n')}
}

// Export helper functions from original file
${generateHelperFunctions()}
`
}

function generateHelperFunctions(): string {
  return `
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
}`
}

// Run the script
if (require.main === module) {
  main().catch(console.error)
}

export { main as updatePortfolioWithRealPrices }
