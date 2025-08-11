/**
 * Portfolio Snapshot API Endpoint
 * 
 * GET /api/portfolio/:username/snapshot?at=YYYY-MM-DD
 * 
 * Returns normalized portfolio snapshot used by both profile and leaderboard
 * for consistency. This is the source of truth for portfolio data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PORTFOLIOS } from '@/lib/data/initialPortfolios';
import { priceService } from '@/lib/services/priceService';
import { 
  PortfolioSnapshot, 
  Position, 
  User, 
  APIResponse,
  SectorAllocation 
} from '@/lib/types/leaderboard';

export const dynamic = 'force-dynamic';

interface PortfolioSnapshotResponse extends PortfolioSnapshot {
  user: User;
  positions: Position[];
  sectorAllocations: SectorAllocation[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const username = params.username?.toLowerCase();
    const atDate = searchParams.get('at'); // YYYY-MM-DD format
    
    if (!username) {
      return NextResponse.json({
        success: false,
        error: 'Username is required',
        timestamp: new Date().toISOString()
      } as APIResponse<never>, { status: 400 });
    }

    // Get portfolio data from our initial portfolios
    const portfolioData = INITIAL_PORTFOLIOS[username];
    if (!portfolioData) {
      return NextResponse.json({
        success: false,
        error: `Portfolio not found for user: ${username}`,
        timestamp: new Date().toISOString()
      } as APIResponse<never>, { status: 404 });
    }

    console.log(`📊 Generating snapshot for ${username}${atDate ? ` at ${atDate}` : ''}`);

    // Get current prices for all positions
    const symbols = portfolioData.positions.map(pos => pos.symbol);
    const pricesMap = await priceService.getBatchCurrentPrices(symbols);
    
    console.log(`💰 Fetched prices for ${pricesMap.size} symbols`);

    // Calculate position values with real-time prices
    const positions: Position[] = await Promise.all(
      portfolioData.positions.map(async (pos) => {
        const priceData = pricesMap.get(pos.symbol.toUpperCase());
        const currentPrice = priceData?.price || pos.avgPrice; // Fallback to avg price
        
        const currentValue = pos.shares * currentPrice;
        const investedValue = pos.shares * pos.avgPrice;
        const returnValue = currentValue - investedValue;
        const returnPct = investedValue > 0 ? (returnValue / investedValue) * 100 : 0;

        // Calculate day change for this position
        // const dayChange = await priceService.calculateDayChange(pos.symbol, pos.shares);

        return {
          symbol: pos.symbol,
          sector: pos.sector,
          shares: pos.shares,
          avgPrice: pos.avgPrice,
          currentPrice,
          currentValue,
          returnPct,
          returnValue
        };
      })
    );

    // Calculate portfolio totals
    const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
    const invested = 10000; // All users started with $10,000
    const totalReturnPct = invested > 0 ? ((totalValue - invested) / invested) * 100 : 0;

    // Calculate portfolio day change
    let totalDayChangeValue = 0;
    let totalPriorCloseValue = 0;
    
    for (const pos of positions) {
      const dayChange = await priceService.calculateDayChange(pos.symbol, pos.shares);
      totalDayChangeValue += dayChange.dayChangeValue;
      totalPriorCloseValue += dayChange.priorClosePrice * pos.shares;
    }
    
    const dayChangePct = totalPriorCloseValue > 0 ? (totalDayChangeValue / totalPriorCloseValue) * 100 : 0;

    // Calculate sector allocations
    const sectorMap = new Map<string, number>();
    positions.forEach(pos => {
      const sector = pos.sector || 'Other';
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + pos.currentValue);
    });

    const sectorAllocations: SectorAllocation[] = Array.from(sectorMap.entries())
      .map(([sector, value]) => ({
        sector,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);

    const primarySector = sectorAllocations[0]?.sector || 'Technology';

    // Create user object
    const user: User = {
      id: portfolioData.userId,
      username: portfolioData.username,
      displayName: portfolioData.username,
      primarySector
    };

    // Build the snapshot response
    const snapshot: PortfolioSnapshotResponse = {
      user,
      totalValue,
      invested,
      totalReturnPct,
      dayChangePct,
      dayChangeValue: totalDayChangeValue,
      primarySector,
      lastUpdated: new Date().toISOString(),
      positions,
      sectorAllocations
    };

    console.log(`✅ Generated snapshot for ${username}: $${totalValue.toFixed(2)} (${totalReturnPct.toFixed(2)}%)`);

    return NextResponse.json({
      success: true,
      data: snapshot,
      timestamp: new Date().toISOString()
    } as APIResponse<PortfolioSnapshotResponse>);

  } catch (error) {
    console.error(`❌ Error generating portfolio snapshot:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as APIResponse<never>, { status: 500 });
  }
}