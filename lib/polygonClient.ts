/**
 * Polygon/Massive API Client for Real Market & Fundamental Data
 * 
 * Provides unified access to:
 * - Reference/metadata (ticker info, company name)
 * - Real-time prices (previous close, daily stats)
 * - Fundamentals (balance sheet, income statement, cash flow)
 * - Shares outstanding and market cap
 */

const POLYGON_API_BASE = 'https://api.polygon.io'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TickerReference {
  ticker: string
  name: string
  market?: string
  primary_exchange?: string
  locale?: string
  currency_name?: string
  type?: string
}

export interface PreviousClose {
  ticker: string
  close: number
  high: number
  low: number
  open: number
  volume: number
  timestamp: number
  change?: number
  changePercent?: number
}

export interface FinancialStatement {
  fiscal_period?: string
  fiscal_year?: string
  start_date?: string
  end_date?: string
  filing_date?: string
}

export interface BalanceSheet extends FinancialStatement {
  cash_and_cash_equivalents?: number
  total_debt?: number
  long_term_debt?: number
  current_debt?: number
  total_assets?: number
  total_liabilities?: number
}

export interface IncomeStatement extends FinancialStatement {
  total_revenue?: number
  revenues?: number
  operating_income?: number
  operating_income_loss?: number
  net_income?: number
  net_income_loss?: number
  interest_expense?: number
}

export interface CashFlowStatement extends FinancialStatement {
  free_cash_flow?: number
  net_cash_flow_from_operating_activities?: number
  net_cash_flow_from_investing_activities?: number
}

export interface TickerDetails {
  ticker: string
  name: string
  market_cap?: number
  share_class_shares_outstanding?: number
  weighted_shares_outstanding?: number
  primary_exchange?: string
  currency_name?: string
}

/**
 * Comprehensive snapshot of a company's financial data
 */
export interface CompanySnapshot {
  // Metadata
  ticker: string
  name: string
  currency?: string
  
  // Price data
  previousClose: number | null
  dayHigh?: number
  dayLow?: number
  volume?: number
  changePercent?: number
  
  // Balance sheet
  cash: number | null
  totalDebt: number | null
  netDebt: number | null
  
  // Income statement
  revenue: number | null
  operatingIncome: number | null
  netIncome: number | null
  
  // Shares & market cap
  sharesOutstanding: number | null
  marketCap: number | null
  
  // Metadata
  lastUpdated: string
  fiscalPeriod?: string
  fiscalYear?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Make a GET request to Polygon API
 */
async function polygonGet<T>(
  path: string, 
  params: Record<string, string | number> = {}
): Promise<T> {
  const apiKey = process.env.POLYGON_API_KEY || process.env.NEXT_PUBLIC_POLYGON_API_KEY
  
  if (!apiKey) {
    throw new Error('Polygon API key not configured')
  }
  
  const searchParams = new URLSearchParams({
    apiKey,
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    )
  })
  
  const url = `${POLYGON_API_BASE}${path}?${searchParams.toString()}`
  
  console.log(`🔄 Fetching: ${path}`)
  
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { 'User-Agent': 'leaderboard-app/1.0' }
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Polygon API error ${response.status}: ${errorText}`)
  }
  
  return response.json() as Promise<T>
}

// ============================================================================
// API METHODS
// ============================================================================

/**
 * Get ticker reference data (company name, market, exchange, currency)
 * 
 * @example
 * const ref = await getTickerReference('NBIS')
 * console.log(ref.name) // "Nebius Group N.V."
 */
export async function getTickerReference(ticker: string): Promise<TickerReference> {
  const data = await polygonGet<{ results: TickerReference }>(
    `/v3/reference/tickers/${ticker.toUpperCase()}`
  )
  
  if (!data.results) {
    throw new Error(`No reference data found for ${ticker}`)
  }
  
  return data.results
}

/**
 * Get previous day's closing data (price, high, low, volume)
 * 
 * @example
 * const prev = await getPreviousClose('NBIS')
 * console.log(prev.close) // Current market price based on previous close
 */
export async function getPreviousClose(ticker: string): Promise<PreviousClose> {
  const data = await polygonGet<{ 
    ticker: string
    results?: Array<{
      c: number  // close
      h: number  // high
      l: number  // low
      o: number  // open
      v: number  // volume
      t: number  // timestamp
    }>
  }>(`/v2/aggs/ticker/${ticker.toUpperCase()}/prev`)
  
  if (!data.results || data.results.length === 0) {
    throw new Error(`No previous close data found for ${ticker}`)
  }
  
  const result = data.results[0]
  
  return {
    ticker: ticker.toUpperCase(),
    close: result.c,
    high: result.h,
    low: result.l,
    open: result.o,
    volume: result.v,
    timestamp: result.t
  }
}

/**
 * Get fundamental financial data (balance sheet, income statement, cash flow)
 * 
 * @param ticker Stock symbol
 * @param timeframe 'annual' or 'quarterly'
 * @param limit Number of periods to fetch (default: 1 for latest)
 */
export async function getFinancials(
  ticker: string,
  timeframe: 'annual' | 'quarterly' = 'annual',
  limit = 1
): Promise<{
  balanceSheet: BalanceSheet | null
  incomeStatement: IncomeStatement | null
  cashFlow: CashFlowStatement | null
}> {
  const data = await polygonGet<{
    results?: Array<{
      fiscal_period?: string
      fiscal_year?: string
      start_date?: string
      end_date?: string
      filing_date?: string
      financials?: {
        balance_sheet?: Record<string, { value?: number, unit?: string }>
        income_statement?: Record<string, { value?: number, unit?: string }>
        cash_flow_statement?: Record<string, { value?: number, unit?: string }>
      }
    }>
  }>(`/vX/reference/financials`, {
    ticker: ticker.toUpperCase(),
    timeframe,
    limit: limit.toString()
  })
  
  if (!data.results || data.results.length === 0) {
    console.warn(`⚠️ No financial data found for ${ticker}`)
    return {
      balanceSheet: null,
      incomeStatement: null,
      cashFlow: null
    }
  }
  
  const latest = data.results[0]
  const financials = latest.financials || {}
  
  // Parse balance sheet
  const bs = financials.balance_sheet || {}
  const balanceSheet: BalanceSheet = {
    cash_and_cash_equivalents: bs.cash_and_cash_equivalents?.value || 
                                bs.cash?.value ||
                                bs.cash_and_equivalents?.value,
    total_debt: bs.total_debt?.value ||
                bs.long_term_debt?.value,
    long_term_debt: bs.long_term_debt?.value ||
                    bs.noncurrent_debt?.value,
    current_debt: bs.current_debt?.value ||
                  bs.short_term_debt?.value,
    total_assets: bs.assets?.value ||
                  bs.total_assets?.value,
    total_liabilities: bs.liabilities?.value ||
                       bs.total_liabilities?.value,
    fiscal_period: latest.fiscal_period,
    fiscal_year: latest.fiscal_year,
    start_date: latest.start_date,
    end_date: latest.end_date
  }
  
  // Parse income statement
  const is = financials.income_statement || {}
  const incomeStatement: IncomeStatement = {
    total_revenue: is.revenues?.value ||
                   is.total_revenue?.value,
    revenues: is.revenues?.value,
    operating_income: is.operating_income_loss?.value ||
                     is.operating_income?.value,
    operating_income_loss: is.operating_income_loss?.value,
    net_income: is.net_income_loss?.value ||
                is.net_income?.value,
    net_income_loss: is.net_income_loss?.value,
    interest_expense: is.interest_expense?.value,
    fiscal_period: latest.fiscal_period,
    fiscal_year: latest.fiscal_year,
    start_date: latest.start_date,
    end_date: latest.end_date
  }
  
  // Parse cash flow statement
  const cf = financials.cash_flow_statement || {}
  const cashFlow: CashFlowStatement = {
    free_cash_flow: cf.free_cash_flow?.value,
    net_cash_flow_from_operating_activities: cf.net_cash_flow_from_operating_activities?.value,
    net_cash_flow_from_investing_activities: cf.net_cash_flow_from_investing_activities?.value,
    fiscal_period: latest.fiscal_period,
    fiscal_year: latest.fiscal_year,
    start_date: latest.start_date,
    end_date: latest.end_date
  }
  
  return {
    balanceSheet,
    incomeStatement,
    cashFlow
  }
}

/**
 * Get ticker details including shares outstanding
 */
export async function getTickerDetails(ticker: string): Promise<TickerDetails> {
  const data = await polygonGet<{ results?: TickerDetails }>(
    `/v3/reference/tickers/${ticker.toUpperCase()}`
  )
  
  if (!data.results) {
    throw new Error(`No ticker details found for ${ticker}`)
  }
  
  return data.results
}

// ============================================================================
// COMPOSITE METHOD - Get everything at once
// ============================================================================

/**
 * Get comprehensive company snapshot combining all data sources
 * 
 * This is the main method you should use for NBIS and other tickers.
 * It fetches:
 * - Company name, currency, market info
 * - Current price from previous close
 * - Balance sheet (cash, debt)
 * - Income statement (revenue, operating income, net income)
 * - Shares outstanding and market cap
 * 
 * @example
 * const snapshot = await getCompanySnapshot('NBIS')
 * console.log(snapshot.name)           // "Nebius Group N.V."
 * console.log(snapshot.previousClose)   // 89.46
 * console.log(snapshot.cash)            // Cash on hand
 * console.log(snapshot.sharesOutstanding) // 218M
 */
export async function getCompanySnapshot(ticker: string): Promise<CompanySnapshot> {
  console.log(`📊 Fetching complete snapshot for ${ticker}...`)
  
  try {
    // Fetch all data in parallel
    const [reference, prevClose, financials, details] = await Promise.all([
      getTickerReference(ticker).catch(() => null),
      getPreviousClose(ticker).catch(() => null),
      getFinancials(ticker, 'annual', 1).catch(() => ({ 
        balanceSheet: null, 
        incomeStatement: null, 
        cashFlow: null 
      })),
      getTickerDetails(ticker).catch(() => null)
    ])
    
    // Extract values, converting from raw values to millions where needed
    const cash = financials.balanceSheet?.cash_and_cash_equivalents 
      ? financials.balanceSheet.cash_and_cash_equivalents / 1_000_000 
      : null
      
    const totalDebt = financials.balanceSheet?.total_debt
      ? financials.balanceSheet.total_debt / 1_000_000
      : null
      
    const netDebt = (cash !== null && totalDebt !== null) 
      ? totalDebt - cash 
      : null
      
    const revenue = financials.incomeStatement?.total_revenue
      ? financials.incomeStatement.total_revenue / 1_000_000
      : null
      
    const operatingIncome = financials.incomeStatement?.operating_income
      ? financials.incomeStatement.operating_income / 1_000_000
      : null
      
    const netIncome = financials.incomeStatement?.net_income
      ? financials.incomeStatement.net_income / 1_000_000
      : null
      
    const sharesOutstanding = details?.share_class_shares_outstanding
      ? details.share_class_shares_outstanding / 1_000_000
      : details?.weighted_shares_outstanding
        ? details.weighted_shares_outstanding / 1_000_000
        : null
        
    const marketCap = details?.market_cap
      ? details.market_cap / 1_000_000
      : null
    
    const snapshot: CompanySnapshot = {
      // Metadata
      ticker: ticker.toUpperCase(),
      name: reference?.name || details?.name || ticker,
      currency: reference?.currency_name || details?.currency_name,
      
      // Price
      previousClose: prevClose?.close || null,
      dayHigh: prevClose?.high,
      dayLow: prevClose?.low,
      volume: prevClose?.volume,
      changePercent: prevClose?.changePercent,
      
      // Balance sheet (in millions)
      cash,
      totalDebt,
      netDebt,
      
      // Income statement (in millions)
      revenue,
      operatingIncome,
      netIncome,
      
      // Shares (in millions)
      sharesOutstanding,
      marketCap,
      
      // Metadata
      lastUpdated: new Date().toISOString(),
      fiscalPeriod: financials.balanceSheet?.fiscal_period,
      fiscalYear: financials.balanceSheet?.fiscal_year
    }
    
    console.log('✅ Snapshot complete:', {
      ticker: snapshot.ticker,
      name: snapshot.name,
      price: snapshot.previousClose ? `$${snapshot.previousClose.toFixed(2)}` : 'N/A',
      cash: snapshot.cash ? `$${snapshot.cash.toFixed(1)}M` : 'N/A',
      debt: snapshot.totalDebt ? `$${snapshot.totalDebt.toFixed(1)}M` : 'N/A',
      shares: snapshot.sharesOutstanding ? `${snapshot.sharesOutstanding.toFixed(1)}M` : 'N/A'
    })
    
    return snapshot
    
  } catch (error) {
    console.error(`❌ Error fetching snapshot for ${ticker}:`, error)
    throw error
  }
}
