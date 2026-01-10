// Benzinga Earnings API Types

export interface BenzingaEarningsRecord {
  // Revenue fields
  estimated_revenue?: number
  actual_revenue?: number
  previous_revenue?: number
  revenue_surprise?: number
  revenue_surprise_percent?: number
  
  // EPS fields
  estimated_eps?: number
  actual_eps?: number
  previous_eps?: number
  eps_surprise?: number
  eps_surprise_percent?: number
  
  // Time period fields
  fiscal_year?: number
  fiscal_period?: string // Q1, Q2, Q3, Q4, H1, H2, FY
  date?: string // YYYY-MM-DD
  time?: string // HH:MM:SS UTC
  
  // Company identification
  ticker?: string
  company_name?: string
  benzinga_id?: string
  
  // Metadata
  currency?: string
  date_status?: 'projected' | 'confirmed'
  importance?: number
  revenue_method?: 'gaap' | 'non-gaap'
  eps_method?: 'gaap' | 'non-gaap'
  last_updated?: string
  notes?: string
}

export interface BenzingaEarningsResponse {
  count: number
  request_id: string
  results: BenzingaEarningsRecord[]
  status: string
  next_url?: string
}

// Transformed data for the component
export interface RevenueDataPoint {
  period: string // e.g., "Q1 24", "2024"
  revenue: number // in millions or billions
  total: number // same as revenue (for compatibility)
  isHistorical: boolean // true for actual data, false for estimates
  fiscalYear: number
  fiscalPeriod: string
}

export interface RevenueEstimatesData {
  quarterly: RevenueDataPoint[]
  yearly: RevenueDataPoint[]
  currency: string
  companyName: string
  ticker: string
}

// Metrics for display
export interface RevenueMetrics {
  historicalPeak: number
  latestRevenue: number
  projectedGrowthRate: number
  latestPeriod: string
}
