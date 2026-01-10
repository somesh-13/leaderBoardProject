import { NextRequest, NextResponse } from 'next/server'
import type { BenzingaEarningsResponse, BenzingaEarningsRecord, RevenueDataPoint, RevenueEstimatesData } from '@/lib/types/earnings'
import { REAL_REVENUE_DATA } from '@/lib/data/realRevenueData'

const MASSIVE_API_BASE = 'https://api.massive.com/benzinga/v1/earnings'

// Helper to convert revenue to millions
function toMillions(revenue: number | undefined): number {
  if (!revenue) return 0
  return revenue / 1_000_000
}

// Helper to format period string
function formatPeriod(fiscalYear: number, fiscalPeriod: string, viewType: 'quarterly' | 'yearly'): string {
  if (viewType === 'yearly') {
    return fiscalYear.toString()
  }
  
  // For quarterly: "Q1 24", "Q2 24", etc.
  const yearShort = fiscalYear.toString().slice(-2)
  return `${fiscalPeriod} ${yearShort}`
}

// Transform Benzinga API response to component format
function transformEarningsData(
  records: BenzingaEarningsRecord[],
  ticker: string
): RevenueEstimatesData {
  const quarterlyData: RevenueDataPoint[] = []
  const yearlyData: RevenueDataPoint[] = []
  
  // Get company name from first record
  const companyName = records[0]?.company_name || ticker
  const currency = records[0]?.currency || 'USD'
  
  // Process each record
  for (const record of records) {
    const {
      fiscal_year,
      fiscal_period,
      actual_revenue,
      estimated_revenue,
      date_status
    } = record
    
    // Skip if missing essential data
    if (!fiscal_year || !fiscal_period) continue
    
    // Determine revenue value (prefer actual, fallback to estimated)
    const revenueValue = actual_revenue || estimated_revenue
    if (!revenueValue) continue
    
    // Determine if historical (has actual_revenue or date_status is confirmed)
    const isHistorical = !!actual_revenue || date_status === 'confirmed'
    
    const dataPoint: RevenueDataPoint = {
      period: '', // Will be set below based on type
      revenue: toMillions(revenueValue),
      total: toMillions(revenueValue),
      isHistorical,
      fiscalYear: fiscal_year,
      fiscalPeriod: fiscal_period
    }
    
    // Categorize into quarterly or yearly
    if (fiscal_period === 'FY') {
      dataPoint.period = formatPeriod(fiscal_year, fiscal_period, 'yearly')
      yearlyData.push(dataPoint)
    } else if (['Q1', 'Q2', 'Q3', 'Q4'].includes(fiscal_period)) {
      dataPoint.period = formatPeriod(fiscal_year, fiscal_period, 'quarterly')
      quarterlyData.push(dataPoint)
    }
  }
  
  // Sort data chronologically
  const sortData = (a: RevenueDataPoint, b: RevenueDataPoint) => {
    if (a.fiscalYear !== b.fiscalYear) {
      return a.fiscalYear - b.fiscalYear
    }
    
    // For quarterly data, sort by quarter
    const quarterOrder: Record<string, number> = { Q1: 1, Q2: 2, Q3: 3, Q4: 4, FY: 5 }
    return (quarterOrder[a.fiscalPeriod] || 0) - (quarterOrder[b.fiscalPeriod] || 0)
  }
  
  quarterlyData.sort(sortData)
  yearlyData.sort(sortData)
  
  return {
    quarterly: quarterlyData,
    yearly: yearlyData,
    currency,
    companyName,
    ticker
  }
}

