/**
 * User Course Stats API Endpoint
 * 
 * GET /api/user-stats?userId=123
 * 
 * Fetches comprehensive learning analytics and progress for a user,
 * including recommendations for next content to consume.
 */

import { NextRequest, NextResponse } from 'next/server';
import { CourseContentService } from '@/lib/mongodb';
import { 
  type UserStatsResponse,
  type UserCourseStats,
  type UserProgress,
  type CourseContent,
  COURSE_STAGES
} from '@/lib/types/course';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId parameter is required',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    console.log(`📊 Fetching comprehensive stats for user: ${userId}`);

    // Fetch user stats, recent progress, and generate recommendations in parallel
    const [userStats, recentProgress, recommendations] = await Promise.all([
      fetchOrCreateUserStats(userId),
      fetchRecentProgress(userId),
      generateRecommendations(userId),
    ]);

    const response: UserStatsResponse = {
      success: true,
      data: userStats,
      recentProgress,
      nextRecommendations: recommendations,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Loaded stats for ${userId}: ${userStats.totalLessonsCompleted} lessons, ${userStats.totalPoints} points`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=300', // 5 minute cache for user stats
      },
    });

  } catch (error) {
    console.error('❌ User stats API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user stats',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * Fetch user stats or create initial stats if user is new
 */
async function fetchOrCreateUserStats(userId: string): Promise<UserCourseStats> {
  let userStats = await CourseContentService.getUserStats(userId);
  
  if (!userStats) {
    console.log(`👤 Creating initial stats for new user: ${userId}`);
    
    // Create initial stats for new user
    userStats = await CourseContentService.updateUserStats(userId, {
      currentStage: COURSE_STAGES.ONBOARDING,
      enrolledAt: new Date(),
      lastActiveDate: new Date(),
    });
  }
  
  return userStats;
}

/**
 * Fetch recent progress activity for the user
 */
async function fetchRecentProgress(userId: string, limit: number = 10): Promise<UserProgress[]> {
  try {
    const allProgress = await CourseContentService.getUserProgress(userId);
    
    // Sort by last accessed and take most recent
    return allProgress
      .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
      .slice(0, limit);
      
  } catch (error) {
    console.warn(`⚠️ Failed to fetch recent progress for ${userId}:`, error);
    return [];
  }
}

/**
 * Generate personalized content recommendations for the user
 */
async function generateRecommendations(userId: string): Promise<CourseContent[]> {
  try {
    const [userStats, userProgress, allContent] = await Promise.all([
      CourseContentService.getUserStats(userId),
      CourseContentService.getUserProgress(userId),
      CourseContentService.getAllContent(),
    ]);

    if (!userStats) {
      // New user - recommend onboarding content
      return allContent
        .filter(content => content.stage === COURSE_STAGES.ONBOARDING)
        .sort((a, b) => a.order - b.order)
        .slice(0, 3);
    }

    // Create a map of completed content
    const completedContentIds = new Set(
      userProgress
        .filter(p => p.status === 'completed')
        .map(p => p.contentId)
    );

    // Create a map of in-progress content
    const inProgressContentIds = new Set(
      userProgress
        .filter(p => p.status === 'in-progress')
        .map(p => p.contentId)
    );

    // Filter available content based on user's current stage and progress
    const availableContent = allContent.filter(content => {
      // Skip completed content
      if (completedContentIds.has(content.id)) {
        return false;
      }

      // Prioritize content from current stage and previous stages
      const currentStageOrder = getStageOrder(userStats.currentStage);
      const contentStageOrder = getStageOrder(content.stage);
      
      // Allow current stage and up to one stage ahead
      if (contentStageOrder > currentStageOrder + 1) {
        return false;
      }

      // Check prerequisites for lessons
      if (content.type === 'lesson' && 'prerequisites' in content) {
        const hasPrerequisites = content.prerequisites?.every(prereqId => 
          completedContentIds.has(prereqId)
        ) ?? true;
        
        if (!hasPrerequisites) {
          return false;
        }
      }

      return true;
    });

    // Score and sort recommendations
    const scoredContent = availableContent.map(content => ({
      content,
      score: calculateRecommendationScore(content, userStats, inProgressContentIds),
    }));

    scoredContent.sort((a, b) => b.score - a.score);

    // Return top 5 recommendations
    return scoredContent
      .slice(0, 5)
      .map(item => item.content);

  } catch (error) {
    console.warn(`⚠️ Failed to generate recommendations for ${userId}:`, error);
    return [];
  }
}

/**
 * Calculate recommendation score for content personalization
 */
function calculateRecommendationScore(
  content: CourseContent,
  userStats: UserCourseStats,
  inProgressContentIds: Set<string>
): number {
  let score = 0;

  // Boost score for current stage content
  if (content.stage === userStats.currentStage) {
    score += 50;
  }

  // Boost score for in-progress content
  if (inProgressContentIds.has(content.id)) {
    score += 30;
  }

  // Boost score for required content
  if (content.isRequired) {
    score += 20;
  }

  // Prefer shorter content for users with low engagement
  if (content.estimatedMinutes && content.estimatedMinutes <= 10) {
    score += 10;
  }

  // Content type preferences based on user activity
  switch (content.type) {
    case 'lesson':
      // Boost lessons for users who complete them frequently
      if (userStats.totalLessonsCompleted > userStats.totalQuizzesCompleted) {
        score += 15;
      }
      break;
      
    case 'questionnaire':
      // Boost quizzes for users who like assessments
      if (userStats.totalQuizzesCompleted >= userStats.totalLessonsCompleted) {
        score += 15;
      }
      break;
      
    case 'achievement':
      // Boost achievements for users with high points
      if (userStats.totalPoints > 100) {
        score += 10;
      }
      break;
  }

  // Slight boost for content that fits estimated time preference
  const preferredDuration = userStats.preferences?.dailyGoalMinutes || 15;
  if (content.estimatedMinutes && content.estimatedMinutes <= preferredDuration) {
    score += 5;
  }

  return score;
}

/**
 * Get numeric order for stage comparison
 */
function getStageOrder(stage: string): number {
  switch (stage) {
    case COURSE_STAGES.ONBOARDING: return 0;
    case COURSE_STAGES.BEGINNER: return 1;
    case COURSE_STAGES.INTERMEDIATE: return 2;
    case COURSE_STAGES.ADVANCED: return 3;
    case COURSE_STAGES.EXPERT: return 4;
    default: return 0;
  }
}