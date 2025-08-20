/**
 * Learn Page - Course Dashboard
 * 
 * Main entry point for the learning system.
 * Tests MongoDB integration and displays course content.
 */

'use client';

import React from 'react';
import CourseDashboard from '@/components/course/CourseDashboard';
import AchievementModal from '@/components/course/AchievementModal';

export default function LearnPage() {
  // For testing, we'll use a sample user ID
  // In production, this would come from authentication
  const userId = 'test-user-123';

  return (
    <div className="learn-page min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <CourseDashboard userId={userId} />
        <AchievementModal />
      </div>
    </div>
  );
}