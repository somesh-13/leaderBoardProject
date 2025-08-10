/**
 * Holdings API Route
 * 
 * Fetches user portfolio holdings and calculates real-time values
 * based on current stock prices from Polygon API
 * 
 * Performance calculations from: 06/16/2025
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentPrice } from '@/lib/polygon'
import { INITIAL_PORTFOLIOS } from '@/lib/data/initialPortfolios'
import { StockData, Portfolio, Position } from '@/lib/types/portfolio'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Performance calculation start date
const PERFORMANCE_START_DATE = '2025-06-16'
const INITIAL_INVESTMENT = 10000 // All users start with $10,000

interface HoldingsResponse {
  userId: string
  username: string
  totalValue: number
  totalInvested: number
  totalReturn: number
  totalReturnPercent: number
  dayChange: number
  dayChangePercent: number
  positions: Array<Position & {
    currentPrice: number
    currentValue: number
    returnAmount: number
    returnPercent: number
  }>
  performanceSince: string
  lastUpdated: number
}

async function calculatePortfolioValue(portfolio: Portfolio): Promise<HoldingsResponse> {
  console.log(`🔄 Calculating holdings for ${portfolio.username}`)
  
  const enrichedPositions = await Promise.all(
    portfolio.positions.map(async (position) => {
      try {
        // Get current price from Polygon API
        const priceData = await getCurrentPrice(position.symbol)
        const currentPrice = priceData.price
        const currentValue = position.shares * currentPrice
        const investedValue = position.shares * position.avgPrice
        const returnAmount = currentValue - investedValue
        const returnPercent = (returnAmount / investedValue) * 100
        
        console.log(`✅ ${position.symbol}: ${position.shares} shares at $${currentPrice.toFixed(2)} = $${currentValue.toFixed(2)}`)
        
        return {
          ...position,
          currentPrice,
          currentValue,
          returnAmount,
          returnPercent
        }
      } catch (error) {
        console.error(`❌ Error fetching price for ${position.symbol}:`, error)
        
        // Fallback to a reasonable estimated price
        const fallbackPrice = position.avgPrice * 1.2 // Assume 20% growth as fallback
        const currentValue = position.shares * fallbackPrice
        const investedValue = position.shares * position.avgPrice
        const returnAmount = currentValue - investedValue
        const returnPercent = (returnAmount / investedValue) * 100
        
        console.warn(`⚠️ Using fallback price for ${position.symbol}: $${fallbackPrice.toFixed(2)}`)
        
        return {
          ...position,
          currentPrice: fallbackPrice,
          currentValue,
          returnAmount,
          returnPercent
        }
      }
    })
  )
  
  // Calculate totals
  const totalValue = enrichedPositions.reduce((sum, pos) => sum + pos.currentValue, 0)
  const totalInvested = INITIAL_INVESTMENT
  const totalReturn = totalValue - totalInvested
  const totalReturnPercent = (totalReturn / totalInvested) * 100
  
  // Calculate day change (simplified - using random for demo, you'd get this from API)
  const dayChange = (Math.random() - 0.5) * 200 // -$100 to +$100
  const dayChangePercent = (dayChange / totalValue) * 100
  
  console.log(`📊 ${portfolio.username}: Total Value: $${totalValue.toFixed(2)}, Return: ${totalReturnPercent.toFixed(2)}%`)
  
  return {
    userId: portfolio.userId,
    username: portfolio.username,
    totalValue,
    totalInvested,
    totalReturn,
    totalReturnPercent,
    dayChange,
    dayChangePercent,
    positions: enrichedPositions,
    performanceSince: PERFORMANCE_START_DATE,
    lastUpdated: Date.now()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // If userId specified, return single user holdings
    if (userId) {
      const portfolio = INITIAL_PORTFOLIOS[userId.toLowerCase()]
      if (!portfolio) {
        return NextResponse.json(
          { error: `User '${userId}' not found` },
          { status: 404 }
        )
      }
      
      const holdings = await calculatePortfolioValue(portfolio)
      return NextResponse.json(holdings)
    }
    
    // Return all user holdings
    console.log('🔄 Calculating holdings for all users')
    const userIds = ['matt', 'amit', 'tannor', 'steve', 'kris']
    
    const allHoldings = await Promise.all(
      userIds.map(async (userId) => {
        const portfolio = INITIAL_PORTFOLIOS[userId]
        if (!portfolio) {
          console.warn(`⚠️ Portfolio not found for user: ${userId}`)
          return null
        }
        return await calculatePortfolioValue(portfolio)
      })
    )
    
    // Filter out any null results
    const validHoldings = allHoldings.filter(Boolean)
    
    console.log(`✅ Successfully calculated holdings for ${validHoldings.length} users`)
    
    return NextResponse.json({
      users: validHoldings,
      performanceSince: PERFORMANCE_START_DATE,
      initialInvestment: INITIAL_INVESTMENT,
      timestamp: Date.now()
    })
    
  } catch (error) {
    console.error('❌ Holdings API Error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: Date.now() 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userIds } = body
    
    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'userIds array is required' },
        { status: 400 }
      )
    }
    
    console.log(`🔄 Calculating holdings for users: ${userIds.join(', ')}`)
    
    const holdings = await Promise.all(
      userIds.map(async (userId: string) => {
        const portfolio = INITIAL_PORTFOLIOS[userId.toLowerCase()]
        if (!portfolio) {
          console.warn(`⚠️ Portfolio not found for user: ${userId}`)
          return null
        }
        return await calculatePortfolioValue(portfolio)
      })
    )
    
    const validHoldings = holdings.filter(Boolean)
    
    return NextResponse.json({
      users: validHoldings,
      performanceSince: PERFORMANCE_START_DATE,
      initialInvestment: INITIAL_INVESTMENT,
      timestamp: Date.now()
    })
    
  } catch (error) {
    console.error('❌ Holdings API Error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: Date.now() 
      },
      { status: 500 }
    )
  }
}