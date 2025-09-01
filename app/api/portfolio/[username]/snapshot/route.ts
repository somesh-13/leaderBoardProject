/**
 * Portfolio Snapshot API Endpoint - MongoDB Integration
 * 
 * GET /api/portfolio/:username/snapshot?at=YYYY-MM-DD
 * 
 * Returns normalized portfolio snapshot used by both profile and leaderboard
 * for consistency. This is the source of truth for portfolio data.
 * 
 * Updated to fetch from MongoDB with static fallback for development.
 */

import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_PORTFOLIOS } from '@/lib/data/initialPortfolios';
import { priceService } from '@/lib/services/priceService';
import { portfolioService } from '@/lib/services/portfolioService';
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

    console.log(`📊 Fetching portfolio snapshot for ${username}${atDate ? ` at ${atDate}` : ''}`);

    // Primary: Try to get portfolio from MongoDB
    let portfolioData = await portfolioService.getPortfolioByUsername(username);
    let isFromMongoDB = true;
    
    // Fallback: Use static data if not found in MongoDB
    if (!portfolioData) {
      const staticData = INITIAL_PORTFOLIOS[username];
      if (staticData) {
        console.log(`📊 Using static fallback data for ${username}`);
        isFromMongoDB = false;
        
        // For static data, we need to calculate metrics manually
        const symbols = staticData.positions.map(pos => pos.symbol);
        const pricesMap = await priceService.getBatchCurrentPrices(symbols);
        
        // Calculate position values with real-time prices
        const positions: Position[] = await Promise.all(
          staticData.positions.map(async (pos) => {
            const priceData = pricesMap.get(pos.symbol.toUpperCase());
            const currentPrice = priceData?.price || pos.avgPrice;
            
            const currentValue = pos.shares * currentPrice;
            const investedValue = pos.shares * pos.avgPrice;
            const returnValue = currentValue - investedValue;
            const returnPct = investedValue > 0 ? (returnValue / investedValue) * 100 : 0;

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
        const invested = staticData.totalInvested || 10000;
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

        // Create calculated portfolio object
        portfolioData = {
          userId: staticData.userId,
          username: staticData.username,
          positions: staticData.positions,
          totalValue,
          totalInvested: invested,
          totalReturn: totalValue - invested,
          totalReturnPercent: totalReturnPct,
          dayChange: totalDayChangeValue,
          dayChangePercent: dayChangePct,
          tier: staticData.tier,
          sector: staticData.sector,
          primaryStock: staticData.primaryStock,
          lastCalculated: Date.now()
        };
      } else {
        return NextResponse.json({
          success: false,
          error: `Portfolio not found for user: ${username}`,
          timestamp: new Date().toISOString()
        } as APIResponse<never>, { status: 404 });
      }
    } else {
      console.log(`📊 Using MongoDB data for ${username}`);
    }

    // Calculate sector allocations
    const pricesMap = await priceService.getBatchCurrentPrices(
      portfolioData.positions.map(pos => pos.symbol)
    );

    const sectorMap = new Map<string, number>();
    const positions: Position[] = portfolioData.positions.map(pos => {
      const priceData = pricesMap.get(pos.symbol.toUpperCase());
      const currentPrice = priceData?.price || pos.avgPrice;
      const currentValue = pos.shares * currentPrice;
      const investedValue = pos.shares * pos.avgPrice;
      const returnValue = currentValue - investedValue;
      const returnPct = investedValue > 0 ? (returnValue / investedValue) * 100 : 0;
      
      const sector = pos.sector || 'Other';
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + currentValue);

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
    });

    const sectorAllocations: SectorAllocation[] = Array.from(sectorMap.entries())
      .map(([sector, value]) => ({
        sector,
        value,
        percentage: portfolioData.totalValue > 0 ? (value / portfolioData.totalValue) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);

    const primarySector = sectorAllocations[0]?.sector || portfolioData.sector || 'Technology';

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
      totalValue: portfolioData.totalValue,
      invested: portfolioData.totalInvested,
      totalReturnPct: portfolioData.totalReturnPercent,
      dayChangePct: portfolioData.dayChangePercent,
      dayChangeValue: portfolioData.dayChange,
      primarySector,
      lastUpdated: new Date().toISOString(),
      positions,
      sectorAllocations
    };

    console.log(`✅ Generated snapshot for ${username}: $${portfolioData.totalValue.toFixed(2)} (${portfolioData.totalReturnPercent.toFixed(2)}%) [${isFromMongoDB ? 'MongoDB' : 'Static'}]`);

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