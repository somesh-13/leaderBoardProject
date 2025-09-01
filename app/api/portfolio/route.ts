/**
 * Portfolio API Route - MongoDB Integration
 * 
 * GET /api/portfolio - Fetch all portfolios from MongoDB
 * POST /api/portfolio - Create/Update a portfolio in MongoDB
 */

import { NextRequest, NextResponse } from 'next/server';
import { portfolioService } from '@/lib/services/portfolioService';
import { APIResponse } from '@/lib/types/leaderboard';
import { Portfolio } from '@/lib/types/portfolio';

export const dynamic = 'force-dynamic';

/**
 * GET /api/portfolio
 * Fetch all portfolios from MongoDB
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    console.log(`📊 Portfolio API: ${username ? `Fetching portfolio for ${username}` : 'Fetching all portfolios'}`);

    if (username) {
      // Fetch specific user's portfolio
      const portfolio = await portfolioService.getPortfolioByUsername(username);
      
      if (!portfolio) {
        return NextResponse.json({
          success: false,
          error: `Portfolio not found for user: ${username}`,
          timestamp: new Date().toISOString()
        } as APIResponse<never>, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: portfolio,
        timestamp: new Date().toISOString()
      } as APIResponse<Portfolio>);
    } else {
      // Fetch all portfolios
      const portfolios = await portfolioService.getAllPortfolios();
      
      return NextResponse.json({
        success: true,
        data: portfolios,
        timestamp: new Date().toISOString()
      } as APIResponse<Portfolio[]>);
    }

  } catch (error) {
    console.error(`❌ Error in portfolio API:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as APIResponse<never>, { status: 500 });
  }
}

/**
 * POST /api/portfolio
 * Create or update a portfolio in MongoDB
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, username, positions, totalInvested } = body;

    // Validate required fields
    if (!userId || !username || !positions || !Array.isArray(positions) || !totalInvested) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, username, positions, totalInvested',
        timestamp: new Date().toISOString()
      } as APIResponse<never>, { status: 400 });
    }

    // Validate positions array
    for (const position of positions) {
      if (!position.symbol || !position.shares || !position.avgPrice) {
        return NextResponse.json({
          success: false,
          error: 'Each position must have symbol, shares, and avgPrice',
          timestamp: new Date().toISOString()
        } as APIResponse<never>, { status: 400 });
      }
    }

    console.log(`📊 Creating/updating portfolio for ${username} with ${positions.length} positions`);

    // Save portfolio to MongoDB
    const success = await portfolioService.savePortfolio({
      userId,
      username,
      positions,
      totalInvested
    });

    if (!success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to save portfolio to database',
        timestamp: new Date().toISOString()
      } as APIResponse<never>, { status: 500 });
    }

    // Fetch the updated portfolio with calculated metrics
    const updatedPortfolio = await portfolioService.getPortfolioByUsername(username);

    return NextResponse.json({
      success: true,
      data: updatedPortfolio,
      timestamp: new Date().toISOString()
    } as APIResponse<Portfolio>, { status: 201 });

  } catch (error) {
    console.error(`❌ Error creating/updating portfolio:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as APIResponse<never>, { status: 500 });
  }
}