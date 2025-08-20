/**
 * User Progress API Endpoint
 * 
 * GET /api/user-progress?userId=123&contentId=lesson-1
 * POST /api/user-progress { userId, contentId, progress: { percentage: 50 } }
 * 
 * Tracks user learning progress and achievements in the course system.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CourseContentService } from '@/lib/mongodb';
import { 
  userProgressUpdateSchema,
  type UserProgressResponse,
  type UserProgress,
  type Achievement,
  type Milestone
} from '@/lib/types/course';

export const dynamic = 'force-dynamic';

// GET: Fetch user progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const contentId = searchParams.get('contentId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId parameter is required',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    console.log(`👤 Fetching progress for user: ${userId}${contentId ? `, content: ${contentId}` : ''}`);

    const progressArray = await CourseContentService.getUserProgress(userId, contentId || undefined);

    return NextResponse.json({
      success: true,
      data: progressArray,
      total: progressArray.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ User progress fetch error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user progress',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// POST: Update user progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const updateData = userProgressUpdateSchema.parse(body);
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    console.log(`📊 Updating progress for user ${userId}, content: ${updateData.contentId}`);

    // Get current progress to determine what type of content this is
    const currentProgress = await CourseContentService.getUserProgress(userId, updateData.contentId);
    const existingProgress = currentProgress[0];

    // Determine content type if not provided
    let contentType = updateData.metadata?.contentType as string;
    if (!contentType && existingProgress) {
      contentType = existingProgress.contentType;
    } else if (!contentType) {
      // Fetch content to determine type
      const content = await CourseContentService.getContentById(updateData.contentId);
      contentType = content?.type || 'lesson';
    }

    // Update progress
    const progressUpdate = {
      contentId: updateData.contentId,
      contentType: contentType as 'questionnaire' | 'lesson' | 'achievement' | 'milestone',
      progress: {
        // Start with defaults
        percentage: 0,
        timeSpent: 0,
        attempts: 0,
        // Spread existing progress
        ...existingProgress?.progress,
        // Apply updates
        ...(updateData.progress && {
          percentage: updateData.progress.percentage ?? existingProgress?.progress?.percentage ?? 0,
          timeSpent: updateData.progress.timeSpent ?? existingProgress?.progress?.timeSpent ?? 0,
          attempts: existingProgress?.progress?.attempts ?? 0,
        }),
        // Handle score mapping if provided
        ...(updateData.progress?.score !== undefined && {
          lastAttemptScore: updateData.progress.score,
          bestScore: Math.max(
            existingProgress?.progress?.bestScore ?? 0,
            updateData.progress.score
          ),
          attempts: (existingProgress?.progress?.attempts ?? 0) + 1
        })
      },
      metadata: {
        ...existingProgress?.metadata,
        ...updateData.metadata,
      },
      // Only include status if it's defined
      ...(updateData.status && { status: updateData.status }),
    };

    const updatedProgress = await CourseContentService.updateUserProgress(
      userId,
      updateData.contentId,
      progressUpdate
    );

    // Check for newly unlocked achievements and milestones
    const newAchievements: Achievement[] = [];
    const newMilestones: Milestone[] = [];

    // Update user stats if progress was completed
    if (updateData.status === 'completed') {
      await updateUserStatsOnCompletion(userId, contentType, updateData.progress?.score);
    }

    // Check for achievements based on new progress
    if (updateData.progress?.percentage === 100 || updateData.status === 'completed') {
      const achievements = await checkForNewAchievements(userId, updatedProgress);
      newAchievements.push(...achievements);
    }

    const response: UserProgressResponse = {
      success: true,
      data: updatedProgress,
      timestamp: new Date().toISOString(),
      // Only include achievements and milestones if they exist
      ...(newAchievements.length > 0 && { achievements: newAchievements }),
      ...(newMilestones.length > 0 && { milestones: newMilestones }),
    };

    console.log(`✅ Updated progress for ${userId}: ${updateData.progress?.percentage || 0}% complete`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ User progress update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid progress data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user progress',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * Update user stats when content is completed
 */
