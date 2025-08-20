/**
 * Course Content API Endpoint
 * 
 * GET /api/course-content?stage=onboarding&type=lesson&userId=123&includeProgress=true
 * 
 * Fetches educational content from MongoDB Atlas with optional user progress data.
 * Integrates learning system with existing portfolio leaderboard.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CourseContentService } from '@/lib/mongodb';
import { 
  courseContentQuerySchema,
  type CourseContentResponse,
  type CourseContent,
  type UserProgress
} from '@/lib/types/course';

export const dynamic = 'force-dynamic';

// Cache for course content (long TTL since content changes rarely)
const contentCache = new Map<string, { data: CourseContent[]; timestamp: number }>();
const CONTENT_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const query = courseContentQuerySchema.parse({
      stage: searchParams.get('stage') || undefined,
      type: searchParams.get('type') || undefined,
      userId: searchParams.get('userId') || undefined,
      includeProgress: searchParams.get('includeProgress') === 'true',
    });

    console.log(`📚 Fetching course content:`, query);

    // Generate cache key (exclude userId from cache key since progress is user-specific)
    const cacheKey = `content:${query.stage || 'all'}:${query.type || 'all'}`;
    
    // Check cache for content (not progress)
    let courseContent: CourseContent[] = [];
    const cached = contentCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CONTENT_CACHE_TTL) {
      console.log(`📦 Using cached course content for key: ${cacheKey}`);
      courseContent = cached.data;
    } else {
      // Fetch fresh content from MongoDB
      console.log(`🔄 Fetching fresh course content from MongoDB`);
      courseContent = await CourseContentService.getAllContent({
        ...(query.stage && { stage: query.stage }),
        ...(query.type && { type: query.type }),
      });

      // Cache the results
      contentCache.set(cacheKey, {
        data: courseContent,
        timestamp: Date.now(),
      });

      console.log(`✅ Fetched ${courseContent.length} course items from MongoDB`);
    }

    // Fetch user progress if requested and userId provided
    let userProgress: Record<string, UserProgress> = {};
    if (query.includeProgress && query.userId) {
      try {
        console.log(`👤 Fetching progress for user: ${query.userId}`);
        const progressArray = await CourseContentService.getUserProgress(query.userId);
        
        // Convert to map for easier lookup
        userProgress = progressArray.reduce((acc, progress) => {
          acc[progress.contentId] = progress;
          return acc;
        }, {} as Record<string, UserProgress>);

        console.log(`✅ Loaded progress for ${progressArray.length} items`);
      } catch (error) {
        console.warn(`⚠️ Failed to fetch user progress:`, error);
        // Continue without progress data rather than failing the entire request
      }
    }

    // Prepare response
    const response: CourseContentResponse = {
      success: true,
      data: courseContent,
      total: courseContent.length,
      userProgress: Object.keys(userProgress).length > 0 ? userProgress : undefined,
      timestamp: new Date().toISOString(),
    };

    console.log(`✅ Returning ${courseContent.length} course items`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': query.includeProgress 
          ? 'private, max-age=60' // Short cache for user-specific data
          : 'public, max-age=1800, stale-while-revalidate=3600', // Long cache for content
      },
    });

  } catch (error) {
    console.error('❌ Course content API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors,
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch course content',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Create new course content (admin/content management)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log(`📝 Creating new course content:`, body.type, body.title);

    const newContent = await CourseContentService.createContent(body);

    // Clear relevant cache entries
    contentCache.clear();

    console.log(`✅ Created course content with ID: ${newContent.id}`);

    return NextResponse.json({
      success: true,
      data: newContent,
      timestamp: new Date().toISOString(),
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Course content creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid content data',
        details: error.errors,
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create course content',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Cache cleanup function
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    
    contentCache.forEach((cached, key) => {
      if (now - cached.timestamp > CONTENT_CACHE_TTL) {
        contentCache.delete(key);
        cleaned++;
      }
    });
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired course content cache entries`);
    }
  }, 10 * 60 * 1000); // Every 10 minutes
}