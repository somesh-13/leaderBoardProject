/**
 * Achievement Modal Component
 * 
 * Displays achievement notifications when users unlock new badges
 * and milestones in the learning system.
 */

'use client';

import React, { useEffect } from 'react';
import { useCourseStore } from '@/lib/store/courseStore';
import { Achievement, Milestone } from '@/lib/types/course';

export function AchievementModal() {
  const {
    recentAchievements,
    recentMilestones,
    showAchievementModal,
    setShowAchievementModal,
  } = useCourseStore();

  const hasNewAchievements = recentAchievements.length > 0;
  const hasNewMilestones = recentMilestones.length > 0;
  const showModal = showAchievementModal && (hasNewAchievements || hasNewMilestones);

  useEffect(() => {
    if (showModal) {
      // Auto-close modal after 5 seconds
      const timer = setTimeout(() => {
        setShowAchievementModal(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
    return; // Explicitly return undefined for the else case
  }, [showModal, setShowAchievementModal]);

  if (!showModal) return null;

  return (
    <div className="achievement-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="achievement-modal bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        
        {/* Header */}
        <div className="modal-header bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 text-center">
          <div className="celebration-icon mb-2">
            🎉
          </div>
          <h2 className="text-2xl font-bold">
            Congratulations!
          </h2>
          <p className="text-purple-100">
            You&apos;ve unlocked new achievements!
          </p>
        </div>

        {/* Content */}
        <div className="modal-content p-6">
          
          {/* New Achievements */}
          {hasNewAchievements && (
            <div className="achievements-section mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🏆 New Achievements
              </h3>
              <div className="space-y-3">
                {recentAchievements.slice(0, 3).map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </div>
          )}

          {/* New Milestones */}
          {hasNewMilestones && (
            <div className="milestones-section mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🎯 New Milestones
              </h3>
              <div className="space-y-3">
                {recentMilestones.slice(0, 3).map((milestone) => (
                  <MilestoneCard key={milestone.id} milestone={milestone} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAchievementModal(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              View Later
            </button>
            <button
              onClick={() => setShowAchievementModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Awesome!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Achievement Card Component
function AchievementCard({ achievement }: { achievement: Achievement }) {
  const rarityColors = {
    common: 'bg-gray-100 text-gray-800',
    rare: 'bg-blue-100 text-blue-800',
    epic: 'bg-purple-100 text-purple-800',
    legendary: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="achievement-card flex items-center space-x-3 p-3 bg-white border rounded-lg">
      <div className="achievement-badge w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
        🏆
      </div>
      
      <div className="achievement-info flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
          <span className={`px-2 py-1 text-xs rounded ${rarityColors[achievement.rarity]}`}>
            {achievement.rarity}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-1">
          {achievement.description}
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-blue-600 font-medium">
            +{achievement.rewards.points} points
          </span>
          {achievement.rewards.title && (
            <span className="text-xs text-purple-600 font-medium">
              &quot;{achievement.rewards.title}&quot; title
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Milestone Card Component
function MilestoneCard({ milestone }: { milestone: Milestone }) {
  return (
    <div className="milestone-card flex items-center space-x-3 p-3 bg-white border rounded-lg">
      <div className="milestone-icon w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
        🎯
      </div>
      
      <div className="milestone-info flex-1">
        <h4 className="font-semibold text-gray-900 mb-1">{milestone.title}</h4>
        <p className="text-sm text-gray-600 mb-2">
          {milestone.description}
        </p>
        
        {/* Requirements */}
        <div className="requirements mb-2">
          <div className="text-xs text-gray-500 mb-1">Completed:</div>
          <div className="space-y-1">
            {milestone.requirements.slice(0, 2).map((req, index) => (
              <div key={index} className="flex items-center space-x-1">
                <span className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="text-xs text-gray-600">{req.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Unlocks */}
        {milestone.unlocks.length > 0 && (
          <div className="text-xs text-blue-600 font-medium">
            Unlocked {milestone.unlocks.length} new content item{milestone.unlocks.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

export default AchievementModal;