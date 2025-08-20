/**
 * Course Dashboard Component
 * 
 * Main learning hub that displays user progress, recommendations,
 * and course content alongside the portfolio leaderboard.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useCourseStore, useCourseActions } from '@/lib/store/courseStore';
import { COURSE_STAGES } from '@/lib/types/course';

interface CourseDashboardProps {
  userId: string;
  className?: string;
}

export function CourseDashboard({ userId, className = '' }: CourseDashboardProps) {
  const {
    content,
    userProgress,
    userStats,
    recommendations,
    contentLoading,
    selectedStage,
    setSelectedStage,
    getContentByStage,
    getCompletionPercentage,
    getUserLevel,
  } = useCourseStore();

  const { fetchCourseContent, setCurrentUserId, fetchUserStats } = useCourseActions();
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'progress'>('overview');

  useEffect(() => {
    setCurrentUserId(userId);
    fetchCourseContent({ userId, includeProgress: true });
    fetchUserStats(userId);
  }, [userId, setCurrentUserId, fetchCourseContent, fetchUserStats]);

  const completionPercentage = getCompletionPercentage();
  const userLevel = getUserLevel();
  const stageContent = getContentByStage(selectedStage);

  if (contentLoading && content.length === 0) {
    return (
      <div className={`course-dashboard ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`course-dashboard ${className}`}>
      {/* Header */}
      <div className="course-header mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Learning Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Level: {userLevel} • {completionPercentage}% Complete
            </p>
          </div>
          <div className="course-stats">
            {userStats && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {userStats?.totalPoints || 0}
                  </div>
                  <div className="text-sm text-blue-500 dark:text-blue-400">Points</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {userStats?.currentStreak || 0}
                  </div>
                  <div className="text-sm text-green-500 dark:text-green-400">Day Streak</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {userStats?.totalAchievements || 0}
                  </div>
                  <div className="text-sm text-purple-500 dark:text-purple-400">Achievements</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Progress
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="course-tabs mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'content', label: 'Content' },
            { id: 'progress', label: 'Progress' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'content' | 'progress')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <OverviewTab 
            recommendations={recommendations}
            userStats={userStats}
          />
        )}
        
        {activeTab === 'content' && (
          <ContentTab 
            selectedStage={selectedStage}
            setSelectedStage={setSelectedStage}
            stageContent={stageContent}
            userProgress={userProgress}
          />
        )}
        
        {activeTab === 'progress' && (
          <ProgressTab 
            userProgress={userProgress}
            content={content}
          />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ recommendations, userStats }: {
  recommendations: Record<string, unknown>[];
  userStats: Record<string, unknown> | null;
}) {
  return (
    <div className="overview-tab">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recommendations */}
        <div className="recommendations-card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recommended for You</h3>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((item) => (
              <div key={String(item.id)} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{String(item.title)}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{String(item.description)}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        item.type === 'lesson' ? 'bg-blue-100 text-blue-800' :
                        item.type === 'questionnaire' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {String(item.type)}
                      </span>
                      {Boolean(item.estimatedMinutes) && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {String(item.estimatedMinutes)} min
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600">
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h3>
          <div className="space-y-3">
            {/* This would show recent progress updates */}
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
              No recent activity
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {userStats && (
        <div className="quick-stats mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {String(userStats?.totalLessonsCompleted || 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Lessons Completed</div>
          </div>
          <div className="stat-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {String(userStats?.totalQuizzesCompleted || 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Quizzes Completed</div>
          </div>
          <div className="stat-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {String(userStats?.longestStreak || 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Best Streak</div>
          </div>
          <div className="stat-card bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {String((userStats?.badges && Array.isArray(userStats.badges) ? userStats.badges.length : 0) || 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Badges Earned</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Content Tab Component
function ContentTab({ selectedStage, setSelectedStage, stageContent, userProgress }: {
  selectedStage: string;
  setSelectedStage: (stage: string) => void;
  stageContent: Record<string, unknown>[];
  userProgress: Record<string, Record<string, unknown>>;
}) {
  return (
    <div className="content-tab">
      {/* Stage Selection */}
      <div className="stage-selector mb-6">
        <div className="flex flex-wrap gap-2">
          {Object.values(COURSE_STAGES).map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedStage === stage
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stageContent.map((item) => {
            const progress = userProgress[String(item.id)];
            const isCompleted = progress?.status === 'completed';
            const isInProgress = progress?.status === 'in-progress';
            const progressPercent = (progress?.progress && typeof progress.progress === 'object' && 'percentage' in progress.progress) ? progress.progress.percentage : 0;

            return (
              <div key={String(item.id)} className="content-card border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-900/20">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{String(item.title)}</h4>
                  <div className="flex items-center space-x-1">
                    {isCompleted && (
                      <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                    {isInProgress && (
                      <span className="w-5 h-5 bg-yellow-500 rounded-full"></span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {String(item.description)}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 text-xs rounded ${
                    item.type === 'lesson' ? 'bg-blue-100 text-blue-800' :
                    item.type === 'questionnaire' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {String(item.type)}
                  </span>
                  {Boolean(item.estimatedMinutes) && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {String(item.estimatedMinutes)} min
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                {Number(progressPercent) > 0 && (
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <button 
                  className={`w-full py-2 rounded text-sm font-medium ${
                    isCompleted 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' 
                      : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600'
                  }`}
                  disabled={isCompleted}
                >
                  {isCompleted ? 'Completed' : isInProgress ? 'Continue' : 'Start'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Progress Tab Component
function ProgressTab({ userProgress, content }: {
  userProgress: Record<string, Record<string, unknown>>;
  content: Record<string, unknown>[];
}) {
  const completedContent = content.filter(item => 
    userProgress[String(item.id)]?.status === 'completed'
  );

  return (
    <div className="progress-tab">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Progress Chart Placeholder */}
        <div className="progress-chart bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Learning Progress</h3>
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Progress chart would go here
          </div>
        </div>

        {/* Completed Content */}
        <div className="completed-content bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recently Completed</h3>
          <div className="space-y-3">
            {completedContent.slice(0, 5).map((item) => (
              <div key={String(item.id)} className="flex items-center space-x-3">
                <span className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{String(item.title)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{String(item.type)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDashboard;