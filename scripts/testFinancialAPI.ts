/**
 * Test script for Polygon Financial API
 * 
 * Usage: npx tsx scripts/testFinancialAPI.ts
 */

import { fetchFinancialMetrics } from '../lib/services/polygonFinancialService'

const API_KEY = 'NI4Nbtnp0iiC2xahspy0I0dGppczJD5X'
const TICKER = 'WULF'

async function testFinancialAPI() {
  console.log('🚀 Testing Polygon Financial API Integration')
  console.log('=' .repeat(60))
  console.log(`Ticker: ${TICKER}`)
  console.log(`API Key: ${API_KEY.substring(0, 10)}...`)
  console.log('=' .repeat(60))
  console.log('')

  try {
    const metrics = await fetchFinancialMetrics(TICKER, API_KEY)
    
    console.log('✅ SUCCESS! Financial Metrics Retrieved:')
    console.log('')
    console.log('📊 BALANCE SHEET')
    console.log(`   Cash on Hand: $${metrics.cashOnHand.toFixed(1)}M`)
    console.log(`   Total Debt: $${metrics.totalDebt.toFixed(1)}M`)
    console.log(`   Net Debt: $${metrics.netDebt.toFixed(1)}M`)
    console.log('')
    console.log('💰 INCOME STATEMENT')
    console.log(`   Interest Expense: $${metrics.interestExpense.toFixed(1)}M`)
    console.log(`   Interest Rate: ${metrics.interestRate.toFixed(2)}%`)
    if (metrics.revenue) {
      console.log(`   Revenue (TTM): $${metrics.revenue.toFixed(1)}M`)
    }
    if (metrics.operatingIncome) {
      console.log(`   Operating Income: $${metrics.operatingIncome.toFixed(1)}M`)
    }
    console.log('')
    console.log('📈 MARKET DATA')
    console.log(`   Shares Outstanding: ${metrics.sharesOutstanding.toFixed(1)}M`)
    if (metrics.marketCap) {
      console.log(`   Market Cap: $${metrics.marketCap.toFixed(1)}M`)
    }
    console.log('')
    console.log('🔍 METADATA')
    console.log(`   Company Name: ${metrics.companyName}`)
    console.log(`   Fiscal Period: ${metrics.fiscalPeriod || 'N/A'}`)
    console.log(`   Last Updated: ${metrics.lastUpdated}`)
    console.log('')
    console.log('=' .repeat(60))
    console.log('📝 COMPARISON WITH OLD VALUES:')
    console.log('=' .repeat(60))
    console.log(`   Shares Outstanding: 520M (old) → ${metrics.sharesOutstanding.toFixed(1)}M (actual)`)
    console.log(`   Cash on Hand: $713M (old) → $${metrics.cashOnHand.toFixed(1)}M (actual)`)
    console.log(`   Total Debt: $1,500M (old) → $${metrics.totalDebt.toFixed(1)}M (actual)`)
    console.log(`   Interest Rate: 7.75% (old) → ${metrics.interestRate.toFixed(2)}% (actual)`)
    console.log(`   Annual Interest: ~$116M (old) → ~$${metrics.interestExpense.toFixed(1)}M (actual)`)
    console.log(`   Net Debt: $787M (old) → $${metrics.netDebt.toFixed(1)}M (actual)`)
    console.log('')
    
  } catch (error: any) {
    console.error('❌ ERROR:', error.message)
    console.error('')
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

testFinancialAPI()
