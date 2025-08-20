/**
 * Course Content State Management with Zustand
 * 
 * Manages learning content, user progress, and achievements alongside
 * the existing portfolio leaderboard system.
 */

import { create } from 'zustand';
import { subscribeWithSelector, persist } from 'zustand/middleware';
import { 
  CourseContent,
  UserProgress,
  UserCourseStats,
  Achievement,
  Milestone,
  CourseContentQuery,
  UserProgressUpdate,
  COURSE_STAGES,
  PROGRESS_STATUS
} from '@/lib/types/course';

interface CourseStore {
  // Content State
  content: CourseContent[];
  contentLoading: boolean;
  contentError: string | null;
  contentLastFetched: number;

  // User Progress State
  userProgress: Record<string, UserProgress>; // contentId -> progress
  progressLoading: boolean;
  progressError: string | null;

  // User Stats State
  userStats: UserCourseStats | null;
  statsLoading: boolean;
  statsError: string | null;

  // Recommendations State
  recommendations: CourseContent[];
  recommendationsLoading: boolean;

  // Achievement State
  recentAchievements: Achievement[];
  recentMilestones: Milestone[];

  // UI State
  currentUserId: string | null;
  selectedStage: string;
  selectedContentType: string | null;
  showProgressModal: boolean;
  showAchievementModal: boolean;

  // Content Actions
  fetchCourseContent: (query?: CourseContentQuery) => Promise<void>;
  setContent: (content: CourseContent[]) => void;
  setContentLoading: (loading: boolean) => void;
  setContentError: (error: string | null) => void;

  // Progress Actions
  fetchUserProgress: (userId: string) => Promise<void>;
  updateUserProgress: (userId: string, update: UserProgressUpdate) => Promise<void>;
  setUserProgress: (progress: Record<string, UserProgress>) => void;
  setProgressLoading: (loading: boolean) => void;
  setProgressError: (error: string | null) => void;

  // Stats Actions
  fetchUserStats: (userId: string) => Promise<void>;
  setUserStats: (stats: UserCourseStats) => void;
  setStatsLoading: (loading: boolean) => void;
  setStatsError: (error: string | null) => void;

  // UI Actions
  setCurrentUserId: (userId: string | null) => void;
  setSelectedStage: (stage: string) => void;
  setSelectedContentType: (type: string | null) => void;
  setShowProgressModal: (show: boolean) => void;
  setShowAchievementModal: (show: boolean) => void;

  // Computed Properties
  getContentByStage: (stage: string) => CourseContent[];
  getContentByType: (type: string) => CourseContent[];
  getProgressForContent: (contentId: string) => UserProgress | null;
  getCompletedContent: () => CourseContent[];
  getInProgressContent: () => CourseContent[];
  getNextRecommendation: () => CourseContent | null;
  getUserLevel: () => string;
  getCompletionPercentage: () => number;
}

// Default state
const defaultState = {
  content: [],
  contentLoading: false,
  contentError: null,
  contentLastFetched: 0,

  userProgress: {},
  progressLoading: false,
  progressError: null,

  userStats: null,
  statsLoading: false,
  statsError: null,

  recommendations: [],
  recommendationsLoading: false,

  recentAchievements: [],
  recentMilestones: [],

  currentUserId: null,
  selectedStage: COURSE_STAGES.ONBOARDING,
  selectedContentType: null,
  showProgressModal: false,
  showAchievementModal: false,
};

