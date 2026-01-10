/**
 * Inspect balance sheet fields to find cash and debt
 */

const API_KEY = 'NI4Nbtnp0iiC2xahspy0I0dGppczJD5X'
const TICKER = 'WULF'

async function inspectBalanceSheet() {
  const url = `https://api.polygon.io/vX/reference/financials`
  const params = new URLSearchParams({
    ticker: TICKER,
    timeframe: 'quarterly',
    limit: '1',
    apiKey: API_KEY
  })

  const response = await fetch(`${url}?${params}`, {
    headers: { 'User-Agent': 'leaderboard-app/1.0' }
  })

  const data = await response.json()
  
  if (!data.results || data.results.length === 0) {
    console.log('No results found')
    return
  }

  const result = data.results[0]
  const bs = result.financials?.balance_sheet || {}
  const is = result.financials?.income_statement || {}
  
  console.log('📊 BALANCE SHEET FIELDS:')
  console.log('Period:', result.fiscal_period, result.fiscal_year)
  console.log('')
  
  const bsEntries = Object.entries(bs)
    .filter(([_, val]: [string, any]) => val?.value !== undefined)
    .map(([key, val]: [string, any]) => ({
      key,
      value: val.value,
      label: val.label,
      unit: val.unit
    }))
    .sort((a, b) => b.value - a.value)
  
  console.log('All Balance Sheet Fields (sorted by value):')
  bsEntries.forEach(({ key, value, label }) => {
    const valueMM = (value / 1_000_000).toFixed(1)
    console.log(`  ${key.padEnd(45)} | $${valueMM.padStart(10)}M | ${label}`)
  })
  
  console.log('')
  console.log('💰 INCOME STATEMENT FIELDS:')
  console.log('')
  
  const isEntries = Object.entries(is)
    .filter(([_, val]: [string, any]) => val?.value !== undefined && val?.unit === 'USD')
    .map(([key, val]: [string, any]) => ({
      key,
      value: val.value,
      label: val.label
    }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
  
  console.log('Key Income Statement Fields (USD):')
  isEntries.slice(0, 15).forEach(({ key, value, label }) => {
    const valueMM = (value / 1_000_000).toFixed(1)
    console.log(`  ${key.padEnd(45)} | $${valueMM.padStart(10)}M | ${label}`)
  })
  
  console.log('')
  console.log('🔍 LOOKING FOR SPECIFIC FIELDS:')
  console.log('')
  
  // Search for cash-related fields
  const cashKeywords = ['cash', 'equivalent']
  const cashFields = bsEntries.filter(({ key, label }) => 
    cashKeywords.some(kw => key.toLowerCase().includes(kw) || label.toLowerCase().includes(kw))
  )
  console.log('Cash-related fields:')
  cashFields.forEach(({ key, value, label }) => {
    console.log(`  ✓ ${key} = $${(value / 1_000_000).toFixed(1)}M (${label})`)
  })
  
  // Search for debt-related fields
  const debtKeywords = ['debt', 'borrow', 'note', 'loan']
  const debtFields = bsEntries.filter(({ key, label }) => 
    debtKeywords.some(kw => key.toLowerCase().includes(kw) || label.toLowerCase().includes(kw))
  )
  console.log('')
  console.log('Debt-related fields:')
  if (debtFields.length > 0) {
    debtFields.forEach(({ key, value, label }) => {
      console.log(`  ✓ ${key} = $${(value / 1_000_000).toFixed(1)}M (${label})`)
    })
  } else {
    console.log('  ⚠️ No specific debt fields found')
    console.log('  Using liability fields instead:')
    console.log(`  ✓ current_liabilities = $${(bs.current_liabilities?.value / 1_000_000).toFixed(1)}M`)
    console.log(`  ✓ noncurrent_liabilities = $${(bs.noncurrent_liabilities?.value / 1_000_000).toFixed(1)}M`)
    console.log(`  ✓ total_liabilities = $${(bs.liabilities?.value / 1_000_000).toFixed(1)}M`)
  }
  
  // Search for interest expense
  const interestFields = isEntries.filter(({ key, label }) => 
    key.toLowerCase().includes('interest') || label.toLowerCase().includes('interest')
  )
  console.log('')
  console.log('Interest-related fields:')
  if (interestFields.length > 0) {
    interestFields.forEach(({ key, value, label }) => {
      console.log(`  ✓ ${key} = $${(value / 1_000_000).toFixed(1)}M (${label})`)
    })
  } else {
    console.log('  ⚠️ No interest expense fields found')
  }
}

inspectBalanceSheet()
