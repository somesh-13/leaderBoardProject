/**
 * Test Script for Polygon.io Integration
 * 
 * Tests the enhanced Polygon service with a few sample tickers
 * to validate the implementation before running the full update.
 * 
 * Usage: npm run test-polygon
 */

import { getDailyClose, getSnapshotPrice, getCompletePriceData, getCacheStats } from '../lib/services/polygonService'

const TEST_TICKERS = ['PLTR', 'AAPL', 'TSLA', 'BRK.B'] // Include a dot ticker for testing

async function testHistoricalPrices() {
  console.log('🔍 Testing Historical Prices (6/16/2025)...')
  console.log('=' .repeat(50))
  
  for (const ticker of TEST_TICKERS) {
    try {
      const price = await getDailyClose(ticker, '2025-06-16')
      if (price !== null) {
        console.log(`✅ ${ticker}: $${price.toFixed(2)}`)
      } else {
        console.log(`❌ ${ticker}: No data available`)
      }
      
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.log(`❌ ${ticker}: Error - ${error}`)
    }
  }
}

async function testCurrentPrices() {
  console.log('\n📊 Testing Current Snapshot Prices...')
  console.log('=' .repeat(50))
  
  for (const ticker of TEST_TICKERS) {
    try {
      const snapshot = await getSnapshotPrice(ticker)
      if (snapshot.price !== null) {
        const changeStr = snapshot.dayChangePercent !== null 
          ? ` (${snapshot.dayChangePercent >= 0 ? '+' : ''}${snapshot.dayChangePercent.toFixed(2)}%)`
          : ''
        console.log(`✅ ${ticker}: $${snapshot.price.toFixed(2)}${changeStr}`)
        if (snapshot.timestamp) {
          console.log(`   Timestamp: ${snapshot.timestamp}`)
        }
      } else {
        console.log(`❌ ${ticker}: No snapshot data available`)
      }
      
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.log(`❌ ${ticker}: Error - ${error}`)
    }
  }
}

async function testCompletePriceData() {
  console.log('\n🔄 Testing Complete Price Data (Historical + Current)...')
  console.log('=' .repeat(50))
  
  for (const ticker of TEST_TICKERS) {
    try {
      const priceData = await getCompletePriceData(ticker)
      
      console.log(`\n📈 ${ticker}:`)
      console.log(`   6/16/2025 Close: ${priceData.close_2025_06_16 !== null ? '$' + priceData.close_2025_06_16.toFixed(2) : 'N/A'}`)
      console.log(`   Current Price:   ${priceData.currentPrice !== null ? '$' + priceData.currentPrice.toFixed(2) : 'N/A'}`)
      
      if (priceData.dayChangePercent !== null && priceData.dayChangePercent !== undefined) {
        console.log(`   Day Change:      ${priceData.dayChangePercent >= 0 ? '+' : ''}${priceData.dayChangePercent.toFixed(2)}%`)
      }
      
      if (priceData.currentTimestamp) {
        console.log(`   Last Updated:    ${priceData.currentTimestamp}`)
      }
      
      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.log(`❌ ${ticker}: Error - ${error}`)
    }
  }
}

async function testCacheStats() {
  console.log('\n📊 Cache Statistics:')
  console.log('=' .repeat(50))
  
  const stats = getCacheStats()
  console.log(`Historical Cache Entries: ${stats.historical}`)
  console.log(`Snapshot Cache Entries:   ${stats.snapshot}`)
  console.log(`Total Cache Size:         ${stats.totalSize}`)
}

async function main() {
  console.log('🚀 Starting Polygon.io Integration Test...')
  console.log(`📅 Testing with tickers: ${TEST_TICKERS.join(', ')}`)
  console.log('\n')
  
  try {
    // Test historical prices
    await testHistoricalPrices()
    
    // Test current prices
    await testCurrentPrices()
    
    // Test complete price data
    await testCompletePriceData()
    
    // Show cache stats
    await testCacheStats()
    
    console.log('\n✅ Polygon.io integration test completed!')
    console.log('\n💡 If you see real price data above, the integration is working correctly.')
    console.log('💡 You can now run "npm run update-prices" to update all portfolios.')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
if (require.main === module) {
  main().catch(console.error)
}

export { main as testPolygonIntegration }