// Fetch earnings data from Massive.com Benzinga API
async function fetchBenzingaEarnings(ticker: string, apiKey: string): Promise<BenzingaEarningsRecord[]> {
  try {
    // Calculate date range: last 5 years to next 3 years
    const currentYear = new Date().getFullYear()
    const startYear = currentYear - 5
    const endYear = currentYear + 3
    
    const allRecords: BenzingaEarningsRecord[] = []
    
    // Fetch data year by year to ensure we get comprehensive coverage
    for (let year = startYear; year <= endYear; year++) {
      const params = new URLSearchParams({
        ticker: ticker.toUpperCase(),
        fiscal_year: year.toString(),
        limit: '100',
        sort: 'fiscal_period.asc',
        apiKey: apiKey
      })
      
      const url = `${MASSIVE_API_BASE}?${params.toString()}`
      
      console.log(`📊 Fetching Benzinga earnings for ${ticker} ${year}...`)
      
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'User-Agent': 'leaderboard-app/1.0'
        }
      })
      
      if (!response.ok) {
        console.warn(`⚠️ Benzinga API error for ${ticker} ${year}: ${response.status}`)
        continue
      }
      
      const data: BenzingaEarningsResponse = await response.json()
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        console.log(`✅ Got ${data.results.length} earnings records for ${ticker} ${year}`)
        allRecords.push(...data.results)
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log(`✅ Total earnings records for ${ticker}: ${allRecords.length}`)
    return allRecords
    
  } catch (error) {
    console.error(`❌ Error fetching Benzinga earnings for ${ticker}:`, error)
    throw error
  }
}

