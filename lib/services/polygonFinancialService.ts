/**
 * Polygon.io Financial Data API Service
 * 
 * Fetches fundamental financial data including:
 * - Balance Sheets (cash, debt)
 * - Income Statements (revenue, operating income, interest expense)
 * - Cash Flow Statements (FCF, CAPEX)
 * - Ticker Details (shares outstanding)
 */

const POLYGON_API_BASE = 'https://api.polygon.io'

export interface BalanceSheetData {
  cash_and_equivalents?: number
  long_term_debt_and_capital_lease_obligations?: number
  debt_current?: number
  fiscal_period?: string
  fiscal_year?: string
  start_date?: string
  end_date?: string
}

export interface IncomeStatementData {
  revenues?: number
  operating_income_loss?: number
  interest_expense?: number
  fiscal_period?: string
  fiscal_year?: string
  start_date?: string
  end_date?: string
}

export interface CashFlowData {
  net_cash_flow_from_operating_activities?: number
  net_cash_flow_from_investing_activities?: number
  fiscal_period?: string
  fiscal_year?: string
}

export interface TickerDetailsData {
  ticker: string
  name?: string
  market_cap?: number
  share_class_shares_outstanding?: number
  weighted_shares_outstanding?: number
}

export interface FinancialMetrics {
  ticker: string
  companyName: string
  // Balance Sheet
  cashOnHand: number
  totalDebt: number
  netDebt: number
  // Shares
  sharesOutstanding: number
  marketCap?: number
  // Income Statement
  revenue?: number
  operatingIncome?: number
  interestExpense: number
  interestRate: number
  // Metadata
  lastUpdated: string
  fiscalPeriod?: string
}

/**
 * Fetch balance sheet data from Polygon
 * 
 * Note: Polygon's balance sheet structure may vary. We try to find:
 * - Cash: Look for cash fields in balance_sheet
 * - Debt: Current + Non-current liabilities (or specific debt fields)
 */
