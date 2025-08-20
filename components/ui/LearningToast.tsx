/**
 * Learning Promotion Toast Component
 * 
 * Custom toast notification that promotes the /learn section
 * Shown only on the leaderboard page after 5 seconds
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';

interface LearningToastProps {
  visible: boolean;
  onDismiss: () => void;
}

export function LearningToast({ visible, onDismiss }: LearningToastProps) {
  return (
    <div
      className={`${
        visible ? 'animate-slide-up' : 'animate-slide-down'
      } max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-lg font-bold">📚</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Ready to Level Up? 🚀
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Want to build a portfolio like these top traders? Join our interactive learning platform to master investment strategies!
            </p>
            <div className="mt-3 flex space-x-2">
              <Link
                href="/learn"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                onClick={onDismiss}
              >
                Start Learning
              </Link>
              <button
                onClick={onDismiss}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200 dark:border-gray-600">
        <button
          onClick={onDismiss}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Alternative toast with user avatar
export function PersonalizedLearningToast({ 
  visible, 
  onDismiss,
  userName = "Emilia Gates",
  userAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixqx=6GHAjsWpt9&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80"
}: LearningToastProps & { userName?: string; userAvatar?: string }) {
  return (
    <div
      className={`${
        visible ? 'animate-slide-up' : 'animate-slide-down'
      } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gray-200`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <Image
              className="h-10 w-10 rounded-full object-cover"
              src={userAvatar}
              alt={userName}
              width={40}
              height={40}
            />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {userName}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              &quot;Want to learn how to build a portfolio like this? Join our DuoLingo for Finance app to master investing!&quot;
            </p>
            <div className="mt-3 flex space-x-2">
              <Link
                href="/learn"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                onClick={onDismiss}
              >
                🎓 Start Learning
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={onDismiss}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default LearningToast;