/**
 * Debug script to inspect raw Polygon API responses
 * 
 * Usage: npx tsx scripts/debugPolygonAPI.ts
 */

const API_KEY = 'NI4Nbtnp0iiC2xahspy0I0dGppczJD5X'
const TICKER = 'WULF'

async function debugBalanceSheet() {
  const url = `https://api.polygon.io/vX/reference/financials`
  const params = new URLSearchParams({
    ticker: TICKER,
    timeframe: 'quarterly',
    limit: '4',
    apiKey: API_KEY
  })

  console.log('🔍 Fetching Balance Sheet Data')
  console.log(`URL: ${url}?${params.toString().replace(API_KEY, '***')}`)
  console.log('')

  const response = await fetch(`${url}?${params}`, {
    headers: { 'User-Agent': 'leaderboard-app/1.0' }
  })

  if (!response.ok) {
    console.error(`❌ HTTP ${response.status}: ${response.statusText}`)
    const text = await response.text()
    console.error(text)
    return
  }

  const data = await response.json()
  
  console.log('📊 RAW API RESPONSE:')
  console.log(JSON.stringify(data, null, 2))
  console.log('')
  
  if (data.results && data.results.length > 0) {
    console.log('📋 FIRST RESULT STRUCTURE:')
    const first = data.results[0]
    console.log('Fiscal Period:', first.fiscal_period)
    console.log('Fiscal Year:', first.fiscal_year)
    console.log('Start Date:', first.start_date)
    console.log('End Date:', first.end_date)
    console.log('')
    
    console.log('🏦 BALANCE SHEET STRUCTURE:')
    if (first.financials?.balance_sheet) {
      console.log(JSON.stringify(first.financials.balance_sheet, null, 2))
    } else {
      console.log('❌ No balance_sheet data found')
    }
    console.log('')
    
    console.log('💰 INCOME STATEMENT STRUCTURE:')
    if (first.financials?.income_statement) {
      console.log(JSON.stringify(first.financials.income_statement, null, 2))
    } else {
      console.log('❌ No income_statement data found')
    }
    console.log('')
    
    console.log('💵 CASH FLOW STRUCTURE:')
    if (first.financials?.cash_flow_statement) {
      console.log(JSON.stringify(first.financials.cash_flow_statement, null, 2))
    } else {
      console.log('❌ No cash_flow_statement data found')
    }
  } else {
    console.log('❌ No results found')
  }
}

async function debugTickerDetails() {
  const url = `https://api.polygon.io/v3/reference/tickers/${TICKER}`
  const params = new URLSearchParams({ apiKey: API_KEY })

  console.log('')
  console.log('=' .repeat(80))
  console.log('🔍 Fetching Ticker Details')
  console.log(`URL: ${url}?${params.toString().replace(API_KEY, '***')}`)
  console.log('')

  const response = await fetch(`${url}?${params}`, {
    headers: { 'User-Agent': 'leaderboard-app/1.0' }
  })

  if (!response.ok) {
    console.error(`❌ HTTP ${response.status}: ${response.statusText}`)
    return
  }

  const data = await response.json()
  
  console.log('📊 TICKER DETAILS:')
  console.log(JSON.stringify(data.results, null, 2))
}

async function main() {
  try {
    await debugBalanceSheet()
    await debugTickerDetails()
  } catch (error: any) {
    console.error('❌ ERROR:', error.message)
    console.error(error.stack)
  }
}

main()
