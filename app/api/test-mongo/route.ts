/**
 * MongoDB Connection Test Endpoint
 * 
 * Simple test to verify MongoDB Atlas connection is working
 */

import { NextResponse } from 'next/server';
import { mongoClient, CourseContentService } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    
    // Test basic connection
    const isConnected = await mongoClient.ping();
    
    if (!isConnected) {
      throw new Error('Failed to ping MongoDB');
    }

    // Test collection access
    const contentCollection = await CourseContentService.getContentCollection();
    const documentCount = await contentCollection.countDocuments();

    // Test stats collection
    const statsCollection = await CourseContentService.getStatsCollection();
    const statsCount = await statsCollection.countDocuments();

    // Test progress collection
    const progressCollection = await CourseContentService.getProgressCollection();
    const progressCount = await progressCollection.countDocuments();

    console.log('✅ MongoDB connection test successful');

    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      database: 'investing_course',
      collections: {
        content: {
          name: 'content',
          documents: documentCount,
        },
        user_stats: {
          name: 'user_stats', 
          documents: statsCount,
        },
        user_progress: {
          name: 'user_progress',
          documents: progressCount,
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'MongoDB connection failed',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}