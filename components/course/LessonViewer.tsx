/**
 * Lesson Viewer Component
 * 
 * Displays lesson content with progress tracking and navigation.
 * Integrates with the course progress system.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useCourseStore } from '@/lib/store/courseStore';
import { Lesson } from '@/lib/types/course';

interface LessonViewerProps {
  lessonId: string;
  userId: string;
  onComplete?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function LessonViewer({ 
  lessonId, 
  userId, 
  onComplete,
  onPrevious 
}: LessonViewerProps) {
  const {
    content,
    updateUserProgress,
    progressLoading,
  } = useCourseStore();

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  const lesson = content.find(item => item.id === lessonId && item.type === 'lesson') as Lesson;
  // const _progress = getProgressForContent(lessonId);

  useEffect(() => {
    // Track time spent
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    // Update progress when section changes
    if (lesson) {
      const percentage = Math.round(((currentSectionIndex + 1) / lesson.content.sections.length) * 100);
      
      updateUserProgress(userId, {
        contentId: lessonId,
        status: percentage === 100 ? 'completed' : 'in-progress',
        progress: {
          percentage,
          timeSpent,
        },
        metadata: {
          currentSection: currentSectionIndex,
          contentType: 'lesson',
        },
      });
    }
  }, [currentSectionIndex, lesson, userId, lessonId, timeSpent, updateUserProgress]);

  if (!lesson) {
    return (
      <div className="lesson-viewer-error p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Lesson Not Found
        </h2>
        <p className="text-gray-600">
          The requested lesson could not be found.
        </p>
      </div>
    );
  }

  const currentSection = lesson.content.sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === lesson.content.sections.length - 1;
  const isFirstSection = currentSectionIndex === 0;
  const progressPercentage = Math.round(((currentSectionIndex + 1) / lesson.content.sections.length) * 100);

  const handleNextSection = () => {
    if (!isLastSection) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      // Lesson completed
      handleComplete();
    }
  };

  const handlePreviousSection = () => {
    if (!isFirstSection) {
      setCurrentSectionIndex(prev => prev - 1);
    } else if (onPrevious) {
      onPrevious();
    }
  };

  const handleComplete = async () => {
    await updateUserProgress(userId, {
      contentId: lessonId,
      status: 'completed',
      progress: {
        percentage: 100,
        timeSpent,
      },
      metadata: {
        currentSection: currentSectionIndex,
        contentType: 'lesson',
        completedAt: new Date().toISOString(),
      },
    });

    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="lesson-viewer max-w-4xl mx-auto">
      {/* Header */}
      <div className="lesson-header mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            <p className="text-gray-600">{lesson.description}</p>
          </div>
          <div className="lesson-meta">
            <div className="text-sm text-gray-500">
              Section {currentSectionIndex + 1} of {lesson.content.sections.length}
            </div>
            <div className="text-sm text-gray-500">
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')} elapsed
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Section Navigation */}
        <div className="section-nav flex space-x-2 overflow-x-auto">
          {lesson.content.sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setCurrentSectionIndex(index)}
              className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
                index === currentSectionIndex
                  ? 'bg-blue-600 text-white'
                  : index < currentSectionIndex
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {index + 1}. {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="lesson-content">
        {/* Introduction (shown only on first section) */}
        {currentSectionIndex === 0 && (
          <div className="lesson-introduction mb-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Introduction
            </h2>
            <p className="text-blue-800">
              {lesson.content.introduction}
            </p>
          </div>
        )}

        {/* Current Section */}
        <div className="current-section">
          <div className="section-header mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentSection?.title}
            </h2>
          </div>

          <div className="section-body">
            {currentSection?.type === 'video' && currentSection?.mediaUrl ? (
              <div className="video-container mb-6">
                <video 
                  controls 
                  className="w-full rounded-lg"
                  src={currentSection?.mediaUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : currentSection?.type === 'interactive' ? (
              <div className="interactive-content mb-6 p-6 bg-gray-50 rounded-lg">
                <div className="text-center text-gray-600">
                  Interactive content placeholder
                </div>
              </div>
            ) : null}

            <div className="section-text prose max-w-none">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: currentSection?.content?.replace(/\n/g, '<br/>') ?? '' 
                }}
              />
            </div>
          </div>
        </div>

        {/* Key Takeaways (shown only on last section) */}
        {isLastSection && lesson.content.keyTakeaways.length > 0 && (
          <div className="key-takeaways mt-8 p-6 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              Key Takeaways
            </h3>
            <ul className="space-y-2">
              {lesson.content.keyTakeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-green-800">{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="lesson-navigation mt-8 flex items-center justify-between">
        <button
          onClick={handlePreviousSection}
          disabled={isFirstSection && !onPrevious}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {currentSectionIndex + 1} of {lesson.content.sections.length}
          </span>
        </div>

        <button
          onClick={handleNextSection}
          disabled={progressLoading}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>
            {isLastSection ? 'Complete Lesson' : 'Next Section'}
          </span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default LessonViewer;