/**
 * Individual User Leaderboard Entry API
 * 
 * GET /api/leaderboard/:username
 * 
 * Returns LeaderboardEntry for highlighting the current user
 * in the leaderboard display.
 */

import { NextRequest, NextResponse } from 'next/server';
import { APIResponse } from '@/lib/types/leaderboard';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username?.trim();

    if (!username) {
      return NextResponse.json({
        success: false,
        error: 'Username is required',
        timestamp: new Date().toISOString()
      } as APIResponse<never>, { status: 400 });
    }

    // Get the full leaderboard to find the user's rank and position
    const leaderboardUrl = new URL('/api/leaderboard', request.url);
    leaderboardUrl.searchParams.set('period', '1D');
    leaderboardUrl.searchParams.set('pageSize', '100'); // Get more entries to find user
    
    const leaderboardResponse = await fetch(leaderboardUrl);
    
    if (!leaderboardResponse.ok) {
      throw new Error('Failed to fetch leaderboard data');
    }

    const leaderboardData = await leaderboardResponse.json();
    
    if (!leaderboardData.success) {
      throw new Error(leaderboardData.error || 'Failed to fetch leaderboard');
    }

    // Find the user in the leaderboard
    interface LeaderboardEntry {
      user: {
        username: string;
      };
      [key: string]: unknown;
    }
    
    const userEntry = leaderboardData.data.data.find((entry: LeaderboardEntry) => 
      entry.user.username.toLowerCase() === username
    );

    if (!userEntry) {
      return NextResponse.json({
        success: false,
        error: `User '${username}' not found in leaderboard`,
        timestamp: new Date().toISOString()
      } as APIResponse<never>, { status: 404 });
    }

    console.log(`✅ Found leaderboard entry for ${username}: Rank #${userEntry.rank}`);

    return NextResponse.json({
      success: true,
      data: userEntry,
      timestamp: new Date().toISOString()
    } as APIResponse<typeof userEntry>);

  } catch (error) {
    console.error(`❌ Error fetching leaderboard entry for user:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    } as APIResponse<never>, { status: 500 });
  }
}