export const useCourseStore = create<CourseStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...defaultState,

        // Content Actions
        fetchCourseContent: async (query = {}) => {
          const { currentUserId } = get();
          set({ contentLoading: true, contentError: null });

          try {
            console.log(`📚 Fetching course content:`, query);

            const params = new URLSearchParams();
            if (query.stage) params.append('stage', query.stage);
            if (query.type) params.append('type', query.type);
            if (query.userId || currentUserId) {
              params.append('userId', query.userId || currentUserId!);
              params.append('includeProgress', 'true');
            }

            const response = await fetch(`/api/course-content?${params}`);
            const data = await response.json();

            if (!data.success) {
              throw new Error(data.error || 'Failed to fetch course content');
            }

            set({ 
              content: data.data,
              contentLastFetched: Date.now(),
              contentLoading: false,
              contentError: null
            });

            // Update user progress if included
            if (data.userProgress) {
              set({ userProgress: data.userProgress });
            }

            console.log(`✅ Loaded ${data.data.length} course items`);

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Failed to fetch course content:', errorMessage);
            set({ 
              contentLoading: false, 
              contentError: errorMessage 
            });
          }
        },

        setContent: (content) => set({ content }),
        setContentLoading: (contentLoading) => set({ contentLoading }),
        setContentError: (contentError) => set({ contentError }),

        // Progress Actions
        fetchUserProgress: async (userId) => {
          set({ progressLoading: true, progressError: null });

          try {
            console.log(`👤 Fetching progress for user: ${userId}`);

            const response = await fetch(`/api/user-progress?userId=${userId}`);
            const data = await response.json();

            if (!data.success) {
              throw new Error(data.error || 'Failed to fetch user progress');
            }

            // Convert array to map for easier lookup
            const progressMap = data.data.reduce((acc: Record<string, UserProgress>, progress: UserProgress) => {
              acc[progress.contentId] = progress;
              return acc;
            }, {});

            set({ 
              userProgress: progressMap,
              progressLoading: false,
              progressError: null
            });

            console.log(`✅ Loaded progress for ${data.data.length} items`);

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Failed to fetch user progress:', errorMessage);
            set({ 
              progressLoading: false, 
              progressError: errorMessage 
            });
          }
        },

        updateUserProgress: async (userId, update) => {
          set({ progressLoading: true, progressError: null });

          try {
            console.log(`📊 Updating progress for user ${userId}:`, update);

            const response = await fetch('/api/user-progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, ...update }),
            });

            const data = await response.json();

            if (!data.success) {
              throw new Error(data.error || 'Failed to update user progress');
            }

            // Update progress in store
            set((state) => ({
              userProgress: {
                ...state.userProgress,
                [update.contentId]: data.data,
              },
              progressLoading: false,
              progressError: null,
            }));

            // Handle new achievements
            if (data.achievements && data.achievements.length > 0) {
              set((state) => ({
                recentAchievements: [...data.achievements, ...state.recentAchievements.slice(0, 4)],
                showAchievementModal: true,
              }));
              
              console.log(`🏆 Unlocked ${data.achievements.length} new achievements!`);
            }

            // Handle new milestones
            if (data.milestones && data.milestones.length > 0) {
              set((state) => ({
                recentMilestones: [...data.milestones, ...state.recentMilestones.slice(0, 4)],
              }));
              
              console.log(`🎯 Completed ${data.milestones.length} new milestones!`);
            }

            console.log(`✅ Updated progress: ${data.data.progress?.percentage || 0}% complete`);

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Failed to update user progress:', errorMessage);
            set({ 
              progressLoading: false, 
              progressError: errorMessage 
            });
          }
        },

        setUserProgress: (userProgress) => set({ userProgress }),
        setProgressLoading: (progressLoading) => set({ progressLoading }),
        setProgressError: (progressError) => set({ progressError }),

        // Stats Actions
        fetchUserStats: async (userId) => {
          set({ statsLoading: true, statsError: null });

          try {
            console.log(`📊 Fetching stats for user: ${userId}`);

            const response = await fetch(`/api/user-stats?userId=${userId}`);
            const data = await response.json();

            if (!data.success) {
              throw new Error(data.error || 'Failed to fetch user stats');
            }

            set({ 
              userStats: data.data,
              recommendations: data.nextRecommendations || [],
              statsLoading: false,
              statsError: null
            });

            console.log(`✅ Loaded stats: ${data.data.totalLessonsCompleted} lessons, ${data.data.totalPoints} points`);

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Failed to fetch user stats:', errorMessage);
            set({ 
              statsLoading: false, 
              statsError: errorMessage 
            });
          }
        },

        setUserStats: (userStats) => set({ userStats }),
        setStatsLoading: (statsLoading) => set({ statsLoading }),
        setStatsError: (statsError) => set({ statsError }),

        // UI Actions
        setCurrentUserId: (currentUserId) => {
          set({ currentUserId });
          
          // Auto-fetch data when user changes
          if (currentUserId) {
            get().fetchUserProgress(currentUserId);
            get().fetchUserStats(currentUserId);
          }
        },

        setSelectedStage: (selectedStage) => set({ selectedStage }),
        setSelectedContentType: (selectedContentType) => set({ selectedContentType }),
        setShowProgressModal: (showProgressModal) => set({ showProgressModal }),
        setShowAchievementModal: (showAchievementModal) => set({ showAchievementModal }),

        // Computed Properties
        getContentByStage: (stage) => {
          const { content } = get();
          return content.filter(item => item.stage === stage)
            .sort((a, b) => a.order - b.order);
        },

        getContentByType: (type) => {
          const { content } = get();
          return content.filter(item => item.type === type)
            .sort((a, b) => a.order - b.order);
        },

        getProgressForContent: (contentId) => {
          const { userProgress } = get();
          return userProgress[contentId] || null;
        },

        getCompletedContent: () => {
          const { content, userProgress } = get();
          return content.filter(item => {
            const progress = userProgress[item.id];
            return progress?.status === PROGRESS_STATUS.COMPLETED;
          });
        },

        getInProgressContent: () => {
          const { content, userProgress } = get();
          return content.filter(item => {
            const progress = userProgress[item.id];
            return progress?.status === PROGRESS_STATUS.IN_PROGRESS;
          });
        },

        getNextRecommendation: () => {
          const { recommendations } = get();
          return recommendations[0] || null;
        },

        getUserLevel: () => {
          const { userStats } = get();
          if (!userStats) return 'Beginner';

          const totalPoints = userStats.totalPoints;
          if (totalPoints >= 1000) return 'Expert';
          if (totalPoints >= 500) return 'Advanced';
          if (totalPoints >= 200) return 'Intermediate';
          return 'Beginner';
        },

        getCompletionPercentage: () => {
          const { content, userProgress } = get();
          if (content.length === 0) return 0;

          const completedCount = content.filter(item => {
            const progress = userProgress[item.id];
            return progress?.status === PROGRESS_STATUS.COMPLETED;
          }).length;

          return Math.round((completedCount / content.length) * 100);
        },
      }),
      {
        name: 'course-store',
        partialize: (state) => ({
          // Only persist certain parts of the state
          userProgress: state.userProgress,
          userStats: state.userStats,
          currentUserId: state.currentUserId,
          selectedStage: state.selectedStage,
          contentLastFetched: state.contentLastFetched,
          recentAchievements: state.recentAchievements.slice(0, 5), // Keep recent achievements
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            console.log('📚 Course store rehydrated');
            
            // Auto-refresh content if it's stale (older than 1 hour)
            const now = Date.now();
            const oneHour = 60 * 60 * 1000;
            
            if (now - state.contentLastFetched > oneHour) {
              console.log('🔄 Content is stale, fetching fresh data');
              state.fetchCourseContent({ 
                stage: state.selectedStage,
                userId: state.currentUserId || undefined 
              });
            }
          }
        },
      }
    )
  )
);

// Selectors for optimized re-renders
export const useCourseContent = () => useCourseStore(state => state.content);
export const useUserProgress = () => useCourseStore(state => state.userProgress);
export const useUserStats = () => useCourseStore(state => state.userStats);
export const useRecommendations = () => useCourseStore(state => state.recommendations);
export const useCourseLoading = () => useCourseStore(state => 
  state.contentLoading || state.progressLoading || state.statsLoading
);

// Helper hooks
export const useCourseActions = () => {
  const store = useCourseStore();
  return {
    fetchCourseContent: store.fetchCourseContent,
    updateUserProgress: store.updateUserProgress,
    fetchUserStats: store.fetchUserStats,
    setCurrentUserId: store.setCurrentUserId,
  };
};

export const useCourseProgress = (contentId: string) => {
  return useCourseStore(state => state.getProgressForContent(contentId));
};