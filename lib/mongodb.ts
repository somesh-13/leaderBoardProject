/**
 * MongoDB Connection Utility
 * 
 * Provides a singleton MongoDB client for course content and user progress
 * stored in MongoDB Atlas.
 */

import { MongoClient, Db, Collection } from 'mongodb';
import { 
  CourseContent, 
  UserProgress, 
  UserCourseStats,
  courseContentSchema,
  userProgressSchema,
  userCourseStatsSchema
} from './types/course';

// Validate MongoDB URI is available
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// MongoDB client singleton
class MongoDBClient {
  private static instance: MongoDBClient;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  static getInstance(): MongoDBClient {
    if (!MongoDBClient.instance) {
      MongoDBClient.instance = new MongoDBClient();
    }
    return MongoDBClient.instance;
  }

  async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    try {
      console.log('🔌 Connecting to MongoDB Atlas...');
      this.client = new MongoClient(uri, options);
      await this.client.connect();
      
      this.db = this.client.db('investing_course');
      console.log('✅ Connected to MongoDB Atlas');
      
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('🔌 Disconnected from MongoDB');
    }
  }

  async getCollection<T extends Record<string, unknown> = Record<string, unknown>>(name: string): Promise<Collection<T>> {
    const db = await this.connect();
    return db.collection<T>(name);
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const db = await this.connect();
      await db.admin().ping();
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const mongoClient = MongoDBClient.getInstance();

// Collection helpers with type safety
export class CourseContentService {
  private static contentCollection: Collection<CourseContent> | null = null;
  private static progressCollection: Collection<UserProgress> | null = null;
  private static statsCollection: Collection<UserCourseStats> | null = null;

  static async getContentCollection(): Promise<Collection<CourseContent>> {
    if (!this.contentCollection) {
      this.contentCollection = await mongoClient.getCollection<CourseContent>('content');
    }
    return this.contentCollection;
  }

  static async getProgressCollection(): Promise<Collection<UserProgress>> {
    if (!this.progressCollection) {
      this.progressCollection = await mongoClient.getCollection<UserProgress>('user_progress');
    }
    return this.progressCollection;
  }

  static async getStatsCollection(): Promise<Collection<UserCourseStats>> {
    if (!this.statsCollection) {
      this.statsCollection = await mongoClient.getCollection<UserCourseStats>('user_stats');
    }
    return this.statsCollection;
  }

  // Course Content operations
  static async getAllContent(filters: {
    stage?: string;
    type?: string;
  } = {}): Promise<CourseContent[]> {
    try {
      const collection = await this.getContentCollection();
      const query: Record<string, string> = {};
      
      if (filters.stage) query.stage = filters.stage;
      if (filters.type) query.type = filters.type;

      const results = await collection
        .find(query)
        .sort({ stage: 1, order: 1 })
        .toArray();

      // Transform and validate results
      const normalized = results.map(doc => ({
        ...doc,
        _id: doc._id?.toString(), // Convert ObjectId to string
        description: doc.description || "No description provided",
        order: typeof doc.order === "number" ? doc.order : 1,
        isRequired: Boolean(doc.isRequired),
        estimatedMinutes: doc.estimatedMinutes || undefined,
        createdAt: doc.createdAt || new Date(),
        updatedAt: doc.updatedAt || new Date(),
      }));

      // Validate results with Zod and handle validation errors gracefully
      const validResults: CourseContent[] = [];
      for (const item of normalized) {
        try {
          const validated = courseContentSchema.parse(item);
          validResults.push(validated);
        } catch (validationError) {
          console.warn(`⚠️ Skipping invalid content item ${item.id}:`, validationError);
          // Continue processing other items instead of failing entirely
        }
      }

      return validResults;
    } catch (error) {
      console.error('❌ Error fetching course content:', error);
      throw error;
    }
  }

  static async getContentById(id: string): Promise<CourseContent | null> {
    try {
      const collection = await this.getContentCollection();
      const result = await collection.findOne({ id });
      
      if (!result) return null;

      // Transform and normalize the document
      const normalized = {
        ...result,
        _id: result._id?.toString(), // Convert ObjectId to string
        description: result.description || "No description provided",
        order: typeof result.order === "number" ? result.order : 1,
        isRequired: Boolean(result.isRequired),
        estimatedMinutes: result.estimatedMinutes || undefined,
        createdAt: result.createdAt || new Date(),
        updatedAt: result.updatedAt || new Date(),
      };

      return courseContentSchema.parse(normalized);
    } catch (error) {
      console.error(`❌ Error fetching content ${id}:`, error);
      throw error;
    }
  }

  static async createContent(content: Omit<CourseContent, '_id'>): Promise<CourseContent> {
    try {
      const collection = await this.getContentCollection();
      const validated = courseContentSchema.parse(content);
      
      const result = await collection.insertOne(validated);
      return { ...validated, _id: result.insertedId?.toString() || '' };
    } catch (error) {
      console.error('❌ Error creating course content:', error);
      throw error;
    }
  }

  // User Progress operations
  static async getUserProgress(userId: string, contentId?: string): Promise<UserProgress[]> {
    try {
      const collection = await this.getProgressCollection();
      const query: Record<string, string> = { userId };
      
      if (contentId) query.contentId = contentId;

      const results = await collection
        .find(query)
        .sort({ lastAccessedAt: -1 })
        .toArray();

      // Transform and validate results
      const normalized = results.map(doc => ({
        ...doc,
        _id: doc._id?.toString(), // Convert ObjectId to string
        lastAccessedAt: doc.lastAccessedAt || new Date(),
        startedAt: doc.startedAt || undefined,
        completedAt: doc.completedAt || undefined,
        progress: {
          ...doc.progress,
          percentage: doc.progress?.percentage ?? 0,
          timeSpent: doc.progress?.timeSpent ?? 0,
          attempts: doc.progress?.attempts ?? 0,
        },
      }));

      return normalized.map(item => userProgressSchema.parse(item));
    } catch (error) {
      console.error(`❌ Error fetching progress for user ${userId}:`, error);
      throw error;
    }
  }

  static async updateUserProgress(
    userId: string, 
    contentId: string, 
    updates: Partial<UserProgress>
  ): Promise<UserProgress> {
    try {
      const collection = await this.getProgressCollection();
      
      // Separate defaults from updates to avoid conflicts
      const setOnInsertDefaults = {
        contentType: updates.contentType || 'lesson' as const,
        status: 'not-started' as const,
        progress: {
          percentage: 0,
          timeSpent: 0,
          attempts: 0,
        },
      };

      // Remove conflicting fields from defaults
      const filteredDefaults = { ...setOnInsertDefaults };
      Object.keys(updates).forEach(key => {
        if (key in filteredDefaults) {
          delete filteredDefaults[key as keyof typeof filteredDefaults];
        }
      });

      const updateDoc = {
        ...updates,
        userId,
        contentId,
        lastAccessedAt: new Date(),
      };

      const result = await collection.findOneAndUpdate(
        { userId, contentId },
        { 
          $set: updateDoc,
          $setOnInsert: filteredDefaults
        },
        { 
          upsert: true, 
          returnDocument: 'after' 
        }
      );

      if (!result) {
        throw new Error('Failed to update user progress');
      }

      // Transform and normalize the result
      const normalized = {
        ...result,
        _id: result._id?.toString(),
        lastAccessedAt: result.lastAccessedAt || new Date(),
        startedAt: result.startedAt || undefined,
        completedAt: result.completedAt || undefined,
        progress: {
          ...result.progress,
          percentage: result.progress?.percentage ?? 0,
          timeSpent: result.progress?.timeSpent ?? 0,
          attempts: result.progress?.attempts ?? 0,
        },
      };

      return userProgressSchema.parse(normalized);
    } catch (error) {
      console.error(`❌ Error updating progress for user ${userId}:`, error);
      throw error;
    }
  }

  // User Stats operations
  static async getUserStats(userId: string): Promise<UserCourseStats | null> {
    try {
      const collection = await this.getStatsCollection();
      const result = await collection.findOne({ userId });
      
      if (!result) return null;

      // Transform and normalize the document
      const normalized = {
        ...result,
        _id: result._id?.toString(), // Convert ObjectId to string
        currentStage: result.currentStage || 'onboarding',
        totalLessonsCompleted: result.totalLessonsCompleted || 0,
        totalQuizzesCompleted: result.totalQuizzesCompleted || 0,
        totalAchievements: result.totalAchievements || 0,
        totalPoints: result.totalPoints || 0,
        currentStreak: result.currentStreak || 0,
        longestStreak: result.longestStreak || 0,
        lastActiveDate: result.lastActiveDate || new Date(),
        enrolledAt: result.enrolledAt || new Date(),
        badges: result.badges || [],
        preferences: {
          ...result.preferences,
          dailyGoalMinutes: result.preferences?.dailyGoalMinutes ?? 15,
          reminderEnabled: result.preferences?.reminderEnabled ?? true,
          preferredLearningTime: result.preferences?.preferredLearningTime ?? 'evening' as const,
        },
      };

      return userCourseStatsSchema.parse(normalized);
    } catch (error) {
      console.error(`❌ Error fetching stats for user ${userId}:`, error);
      throw error;
    }
  }

  static async updateUserStats(
    userId: string, 
    updates: Partial<UserCourseStats>
  ): Promise<UserCourseStats> {
    try {
      const collection = await this.getStatsCollection();
      
      // Separate updates from default values to avoid conflicts
      const setOnInsertDefaults = {
        currentStage: 'onboarding',
        totalLessonsCompleted: 0,
        totalQuizzesCompleted: 0,
        totalAchievements: 0,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        enrolledAt: new Date(),
        badges: [],
        preferences: {
          dailyGoalMinutes: 15,
          reminderEnabled: true,
          preferredLearningTime: 'evening' as const,
        },
      };

      // Remove any conflicting fields from setOnInsert that are in updates
      const filteredDefaults = { ...setOnInsertDefaults };
      Object.keys(updates).forEach(key => {
        if (key in filteredDefaults) {
          delete filteredDefaults[key as keyof typeof filteredDefaults];
        }
      });

      const updateDoc = {
        ...updates,
        userId,
        lastActiveDate: new Date(),
      };

      const result = await collection.findOneAndUpdate(
        { userId },
        { 
          $set: updateDoc,
          $setOnInsert: filteredDefaults
        },
        { 
          upsert: true, 
          returnDocument: 'after' 
        }
      );

      if (!result) {
        throw new Error('Failed to update user stats');
      }

      // Transform and normalize the result
      const normalized = {
        ...result,
        _id: result._id?.toString(),
        currentStage: result.currentStage || 'onboarding',
        totalLessonsCompleted: result.totalLessonsCompleted || 0,
        totalQuizzesCompleted: result.totalQuizzesCompleted || 0,
        totalAchievements: result.totalAchievements || 0,
        totalPoints: result.totalPoints || 0,
        currentStreak: result.currentStreak || 0,
        longestStreak: result.longestStreak || 0,
        lastActiveDate: result.lastActiveDate || new Date(),
        enrolledAt: result.enrolledAt || new Date(),
        badges: result.badges || [],
        preferences: {
          ...result.preferences,
          dailyGoalMinutes: result.preferences?.dailyGoalMinutes ?? 15,
          reminderEnabled: result.preferences?.reminderEnabled ?? true,
          preferredLearningTime: result.preferences?.preferredLearningTime ?? 'evening' as const,
        },
      };

      return userCourseStatsSchema.parse(normalized);
    } catch (error) {
      console.error(`❌ Error updating stats for user ${userId}:`, error);
      throw error;
    }
  }

  // Analytics and reporting
  static async getCourseAnalytics(): Promise<{
    totalUsers: number;
    contentByStage: Record<string, number>;
    averageCompletion: number;
    popularContent: Array<{ id: string; title: string; completions: number }>;
  }> {
    try {
      const [statsCollection, progressCollection, contentCollection] = await Promise.all([
        this.getStatsCollection(),
        this.getProgressCollection(),
        this.getContentCollection(),
      ]);

      const [totalUsers, contentByStage, completedProgress] = await Promise.all([
        statsCollection.countDocuments(),
        contentCollection.aggregate([
          { $group: { _id: '$stage', count: { $sum: 1 } } },
        ]).toArray(),
        progressCollection.find({ status: 'completed' }).toArray(),
      ]);

      const stageGroups = contentByStage.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>);

      // Calculate popular content
      const contentCompletions = completedProgress.reduce((acc, progress) => {
        acc[progress.contentId] = (acc[progress.contentId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const popularContentIds = Object.entries(contentCompletions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

      const popularContent = await Promise.all(
        popularContentIds.map(async ([contentId, completions]) => {
          const content = await this.getContentById(contentId);
          return {
            id: contentId,
            title: content?.title || 'Unknown',
            completions,
          };
        })
      );

      return {
        totalUsers,
        contentByStage: stageGroups,
        averageCompletion: completedProgress.length / Math.max(totalUsers, 1),
        popularContent,
      };
    } catch (error) {
      console.error('❌ Error fetching course analytics:', error);
      throw error;
    }
  }
}

// Connection cleanup for serverless environments
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await mongoClient.disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await mongoClient.disconnect();
    process.exit(0);
  });
}

export default mongoClient;