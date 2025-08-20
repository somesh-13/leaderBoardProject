/**
 * Seed Course Data Endpoint
 * 
 * Creates sample course content for testing the learning system
 */

import { NextResponse } from 'next/server';
import { CourseContentService } from '@/lib/mongodb';
import { CourseContent, Lesson, Questionnaire, Achievement, Milestone } from '@/lib/types/course';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('🌱 Seeding course data...');

    // Create typed content arrays
    const lessons: Omit<Lesson, '_id'>[] = [
      {
        id: 'lesson-portfolio-basics',
        type: 'lesson',
        stage: 'onboarding',
        title: 'Portfolio Basics',
        description: 'Learn the fundamentals of investment portfolios and diversification.',
        order: 1,
        isRequired: true,
        estimatedMinutes: 15,
        content: {
          introduction: 'Welcome to your first lesson on investment portfolio fundamentals. In this lesson, you\'ll learn what a portfolio is and why diversification matters.',
          sections: [
            {
              title: 'What is a Portfolio?',
              content: 'A portfolio is a collection of financial investments like stocks, bonds, and other securities. Think of it as your investment basket that holds different assets to help you achieve your financial goals.',
              type: 'text',
            },
            {
              title: 'The Power of Diversification', 
              content: 'Diversification means spreading your investments across different assets, sectors, and geographic regions. This helps reduce risk because when one investment performs poorly, others might perform well.',
              type: 'text',
            },
            {
              title: 'Building Your First Portfolio',
              content: 'Start with a simple portfolio of 3-5 stocks from different sectors. As you learn and grow, you can add more complexity with bonds, ETFs, and international stocks.',
              type: 'text',
            },
          ],
          keyTakeaways: [
            'A portfolio is a collection of investments',
            'Diversification reduces risk by spreading investments',
            'Start simple with 3-5 stocks from different sectors',
            'You can add complexity as you gain experience',
          ],
          nextSteps: 'Try building a simple portfolio using the leaderboard tools!',
        },
        prerequisites: [],
        tags: ['basics', 'portfolio', 'diversification'],
      },
      {
        id: 'lesson-risk-management',
        type: 'lesson',
        stage: 'beginner',
        title: 'Risk Management Fundamentals',
        description: 'Learn how to manage risk in your investment portfolio.',
        order: 1,
        isRequired: false,
        estimatedMinutes: 20,
        content: {
          introduction: 'Risk management is crucial for long-term investment success. This lesson covers the basics of identifying, measuring, and managing investment risk.',
          sections: [
            {
              title: 'Understanding Investment Risk',
              content: 'Investment risk is the possibility of losing money or not achieving expected returns. Different investments carry different levels of risk, from safe government bonds to volatile growth stocks.',
              type: 'text',
            },
            {
              title: 'Risk vs. Return',
              content: 'Generally, higher potential returns come with higher risk. The key is finding the right balance for your goals, timeline, and risk tolerance.',
              type: 'text',
            },
          ],
          keyTakeaways: [
            'All investments carry some level of risk',
            'Higher returns usually mean higher risk',
            'Diversification is your best risk management tool',
          ],
        },
        prerequisites: ['lesson-portfolio-basics'],
        tags: ['risk', 'management', 'strategy'],
      },
    ];

    const questionnaires: Omit<Questionnaire, '_id'>[] = [
      {
        id: 'quiz-portfolio-knowledge',
        type: 'questionnaire',
        stage: 'onboarding',
        title: 'Portfolio Knowledge Check',
        description: 'Test your understanding of portfolio basics.',
        order: 2,
        isRequired: true,
        estimatedMinutes: 5,
        questions: [
          {
            id: 'q1',
            question: 'What is the main benefit of portfolio diversification?',
            type: 'multiple-choice',
            options: [
              'Higher returns guaranteed',
              'Reduced risk through spreading investments',
              'Lower fees',
              'Faster trading'
            ],
            correctAnswer: 'Reduced risk through spreading investments',
            explanation: 'Diversification helps reduce risk by not putting all your eggs in one basket.',
            weight: 1,
          },
          {
            id: 'q2',
            question: 'How many stocks should a beginner start with?',
            type: 'multiple-choice',
            options: [
              '1-2 stocks',
              '3-5 stocks',
              '10-15 stocks',
              '20+ stocks'
            ],
            correctAnswer: '3-5 stocks',
            explanation: 'Starting with 3-5 stocks provides basic diversification without being overwhelming.',
            weight: 1,
          },
        ],
        passingScore: 0.8,
        maxAttempts: 3,
      },
    ];

    const achievements: Omit<Achievement, '_id'>[] = [
      {
        id: 'achievement-first-steps',
        type: 'achievement',
        stage: 'onboarding',
        title: 'First Steps',
        description: 'Complete your first lesson in the learning system.',
        order: 1,
        isRequired: false,
        criteria: {
          type: 'lesson-completion',
          threshold: 1,
          description: 'Complete your first lesson',
        },
        rewards: {
          badge: 'first-steps-badge',
          points: 50,
          title: 'Eager Learner',
        },
        rarity: 'common',
      },
    ];

    const milestones: Omit<Milestone, '_id'>[] = [
      {
        id: 'milestone-onboarding-complete',
        type: 'milestone',
        stage: 'onboarding', 
        title: 'Onboarding Graduate',
        description: 'Complete all onboarding lessons and quizzes.',
        order: 99,
        isRequired: false,
        requirements: [
          {
            type: 'complete-lessons',
            value: 'lesson-portfolio-basics',
            description: 'Complete Portfolio Basics lesson',
          },
          {
            type: 'pass-quiz',
            value: 'quiz-portfolio-knowledge',
            description: 'Pass Portfolio Knowledge quiz',
          },
        ],
        unlocks: ['lesson-risk-management'],
        celebration: {
          message: 'Congratulations! You\'ve completed the onboarding program!',
          animation: 'confetti',
          shareText: 'I just completed the investment onboarding program! 🎓',
        },
      },
    ];

    // Combine all content
    const sampleContent: Omit<CourseContent, '_id'>[] = [
      ...lessons,
      ...questionnaires,
      ...achievements,
      ...milestones,
    ];

    // Insert sample content
    const results = [];
    for (const content of sampleContent) {
      try {
        const created = await CourseContentService.createContent(content);
        results.push({ id: created.id, title: created.title, status: 'created' });
      } catch (error) {
        // Content might already exist
        results.push({ 
          id: content.id, 
          title: content.title, 
          status: 'skipped',
          reason: 'already exists or error'
        });
      }
    }

    console.log(`✅ Seeding completed: ${results.length} items processed`);

    return NextResponse.json({
      success: true,
      message: 'Course data seeded successfully',
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}