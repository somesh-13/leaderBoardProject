/**
 * Test the specific endpoints mentioned by the user
 */

const API_KEY = 'NI4Nbtnp0iiC2xahspy0I0dGppczJD5X'
const TICKER = 'WULF'

async function testEndpoints() {
  console.log('🧪 Testing Specific Polygon Endpoints')
  console.log('=' .repeat(80))
  
  // 1. Balance Sheets API
  console.log('\n1️⃣  BALANCE SHEETS API')
  console.log('Endpoint: GET /v1/stocks/financials/balance-sheets')
  try {
    const url = `https://api.polygon.io/v1/stocks/financials/balance-sheets?ticker=${TICKER}&apiKey=${API_KEY}`
    console.log(`URL: ${url.replace(API_KEY, '***')}`)
    
    const res = await fetch(url)
    console.log(`Status: ${res.status} ${res.statusText}`)
    
    if (res.ok) {
      const data = await response.json()
      console.log('Response:', JSON.stringify(data, null, 2).substring(0, 500))
    } else {
      const text = await res.text()
      console.log('Error:', text)
    }
  } catch (e: any) {
    console.log('❌ Error:', e.message)
  }
  
  // 2. Ticker Details v3
  console.log('\n2️⃣  TICKER DETAILS (v3)')
  console.log('Endpoint: GET /v3/reference/tickers/{ticker}')
  try {
    const url = `https://api.polygon.io/v3/reference/tickers/${TICKER}?apiKey=${API_KEY}`
    console.log(`URL: ${url.replace(API_KEY, '***')}`)
    
    const res = await fetch(url)
    console.log(`Status: ${res.status} ${res.statusText}`)
    
    if (res.ok) {
      const data = await res.json()
      const results = data.results
      console.log('\nKey Fields:')
      console.log(`  - ticker: ${results.ticker}`)
      console.log(`  - name: ${results.name}`)
      console.log(`  - market_cap: $${(results.market_cap / 1_000_000).toFixed(1)}M`)
      console.log(`  - share_class_shares_outstanding: ${(results.share_class_shares_outstanding / 1_000_000).toFixed(1)}M`)
      console.log(`  - weighted_shares_outstanding: ${(results.weighted_shares_outstanding / 1_000_000).toFixed(1)}M`)
    } else {
      const text = await res.text()
      console.log('Error:', text)
    }
  } catch (e: any) {
    console.log('❌ Error:', e.message)
  }
  
  // 3. Income Statements API
  console.log('\n3️⃣  INCOME STATEMENTS API')
  console.log('Endpoint: GET /v1/stocks/financials/income-statements')
  try {
    const url = `https://api.polygon.io/v1/stocks/financials/income-statements?ticker=${TICKER}&timeframe=quarterly&apiKey=${API_KEY}`
    console.log(`URL: ${url.replace(API_KEY, '***')}`)
    
    const res = await fetch(url)
    console.log(`Status: ${res.status} ${res.statusText}`)
    
    if (res.ok) {
      const text = await res.text()
      console.log('Response preview:', text.substring(0, 300))
    } else {
      const text = await res.text()
      console.log('Error:', text)
    }
  } catch (e: any) {
    console.log('❌ Error:', e.message)
  }
  
  // 4. Ratios API
  console.log('\n4️⃣  RATIOS API')
  console.log('Endpoint: GET /v1/stocks/financials/ratios')
  try {
    const url = `https://api.polygon.io/v1/stocks/financials/ratios?ticker=${TICKER}&apiKey=${API_KEY}`
    console.log(`URL: ${url.replace(API_KEY, '***')}`)
    
    const res = await fetch(url)
    console.log(`Status: ${res.status} ${res.statusText}`)
    
    if (res.ok) {
      const text = await res.text()
      console.log('Response preview:', text.substring(0, 300))
    } else {
      const text = await res.text()
      console.log('Error:', text)
    }
  } catch (e: any) {
    console.log('❌ Error:', e.message)
  }
  
  console.log('\n' + '=' .repeat(80))
}

testEndpoints()