// Generate realistic revenue data using real historical data when available
function generateRevenueData(ticker: string): RevenueEstimatesData {
  // Check if we have real data for this ticker
  const realData = REAL_REVENUE_DATA[ticker.toUpperCase()]
  
  if (realData) {
    console.log(`✅ Using real historical revenue data for ${ticker}`)
    
    const quarterly: RevenueDataPoint[] = []
    const yearly: RevenueDataPoint[] = []
    
    const currentYear = new Date().getFullYear()
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)
    
    // Process quarterly data
    for (const q of realData.quarterly) {
      const isHistorical = q.year < currentYear || (q.year === currentYear && q.quarter <= currentQuarter)
      
      quarterly.push({
        period: `Q${q.quarter} ${q.year.toString().slice(-2)}`,
        revenue: q.revenue,
        total: q.revenue,
        isHistorical,
        fiscalYear: q.year,
        fiscalPeriod: `Q${q.quarter}`
      })
    }
    
    // Add projected quarters (simple growth model: avg of last 4 quarters + 5% growth)
    const lastQuarters = realData.quarterly.slice(-4)
    const avgRevenue = lastQuarters.reduce((sum, q) => sum + q.revenue, 0) / lastQuarters.length
    const growthRate = 1.05 // 5% growth estimate
    
    let nextRevenue = avgRevenue * growthRate
    const latestData = realData.quarterly[realData.quarterly.length - 1]
    let nextYear = latestData.year
    let nextQuarter = latestData.quarter + 1
    
    // Add 6 projected quarters
    for (let i = 0; i < 6; i++) {
      if (nextQuarter > 4) {
        nextQuarter = 1
        nextYear++
      }
      
      // Only add if it's truly in the future
      if (nextYear > currentYear || (nextYear === currentYear && nextQuarter > currentQuarter)) {
        quarterly.push({
          period: `Q${nextQuarter} ${nextYear.toString().slice(-2)}`,
          revenue: Math.round(nextRevenue),
          total: Math.round(nextRevenue),
          isHistorical: false,
          fiscalYear: nextYear,
          fiscalPeriod: `Q${nextQuarter}`
        })
        
        nextRevenue *= 1.02 // 2% quarter-over-quarter growth
      }
      
      nextQuarter++
    }
    
    // Process yearly data
    for (const y of realData.yearly) {
      yearly.push({
        period: y.year.toString(),
        revenue: y.revenue,
        total: y.revenue,
        isHistorical: y.year < currentYear,
        fiscalYear: y.year,
        fiscalPeriod: 'FY'
      })
    }
    
    // Add projected years
    if (realData.yearly.length > 0) {
      const lastYears = realData.yearly.slice(-3)
      const avgYearlyRevenue = lastYears.reduce((sum, y) => sum + y.revenue, 0) / lastYears.length
      const yearlyGrowthRate = 1.10 // 10% annual growth estimate
      
      let nextYearRevenue = avgYearlyRevenue * yearlyGrowthRate
      const latestYear = realData.yearly[realData.yearly.length - 1].year
      
      for (let i = 1; i <= 3; i++) {
        const projectedYear = latestYear + i
        if (projectedYear > currentYear) {
          yearly.push({
            period: projectedYear.toString(),
            revenue: Math.round(nextYearRevenue),
            total: Math.round(nextYearRevenue),
            isHistorical: false,
            fiscalYear: projectedYear,
            fiscalPeriod: 'FY'
          })
          nextYearRevenue *= 1.08
        }
      }
    }
    
    return {
      quarterly,
      yearly,
      currency: 'USD',
      companyName: realData.companyName,
      ticker: realData.ticker
    }
  }
  
  // Fallback: Generate generic mock data for tickers without real data
  console.log(`⚠️ No real revenue data available for ${ticker}, using generic mock data`)
  
  const currentYear = new Date().getFullYear()
  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)
  
  const quarterly: RevenueDataPoint[] = []
  const yearly: RevenueDataPoint[] = []
  
  // Generate 5 years of historical + 2 years of projected quarterly data
  let baseRevenue = 100 // Start at $100M
  
  for (let yearOffset = -5; yearOffset <= 2; yearOffset++) {
    const year = currentYear + yearOffset
    const isHistorical = yearOffset < 0 || (yearOffset === 0 && currentQuarter >= 3)
    
    let yearlyTotal = 0
    
    // Generate quarterly data
    for (let q = 1; q <= 4; q++) {
      // Don't generate future quarters for current year beyond current quarter
      if (yearOffset === 0 && q > currentQuarter) {
        continue
      }
      
      const quarterRevenue = baseRevenue * (0.9 + Math.random() * 0.3)
      yearlyTotal += quarterRevenue
      
      quarterly.push({
        period: `Q${q} ${year.toString().slice(-2)}`,
        revenue: quarterRevenue,
        total: quarterRevenue,
        isHistorical: isHistorical && (yearOffset < 0 || q <= currentQuarter),
        fiscalYear: year,
        fiscalPeriod: `Q${q}`
      })
      
      // Add growth over time
      baseRevenue *= 1.03
    }
    
    // Generate yearly data
    if (yearlyTotal > 0 || !isHistorical) {
      const yearRevenue = yearlyTotal || baseRevenue * 4
      yearly.push({
        period: year.toString(),
        revenue: yearRevenue,
        total: yearRevenue,
        isHistorical,
        fiscalYear: year,
        fiscalPeriod: 'FY'
      })
    }
  }
  
  return {
    quarterly,
    yearly,
    currency: 'USD',
    companyName: `${ticker} Inc.`,
    ticker
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ ticker: string }> }
) {
  const { ticker: rawTicker } = await context.params
  const ticker = rawTicker.toUpperCase()
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY
    
    if (!apiKey) {
      console.warn('⚠️ Massive/Polygon API key not found, using real/mock data')
      const data = generateRevenueData(ticker)
      return NextResponse.json(data)
    }
    
    // Fetch real data from Benzinga API
    const earningsRecords = await fetchBenzingaEarnings(ticker, apiKey)
    
    // If no data found, return real/mock data
    if (earningsRecords.length === 0) {
      console.log(`📊 No earnings data found for ${ticker}, using real/mock data`)
      const data = generateRevenueData(ticker)
      return NextResponse.json(data)
    }
    
    // Transform the data
    const transformedData = transformEarningsData(earningsRecords, ticker)
    
    // If no revenue data after transformation, use real/mock
    if (transformedData.quarterly.length === 0 && transformedData.yearly.length === 0) {
      console.log(`📊 No revenue estimates found for ${ticker}, using real/mock data`)
      const data = generateRevenueData(ticker)
      return NextResponse.json(data)
    }
    
    return NextResponse.json(transformedData)
    
  } catch (error) {
    console.error(`❌ Error in earnings API for ${ticker}:`, error)
    
    // Return real/mock data as fallback
    const data = generateRevenueData(ticker)
    return NextResponse.json(data)
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
