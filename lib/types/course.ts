/**
 * Course Content Types for Learning Integration
 * 
 * Defines the data model for educational content stored in MongoDB Atlas
 * that integrates with the portfolio leaderboard system.
 */

import { z } from 'zod';

// Base course content schema
export const baseCourseContentSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId converted to string
  id: z.string(),
  type: z.enum(['questionnaire', 'lesson', 'achievement', 'milestone']),
  stage: z.string(), // e.g., 'onboarding', 'beginner', 'intermediate', 'advanced'
  title: z.string(),
  description: z.string(),
  order: z.number(), // Display order within stage
  isRequired: z.boolean().default(false),
  estimatedMinutes: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Questionnaire-specific schema
export const questionnaireSchema = baseCourseContentSchema.extend({
  type: z.literal('questionnaire'),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    type: z.enum(['multiple-choice', 'true-false', 'slider', 'text']),
    options: z.array(z.string()).optional(), // For multiple choice
    correctAnswer: z.string().optional(), // For scoring
    explanation: z.string().optional(),
    weight: z.number().default(1), // For scoring
  })),
  passingScore: z.number().default(0.7), // 70% to pass
  maxAttempts: z.number().default(3),
});

// Lesson-specific schema
export const lessonSchema = baseCourseContentSchema.extend({
  type: z.literal('lesson'),
  content: z.object({
    introduction: z.string(),
    sections: z.array(z.object({
      title: z.string(),
      content: z.string(),
      type: z.enum(['text', 'video', 'interactive']),
      mediaUrl: z.string().optional(),
      duration: z.number().optional(), // seconds
    })),
    keyTakeaways: z.array(z.string()),
    nextSteps: z.string().optional(),
  }),
  prerequisites: z.array(z.string()).default([]), // IDs of required content
  tags: z.array(z.string()).default([]),
});

// Achievement-specific schema
export const achievementSchema = baseCourseContentSchema.extend({
  type: z.literal('achievement'),
  criteria: z.object({
    type: z.enum(['portfolio-value', 'return-percentage', 'lesson-completion', 'streak', 'rank']),
    threshold: z.number(),
    description: z.string(),
  }),
  rewards: z.object({
    badge: z.string(), // Badge image URL or identifier
    points: z.number().default(0),
    title: z.string().optional(), // Special title earned
  }),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']).default('common'),
});

// Milestone-specific schema
export const milestoneSchema = baseCourseContentSchema.extend({
  type: z.literal('milestone'),
  requirements: z.array(z.object({
    type: z.enum(['complete-lessons', 'pass-quiz', 'achieve-return', 'maintain-streak']),
    value: z.union([z.string(), z.number()]),
    description: z.string(),
  })),
  unlocks: z.array(z.string()), // IDs of content unlocked by this milestone
  celebration: z.object({
    message: z.string(),
    animation: z.string().optional(),
    shareText: z.string().optional(),
  }),
});

// Union type for all course content
export const courseContentSchema = z.discriminatedUnion('type', [
  questionnaireSchema,
  lessonSchema,
  achievementSchema,
  milestoneSchema,
]);

// User progress tracking
export const userProgressSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  contentId: z.string(),
  contentType: z.enum(['questionnaire', 'lesson', 'achievement', 'milestone']),
  status: z.enum(['not-started', 'in-progress', 'completed', 'locked']),
  progress: z.object({
    percentage: z.number().min(0).max(100).default(0),
    timeSpent: z.number().default(0), // seconds
    attempts: z.number().default(0),
    lastAttemptScore: z.number().optional(),
    bestScore: z.number().optional(),
  }),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  lastAccessedAt: z.date(),
  metadata: z.record(z.unknown()).optional(), // Flexible storage for additional data
});

// User's overall course progress
export const userCourseStatsSchema = z.object({
  _id: z.string().optional(),
  userId: z.string(),
  currentStage: z.string().default('onboarding'),
  totalLessonsCompleted: z.number().default(0),
  totalQuizzesCompleted: z.number().default(0),
  totalAchievements: z.number().default(0),
  totalPoints: z.number().default(0),
  currentStreak: z.number().default(0),
  longestStreak: z.number().default(0),
  lastActiveDate: z.date(),
  enrolledAt: z.date(),
  badges: z.array(z.string()).default([]),
  preferences: z.object({
    dailyGoalMinutes: z.number().default(15),
    reminderEnabled: z.boolean().default(true),
    preferredLearningTime: z.enum(['morning', 'afternoon', 'evening']).default('evening'),
  }),
});

// API Request/Response types
export const courseContentQuerySchema = z.object({
  stage: z.string().optional(),
  type: z.enum(['questionnaire', 'lesson', 'achievement', 'milestone']).optional(),
  userId: z.string().optional(), // For progress-aware responses
  includeProgress: z.boolean().optional().default(false),
});

export const userProgressUpdateSchema = z.object({
  contentId: z.string(),
  progress: z.object({
    percentage: z.number().min(0).max(100).optional(),
    timeSpent: z.number().optional(),
    score: z.number().optional(),
  }).optional(),
  status: z.enum(['in-progress', 'completed']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Type exports
export type BaseCourseContent = z.infer<typeof baseCourseContentSchema>;
export type Questionnaire = z.infer<typeof questionnaireSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Achievement = z.infer<typeof achievementSchema>;
export type Milestone = z.infer<typeof milestoneSchema>;
export type CourseContent = z.infer<typeof courseContentSchema>;

export type UserProgress = z.infer<typeof userProgressSchema>;
export type UserCourseStats = z.infer<typeof userCourseStatsSchema>;

export type CourseContentQuery = z.infer<typeof courseContentQuerySchema>;
export type UserProgressUpdate = z.infer<typeof userProgressUpdateSchema>;

// API Response types
export interface CourseContentResponse {
  success: boolean;
  data: CourseContent[];
  total: number;
  userProgress?: Record<string, UserProgress> | undefined;
  timestamp: string;
}

export interface UserProgressResponse {
  success: boolean;
  data: UserProgress;
  achievements?: Achievement[]; // Newly unlocked achievements
  milestones?: Milestone[]; // Newly completed milestones
  timestamp: string;
}

export interface UserStatsResponse {
  success: boolean;
  data: UserCourseStats;
  recentProgress: UserProgress[];
  nextRecommendations: CourseContent[];
  timestamp: string;
}

// Constants
export const COURSE_STAGES = {
  ONBOARDING: 'onboarding',
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const;

export const CONTENT_TYPES = {
  QUESTIONNAIRE: 'questionnaire',
  LESSON: 'lesson',
  ACHIEVEMENT: 'achievement',
  MILESTONE: 'milestone',
} as const;

export const PROGRESS_STATUS = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  LOCKED: 'locked',
} as const;

// Default course content structure
export const DEFAULT_COURSE_FLOW = [
  { stage: COURSE_STAGES.ONBOARDING, order: 1, types: ['questionnaire', 'lesson'] },
  { stage: COURSE_STAGES.BEGINNER, order: 2, types: ['lesson', 'questionnaire', 'achievement'] },
  { stage: COURSE_STAGES.INTERMEDIATE, order: 3, types: ['lesson', 'milestone'] },
  { stage: COURSE_STAGES.ADVANCED, order: 4, types: ['lesson', 'achievement'] },
  { stage: COURSE_STAGES.EXPERT, order: 5, types: ['milestone', 'achievement'] },
] as const;