export async function fetchBalanceSheet(
  ticker: string,
  apiKey: string,
  timeframe: 'quarterly' | 'annual' = 'quarterly',
  limit = 4
): Promise<BalanceSheetData[]> {
  const url = `${POLYGON_API_BASE}/vX/reference/financials`
  const params = new URLSearchParams({
    ticker,
    timeframe,
    limit: limit.toString(),
    apiKey
  })

  console.log(`📊 Fetching balance sheet for ${ticker}...`)
  
  const response = await fetch(`${url}?${params}`, {
    cache: 'no-store',
    headers: { 'User-Agent': 'leaderboard-app/1.0' }
  })

  if (!response.ok) {
    throw new Error(`Polygon API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  
  if (!data.results || data.results.length === 0) {
    console.warn(`⚠️ No balance sheet data found for ${ticker}`)
    return []
  }

  return data.results.map((r: any) => {
    const bs = r.financials?.balance_sheet || {}
    
    // Try to find cash - look for common field names
    let cash = 0
    const cashFields = [
      'cash',
      'cash_and_equivalents',
      'cash_and_cash_equivalents',
      'cash_cash_equivalents_and_short_term_investments'
    ]
    
    // Check all balance sheet fields for cash-related items
    for (const key in bs) {
      const field = bs[key]
      if (field?.value !== undefined) {
        const lowerKey = key.toLowerCase()
        if (cashFields.some(cf => lowerKey.includes(cf.replace(/_/g, '')))) {
          cash = field.value
          console.log(`   Found cash field: ${key} = $${(field.value / 1_000_000).toFixed(1)}M`)
          break
        }
      }
    }
    
    // Try to find debt - look for debt-specific fields or use liabilities
    let longTermDebt = 0
    let currentDebt = 0
    
    const debtFields = [
      'long_term_debt',
      'debt_long_term',
      'long_term_debt_noncurrent',
      'noncurrent_liabilities',
      'other_noncurrent_liabilities'
    ]
    
    const currentDebtFields = [
      'current_debt',
      'debt_current',
      'short_term_debt',
      'current_portion_of_long_term_debt'
    ]
    
    // Check for long-term debt
    for (const key in bs) {
      const field = bs[key]
      if (field?.value !== undefined) {
        const lowerKey = key.toLowerCase()
        if (debtFields.some(df => lowerKey.includes(df.replace(/_/g, '')))) {
          longTermDebt = field.value
          console.log(`   Found long-term debt/liabilities: ${key} = $${(field.value / 1_000_000).toFixed(1)}M`)
          break
        }
      }
    }
    
    // Check for current debt
    for (const key in bs) {
      const field = bs[key]
      if (field?.value !== undefined) {
        const lowerKey = key.toLowerCase()
        if (currentDebtFields.some(df => lowerKey.includes(df.replace(/_/g, '')))) {
          currentDebt = field.value
          console.log(`   Found current debt: ${key} = $${(field.value / 1_000_000).toFixed(1)}M`)
          break
        }
      }
    }
    
    return {
      cash_and_equivalents: cash,
      long_term_debt_and_capital_lease_obligations: longTermDebt,
      debt_current: currentDebt,
      fiscal_period: r.fiscal_period,
      fiscal_year: r.fiscal_year,
      start_date: r.start_date,
      end_date: r.end_date
    }
  })
}

/**
 * Fetch income statement data from Polygon
 */
export async function fetchIncomeStatement(
  ticker: string,
  apiKey: string,
  timeframe: 'quarterly' | 'annual' = 'quarterly',
  limit = 4
): Promise<IncomeStatementData[]> {
  const url = `${POLYGON_API_BASE}/vX/reference/financials`
  const params = new URLSearchParams({
    ticker,
    timeframe,
    limit: limit.toString(),
    apiKey
  })

  console.log(`💰 Fetching income statement for ${ticker}...`)
  
  const response = await fetch(`${url}?${params}`, {
    cache: 'no-store',
    headers: { 'User-Agent': 'leaderboard-app/1.0' }
  })

  if (!response.ok) {
    throw new Error(`Polygon API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  
  if (!data.results || data.results.length === 0) {
    console.warn(`⚠️ No income statement data found for ${ticker}`)
    return []
  }

  return data.results.map((r: any) => ({
    revenues: r.financials?.income_statement?.revenues?.value,
    operating_income_loss: r.financials?.income_statement?.operating_income_loss?.value,
    interest_expense: r.financials?.income_statement?.interest_expense?.value,
    fiscal_period: r.fiscal_period,
    fiscal_year: r.fiscal_year,
    start_date: r.start_date,
    end_date: r.end_date
  }))
}

/**
 * Fetch ticker details including shares outstanding
 */
export async function fetchTickerDetails(
  ticker: string,
  apiKey: string
): Promise<TickerDetailsData> {
  const url = `${POLYGON_API_BASE}/v3/reference/tickers/${ticker}`
  const params = new URLSearchParams({ apiKey })

  console.log(`🔍 Fetching ticker details for ${ticker}...`)
  
  const response = await fetch(`${url}?${params}`, {
    cache: 'no-store',
    headers: { 'User-Agent': 'leaderboard-app/1.0' }
  })

  if (!response.ok) {
    throw new Error(`Polygon API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  
  if (!data.results) {
    throw new Error(`No ticker details found for ${ticker}`)
  }

  return {
    ticker: data.results.ticker,
    name: data.results.name,
    market_cap: data.results.market_cap,
    share_class_shares_outstanding: data.results.share_class_shares_outstanding,
    weighted_shares_outstanding: data.results.weighted_shares_outstanding
  }
}

/**
 * WULF-specific financial data from latest 10-Q filing
 * Source: Q3 2024 10-Q (actual reported values)
 * 
 * Note: Polygon API doesn't provide detailed cash/debt breakdown for WULF,
 * so we use reported values from SEC filings
 */
const WULF_FINANCIALS = {
  cashOnHand: 274.5, // $274.5M - Cash and cash equivalents
  totalDebt: 500.0, // $500M - Total debt (long-term + current)
  interestRate: 2.75, // 2.75% - Weighted average interest rate
  annualInterestExpense: 13.75 // $13.75M - Annual interest expense
}

/**
 * Aggregate all financial data into comprehensive metrics
 */
export async function fetchFinancialMetrics(
  ticker: string,
  apiKey: string
): Promise<FinancialMetrics> {
  try {
    // Try using the new unified polygonClient first for better data
    try {
      const { getCompanySnapshot } = await import('../polygonClient')
      const snapshot = await getCompanySnapshot(ticker)
      
      // Calculate interest rate from income statement if available
      let interestRate = 0
      let interestExpense = 0
      
      if (snapshot.totalDebt && snapshot.totalDebt > 0) {
        // Try to fetch income statement for interest expense
        try {
          const incomeStatements = await fetchIncomeStatement(ticker, apiKey, 'annual', 1)
          if (incomeStatements[0]?.interest_expense) {
            interestExpense = Math.abs(incomeStatements[0].interest_expense) / 1_000_000
            interestRate = (interestExpense / snapshot.totalDebt) * 100
          }
        } catch (e) {
          console.warn('Could not fetch interest expense, using estimate')
          // Estimate interest rate for NBIS based on typical corporate debt
          if (ticker.toUpperCase() === 'NBIS') {
            interestRate = 5.0 // Reasonable estimate for corporate debt
          }
        }
      }
      
      const metrics: FinancialMetrics = {
        ticker: snapshot.ticker,
        companyName: snapshot.name,
        cashOnHand: snapshot.cash || 0,
        totalDebt: snapshot.totalDebt || 0,
        netDebt: snapshot.netDebt || 0,
        sharesOutstanding: snapshot.sharesOutstanding || 0,
        marketCap: snapshot.marketCap ?? undefined,
        revenue: snapshot.revenue ?? undefined,
        operatingIncome: snapshot.operatingIncome ?? undefined,
        interestExpense,
        interestRate: Math.round(interestRate * 100) / 100,
        lastUpdated: snapshot.lastUpdated,
        fiscalPeriod: snapshot.fiscalPeriod
      }
      
      console.log('✅ Financial metrics from new client:', {
        ticker: metrics.ticker,
        cashOnHand: `$${metrics.cashOnHand.toFixed(1)}M`,
        totalDebt: `$${metrics.totalDebt.toFixed(1)}M`,
        netDebt: `$${metrics.netDebt.toFixed(1)}M`,
        sharesOutstanding: `${metrics.sharesOutstanding.toFixed(1)}M`,
        interestRate: `${metrics.interestRate.toFixed(2)}%`
      })
      
      return metrics
      
    } catch (clientError) {
      console.warn('⚠️ New client failed, falling back to legacy method:', clientError)
    }
    
    // Fallback to legacy method
    // Fetch ticker details for shares outstanding and market cap
    const tickerDetails = await fetchTickerDetails(ticker, apiKey)

    // Get shares outstanding (prefer share_class_shares_outstanding)
    const sharesOutstanding = tickerDetails.share_class_shares_outstanding || 
                             tickerDetails.weighted_shares_outstanding || 
                             520_000_000 // Fallback

    // Use WULF-specific data if ticker is WULF, otherwise try API
    let cashOnHand = 0
    let totalDebt = 0
    let interestRate = 0
    let interestExpense = 0
    let revenue: number | undefined = undefined
    let operatingIncome: number | undefined = undefined
    let fiscalPeriod: string | undefined = undefined

    if (ticker.toUpperCase() === 'WULF') {
      // Use manually curated WULF data from SEC filings
      cashOnHand = WULF_FINANCIALS.cashOnHand
      totalDebt = WULF_FINANCIALS.totalDebt
      interestRate = WULF_FINANCIALS.interestRate
      interestExpense = WULF_FINANCIALS.annualInterestExpense
      
      console.log('📋 Using curated WULF financial data from SEC filings')
      
      // Still try to get revenue/operating income from API
      try {
        const incomeStatements = await fetchIncomeStatement(ticker, apiKey, 'quarterly', 1)
        const latestIncome = incomeStatements[0]
        if (latestIncome) {
          revenue = latestIncome.revenues ? latestIncome.revenues / 1_000_000 : undefined
          operatingIncome = latestIncome.operating_income_loss ? latestIncome.operating_income_loss / 1_000_000 : undefined
        }
      } catch (e) {
        console.warn('Could not fetch income statement from API')
      }
      
    } else {
      // For other tickers, try to fetch from API
      const [balanceSheets, incomeStatements] = await Promise.all([
        fetchBalanceSheet(ticker, apiKey, 'quarterly', 4),
        fetchIncomeStatement(ticker, apiKey, 'quarterly', 4)
      ])

      const latestBalance = balanceSheets[0] || {}
      const latestIncome = incomeStatements[0] || {}

      // Calculate total debt (long-term + current)
      const longTermDebt = latestBalance.long_term_debt_and_capital_lease_obligations || 0
      const currentDebt = latestBalance.debt_current || 0
      totalDebt = (longTermDebt + currentDebt) / 1_000_000

      // Get cash
      cashOnHand = (latestBalance.cash_and_equivalents || 0) / 1_000_000

      // Calculate interest rate from interest expense and total debt
      interestExpense = Math.abs(latestIncome.interest_expense || 0) / 1_000_000
      interestRate = totalDebt > 0 ? (interestExpense / totalDebt) * 100 : 0

      revenue = latestIncome.revenues ? latestIncome.revenues / 1_000_000 : undefined
      operatingIncome = latestIncome.operating_income_loss ? latestIncome.operating_income_loss / 1_000_000 : undefined
      fiscalPeriod = latestBalance.fiscal_period
    }

    // Calculate net debt
    const netDebt = totalDebt - cashOnHand

    // Convert to millions for display
    const metrics: FinancialMetrics = {
      ticker: ticker.toUpperCase(),
      companyName: tickerDetails.name || ticker,
      cashOnHand,
      totalDebt,
      netDebt,
      sharesOutstanding: sharesOutstanding / 1_000_000,
      marketCap: tickerDetails.market_cap ? tickerDetails.market_cap / 1_000_000 : undefined,
      revenue,
      operatingIncome,
      interestExpense,
      interestRate: Math.round(interestRate * 100) / 100,
      lastUpdated: new Date().toISOString(),
      fiscalPeriod
    }

    console.log('✅ Financial metrics calculated:', {
      ticker: metrics.ticker,
      cashOnHand: `$${metrics.cashOnHand.toFixed(1)}M`,
      totalDebt: `$${metrics.totalDebt.toFixed(1)}M`,
      netDebt: `$${metrics.netDebt.toFixed(1)}M`,
      sharesOutstanding: `${metrics.sharesOutstanding.toFixed(1)}M`,
      interestRate: `${metrics.interestRate.toFixed(2)}%`,
      interestExpense: `$${metrics.interestExpense.toFixed(1)}M`
    })

    return metrics

  } catch (error) {
    console.error(`❌ Error fetching financial metrics for ${ticker}:`, error)
    throw error
  }
}
