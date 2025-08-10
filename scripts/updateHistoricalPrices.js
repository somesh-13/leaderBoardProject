/**
 * Script to update Amit's portfolio with 6/16/2025 closing prices
 * 
 * Run with: node scripts/updateHistoricalPrices.js
 */

const { getClosingPricesFor616, CLOSING_PRICES_616_2025 } = require('../lib/utils/historicalPriceUpdater')

async function main() {
  console.log('🚀 Starting historical price update for Amit\'s portfolio...')
  
  try {
    // Try to fetch real historical prices
    console.log('📡 Attempting to fetch real historical prices from Polygon API...')
    const realPrices = await getClosingPricesFor616()
    
    if (Object.keys(realPrices).length > 0) {
      console.log('✅ Successfully fetched real historical prices:')
      console.log(realPrices)
    } else {
      console.log('⚠️ No real prices fetched, using known closing prices:')
      console.log(CLOSING_PRICES_616_2025)
    }
    
    console.log('\n📝 Update your initialPortfolios.ts file with these avgPrice values:')
    
    const finalPrices = Object.keys(realPrices).length > 0 ? realPrices : CLOSING_PRICES_616_2025
    
    Object.entries(finalPrices).forEach(([symbol, price]) => {
      console.log(`${symbol}: avgPrice: ${price.toFixed(2)}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    console.log('\n🔄 Falling back to known closing prices:')
    console.log(CLOSING_PRICES_616_2025)
  }
}

main().catch(console.error)
