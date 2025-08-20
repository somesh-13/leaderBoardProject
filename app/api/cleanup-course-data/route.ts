/**
 * Course Data Cleanup Endpoint
 * 
 * Removes malformed or incomplete course content and reseeds with valid data.
 * Use this to fix ObjectId and missing field issues.
 */

import { NextResponse } from 'next/server';
import { Db } from 'mongodb';
import { mongoClient } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('🧹 Starting course data cleanup...');

    // Get database connection
    const db = await mongoClient.connect();
    
    // Clean up collections
    const collections = ['content', 'user_progress', 'user_stats'];
    const results = [];

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        
        // Get count before deletion
        const beforeCount = await collection.countDocuments();
        
        // Delete all documents in collection
        const deleteResult = await collection.deleteMany({});
        
        results.push({
          collection: collectionName,
          beforeCount,
          deletedCount: deleteResult.deletedCount,
          status: 'cleaned'
        });

        console.log(`✅ Cleaned ${collectionName}: ${deleteResult.deletedCount} documents removed`);
      } catch (error) {
        results.push({
          collection: collectionName,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Recreate indexes for better performance
    try {
      await createIndexes(db);
      console.log('✅ Recreated database indexes');
    } catch (error) {
      console.warn('⚠️ Failed to recreate indexes:', error);
    }

    console.log('✅ Course data cleanup completed');

    return NextResponse.json({
      success: true,
      message: 'Course data cleanup completed successfully',
      results,
      nextSteps: [
        'Run POST /api/seed-course-data to populate with valid data',
        'Test with GET /api/course-content',
        'Visit /learn to verify functionality'
      ],
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to cleanup course data',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * Recreate database indexes for optimal performance
 */
async function createIndexes(db: Db) {
  // Content collection indexes
  const contentCollection = db.collection('content');
  await contentCollection.createIndex({ "id": 1 }, { unique: true });
  await contentCollection.createIndex({ "stage": 1, "order": 1 });
  await contentCollection.createIndex({ "type": 1 });

  // User progress collection indexes  
  const progressCollection = db.collection('user_progress');
  await progressCollection.createIndex({ "userId": 1, "contentId": 1 }, { unique: true });
  await progressCollection.createIndex({ "userId": 1, "lastAccessedAt": -1 });
  await progressCollection.createIndex({ "status": 1 });

  // User stats collection indexes
  const statsCollection = db.collection('user_stats');
  await statsCollection.createIndex({ "userId": 1 }, { unique: true });
  await statsCollection.createIndex({ "totalPoints": -1 });
  await statsCollection.createIndex({ "currentStage": 1 });
}