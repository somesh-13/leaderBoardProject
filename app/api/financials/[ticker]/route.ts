import { NextResponse } from 'next/server'
import { fetchFinancialMetrics } from '@/lib/services/polygonFinancialService'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/financials/[ticker]
 * 
 * Fetches comprehensive financial metrics for a ticker from Polygon.io
 * Includes: cash, debt, shares outstanding, interest rates, etc.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker: rawTicker } = await params
  const ticker = rawTicker.toUpperCase()
  
  // Get API key from environment or query params (for testing)
  const { searchParams } = new URL(request.url)
  const apiKey = searchParams.get('apiKey') || 
                 process.env.POLYGON_API_KEY || 
                 process.env.NEXT_PUBLIC_POLYGON_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { 
        error: 'Polygon API key not configured',
        message: 'Please set POLYGON_API_KEY in environment variables' 
      },
      { status: 500 }
    )
  }

  try {
    console.log(`📊 Fetching financial metrics for ${ticker}`)
    
    const metrics = await fetchFinancialMetrics(ticker, apiKey)
    
    return NextResponse.json({
      success: true,
      data: metrics
    })
    
  } catch (error: any) {
    console.error(`❌ Error fetching financial metrics for ${ticker}:`, error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch financial metrics',
        message: error.message,
        ticker 
      },
      { status: 500 }
    )
  }
}
