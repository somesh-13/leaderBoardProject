/**
 * Enhanced Price API Route
 * 
 * Implements the developer doc specification:
 * - GET /api/prices?tickers=PLTR,AAPL,HOOD
 * - Returns 6/16/2025 closes and current prices
 * - Proper caching and error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { getBatchPriceData, normalizeTicker, getCacheStats } from '@/lib/services/polygonService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tickersParam = searchParams.get('tickers')
    
    if (!tickersParam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: tickers',
          example: '/api/prices?tickers=PLTR,AAPL,HOOD',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
    
    // Parse and normalize tickers
    const tickers = tickersParam
      .split(',')
      .map(ticker => normalizeTicker(ticker))
      .filter(ticker => ticker.length > 0)
    
    if (tickers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid tickers provided',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
    
    if (tickers.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many tickers requested (max 50)',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
    
    console.log(`🎯 Price API request for ${tickers.length} tickers:`, tickers)
    
    // Fetch price data using the enhanced Polygon service
    const priceData = await getBatchPriceData(tickers)
    
    // Get cache stats for monitoring
    const cacheStats = getCacheStats()
    
    const response = {
      success: true,
      data: priceData,
      metadata: {
        requestedTickers: tickers.length,
        returnedTickers: Object.keys(priceData).length,
        cacheStats,
        timestamp: new Date().toISOString()
      }
    }
    
    console.log(`✅ Price API response for ${Object.keys(priceData).length} tickers`)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Price API error:', error)
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.tickers || !Array.isArray(body.tickers)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request body must contain a "tickers" array',
          example: { tickers: ['PLTR', 'AAPL', 'HOOD'] },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
    
    // Normalize tickers
    const tickers = body.tickers
      .map((ticker: string) => normalizeTicker(ticker))
      .filter((ticker: string) => ticker.length > 0)
    
    if (tickers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid tickers provided',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
    
    if (tickers.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many tickers requested (max 50)',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
    
    console.log(`🎯 Price API POST request for ${tickers.length} tickers:`, tickers)
    
    // Fetch price data
    const priceData = await getBatchPriceData(tickers)
    
    // Get cache stats
    const cacheStats = getCacheStats()
    
    const response = {
      success: true,
      data: priceData,
      metadata: {
        requestedTickers: tickers.length,
        returnedTickers: Object.keys(priceData).length,
        cacheStats,
        timestamp: new Date().toISOString()
      }
    }
    
    console.log(`✅ Price API POST response for ${Object.keys(priceData).length} tickers`)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('❌ Price API POST error:', error)
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
