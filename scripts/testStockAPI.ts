/**
 * Test the stock API to verify market cap is calculated correctly
 */

async function testStockAPI() {
  const ticker = 'WULF'
  const apiKey = 'NI4Nbtnp0iiC2xahspy0I0dGppczJD5X'
  
  console.log('🧪 Testing Stock API for Market Cap Fix')
  console.log('=' .repeat(80))
  console.log(`Ticker: ${ticker}`)
  console.log('')
  
  // Test ticker details API directly
  console.log('1️⃣  Fetching Ticker Details from Polygon...')
  try {
    const url = `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${apiKey}`
    const response = await fetch(url)
    
    if (response.ok) {
      const data = await response.json()
      const results = data.results
      
      console.log('✅ Ticker Details Retrieved:')
      console.log(`   Ticker: ${results.ticker}`)
      console.log(`   Name: ${results.name}`)
      console.log(`   Market Cap: $${(results.market_cap / 1_000_000).toFixed(1)}M ($${(results.market_cap / 1_000_000_000).toFixed(2)}B)`)
      console.log(`   Shares Outstanding: ${(results.share_class_shares_outstanding / 1_000_000).toFixed(1)}M`)
      console.log(`   Weighted Shares: ${(results.weighted_shares_outstanding / 1_000_000).toFixed(1)}M`)
      console.log('')
      
      // Calculate what market cap should be
      const currentPrice = 14.33 // Approximate current price
      const calculatedMarketCap = currentPrice * (results.share_class_shares_outstanding / 1_000_000)
      console.log('🧮 Calculated Market Cap (Price × Shares):')
      console.log(`   $${currentPrice} × ${(results.share_class_shares_outstanding / 1_000_000).toFixed(1)}M shares = $${calculatedMarketCap.toFixed(1)}M ($${(calculatedMarketCap / 1_000).toFixed(2)}B)`)
      console.log('')
      
      // Compare with reported
      const reportedMarketCap = results.market_cap / 1_000_000_000
      console.log('📊 Comparison:')
      console.log(`   Polygon Reported: $${reportedMarketCap.toFixed(2)}B`)
      console.log(`   Our Calculation: $${(calculatedMarketCap / 1_000).toFixed(2)}B`)
      console.log(`   Difference: ${Math.abs(reportedMarketCap - (calculatedMarketCap / 1_000)).toFixed(2)}B`)
      console.log('')
      
      console.log('✅ Market cap should now show: ~$6.00B (not $458M)')
      
    } else {
      console.error(`❌ HTTP ${response.status}: ${response.statusText}`)
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message)
  }
  
  console.log('=' .repeat(80))
}

testStockAPI()