async function updateUserStatsOnCompletion(
  userId: string, 
  contentType: string, 
  score?: number
): Promise<void> {
  try {
    const currentStats = await CourseContentService.getUserStats(userId);
    
    const updates: Partial<{
      lastActiveDate: Date;
      totalLessonsCompleted: number;
      totalQuestionnairesCompleted: number;
      totalQuizzesCompleted: number;
      totalAchievementsUnlocked: number;
      totalTimeSpent: number;
      totalPoints: number;
      currentStreak: number;
      longestStreak: number;
      lastStreakDate: Date;
    }> = {
      lastActiveDate: new Date(),
    };

    // Increment completion counters
    if (contentType === 'lesson') {
      updates.totalLessonsCompleted = (currentStats?.totalLessonsCompleted || 0) + 1;
    } else if (contentType === 'questionnaire') {
      updates.totalQuizzesCompleted = (currentStats?.totalQuizzesCompleted || 0) + 1;
    }

    // Award points based on content type and performance
    let pointsEarned = 0;
    if (contentType === 'lesson') {
      pointsEarned = 10;
    } else if (contentType === 'questionnaire') {
      pointsEarned = score ? Math.round(score * 20) : 15; // Up to 20 points for perfect score
    }

    if (pointsEarned > 0) {
      updates.totalPoints = (currentStats?.totalPoints || 0) + pointsEarned;
    }

    // Update streak (simplified - assumes daily activity)
    const today = new Date().toDateString();
    const lastActive = currentStats?.lastActiveDate?.toDateString();
    
    if (lastActive === today) {
      // Same day, don't change streak
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive === yesterday.toDateString()) {
        // Consecutive day, increment streak
        updates.currentStreak = (currentStats?.currentStreak || 0) + 1;
        updates.longestStreak = Math.max(
          updates.currentStreak, 
          currentStats?.longestStreak || 0
        );
      } else {
        // Streak broken, reset to 1
        updates.currentStreak = 1;
      }
    }

    await CourseContentService.updateUserStats(userId, updates);
    console.log(`📈 Updated stats for ${userId}: +${pointsEarned} points, streak: ${updates.currentStreak || currentStats?.currentStreak || 0}`);

  } catch (error) {
    console.error(`❌ Failed to update user stats for ${userId}:`, error);
    // Don't throw - stats update shouldn't break progress tracking
  }
}

/**
 * Check for newly unlocked achievements based on progress
 */
async function checkForNewAchievements(
  userId: string, 
  _progress: UserProgress
): Promise<Achievement[]> {
  try {
    // Get user's current stats and portfolio performance (integrate with existing leaderboard data)
    const [userStats, allAchievements] = await Promise.all([
      CourseContentService.getUserStats(userId),
      CourseContentService.getAllContent({ type: 'achievement' }),
    ]);

    const newAchievements: Achievement[] = [];
    const currentBadges = userStats?.badges || [];

    for (const achievement of allAchievements as Achievement[]) {
      // Skip if user already has this achievement
      if (currentBadges.includes(achievement.id)) {
        continue;
      }

      let achieved = false;

      // Check achievement criteria
      switch (achievement.criteria.type) {
        case 'lesson-completion':
          achieved = (userStats?.totalLessonsCompleted || 0) >= achievement.criteria.threshold;
          break;
        
        case 'streak':
          achieved = (userStats?.currentStreak || 0) >= achievement.criteria.threshold;
          break;
        
        case 'portfolio-value':
        case 'return-percentage':
        case 'rank':
          // TODO: Integrate with leaderboard data to check portfolio-based achievements
          // This would require fetching user's portfolio performance from the existing system
          break;
      }

      if (achieved) {
        newAchievements.push(achievement);
        
        // Update user stats with new badge and points
        await CourseContentService.updateUserStats(userId, {
          badges: [...currentBadges, achievement.id],
          totalAchievements: (userStats?.totalAchievements || 0) + 1,
          totalPoints: (userStats?.totalPoints || 0) + achievement.rewards.points,
        });

        console.log(`🏆 User ${userId} unlocked achievement: ${achievement.title}`);
      }
    }

    return newAchievements;

  } catch (error) {
    console.error(`❌ Failed to check achievements for ${userId}:`, error);
    return [];
  }
}