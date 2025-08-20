# MongoDB Data Management Guide for Learning System

This guide covers how to insert, manage, and structure data in MongoDB Atlas for the `/learn` learning system integrated with the portfolio leaderboard application.

## 📋 Table of Contents

1. [Database Structure](#database-structure)
2. [Collections Overview](#collections-overview)
3. [Data Insertion Methods](#data-insertion-methods)
4. [Content Types & Schemas](#content-types--schemas)
5. [API Endpoints for Data Management](#api-endpoints-for-data-management)
6. [Sample Data Examples](#sample-data-examples)
7. [Data Validation](#data-validation)
8. [Best Practices](#best-practices)

---

## 🗄️ Database Structure

**Database Name:** `investing_course`

**Collections:**
- `content` - Course lessons, quizzes, achievements, and milestones
- `user_progress` - Individual user progress tracking
- `user_stats` - Aggregated user statistics and achievements

**Connection:**
```javascript
// MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/investing_course
```

---

## 📊 Collections Overview

### 1. `content` Collection
Stores all learning content (lessons, quizzes, achievements, milestones).

**Indexes:**
```javascript
db.content.createIndex({ "id": 1 }, { unique: true })
db.content.createIndex({ "stage": 1, "order": 1 })
db.content.createIndex({ "type": 1 })
```

### 2. `user_progress` Collection
Tracks individual user progress through content.

**Indexes:**
```javascript
db.user_progress.createIndex({ "userId": 1, "contentId": 1 }, { unique: true })
db.user_progress.createIndex({ "userId": 1, "lastAccessedAt": -1 })
db.user_progress.createIndex({ "status": 1 })
```

### 3. `user_stats` Collection
Stores aggregated user statistics and achievements.

**Indexes:**
```javascript
db.user_stats.createIndex({ "userId": 1 }, { unique: true })
db.user_stats.createIndex({ "totalPoints": -1 })
db.user_stats.createIndex({ "currentStage": 1 })
```

---

## 🔧 Data Insertion Methods

### Method 1: API Endpoints (Recommended)

**Seed Sample Data:**
```bash
curl -X POST http://localhost:3000/api/seed-course-data
```

**Create Individual Content:**
```bash
curl -X POST http://localhost:3000/api/course-content \
  -H "Content-Type: application/json" \
  -d @lesson-data.json
```

### Method 2: MongoDB Compass GUI

1. Open MongoDB Compass
2. Connect to your Atlas cluster
3. Navigate to `investing_course` database
4. Select `content` collection
5. Click "ADD DATA" → "Insert Document"
6. Paste JSON content (see examples below)

### Method 3: MongoDB CLI

```bash
# Connect to MongoDB
mongosh "mongodb+srv://cluster.mongodb.net/investing_course" --apiVersion 1 --username <username>

# Insert single document
db.content.insertOne({...})

# Insert multiple documents
db.content.insertMany([{...}, {...}])
```

### Method 4: Programmatic (Node.js)

```javascript
import { CourseContentService } from '@/lib/mongodb';

const newLesson = {
  id: 'lesson-example',
  type: 'lesson',
  stage: 'beginner',
  title: 'Example Lesson',
  // ... rest of lesson data
};

await CourseContentService.createContent(newLesson);
```

---

## 📝 Content Types & Schemas

### 1. Lesson Content

```json
{
  "_id": "ObjectId (auto-generated)",
  "id": "lesson-portfolio-basics",
  "type": "lesson",
  "stage": "onboarding",
  "title": "Portfolio Basics",
  "description": "Learn the fundamentals of investment portfolios.",
  "order": 1,
  "isRequired": true,
  "estimatedMinutes": 15,
  "content": {
    "introduction": "Welcome to portfolio basics...",
    "sections": [
      {
        "title": "What is a Portfolio?",
        "content": "A portfolio is a collection of investments...",
        "type": "text",
        "mediaUrl": null,
        "duration": null
      },
      {
        "title": "Video Example",
        "content": "Watch this explanation...",
        "type": "video",
        "mediaUrl": "https://example.com/video.mp4",
        "duration": 300
      }
    ],
    "keyTakeaways": [
      "Portfolios reduce risk through diversification",
      "Start with 3-5 different stocks"
    ],
    "nextSteps": "Try building your first portfolio!"
  },
  "prerequisites": [],
  "tags": ["basics", "portfolio", "diversification"],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### 2. Questionnaire Content

```json
{
  "id": "quiz-portfolio-knowledge",
  "type": "questionnaire",
  "stage": "onboarding",
  "title": "Portfolio Knowledge Check",
  "description": "Test your understanding of portfolio basics.",
  "order": 2,
  "isRequired": true,
  "estimatedMinutes": 5,
  "questions": [
    {
      "id": "q1",
      "question": "What is the main benefit of portfolio diversification?",
      "type": "multiple-choice",
      "options": [
        "Higher returns guaranteed",
        "Reduced risk through spreading investments",
        "Lower fees",
        "Faster trading"
      ],
      "correctAnswer": "Reduced risk through spreading investments",
      "explanation": "Diversification helps reduce risk by not putting all eggs in one basket.",
      "weight": 1
    }
  ],
  "passingScore": 0.8,
  "maxAttempts": 3
}
```

### 3. Achievement Content

```json
{
  "id": "achievement-first-lesson",
  "type": "achievement",
  "stage": "onboarding",
  "title": "First Steps",
  "description": "Complete your first lesson.",
  "order": 1,
  "isRequired": false,
  "criteria": {
    "type": "lesson-completion",
    "threshold": 1,
    "description": "Complete your first lesson"
  },
  "rewards": {
    "badge": "first-steps-badge",
    "points": 50,
    "title": "Eager Learner"
  },
  "rarity": "common"
}
```

### 4. Milestone Content

```json
{
  "id": "milestone-onboarding-complete",
  "type": "milestone",
  "stage": "onboarding",
  "title": "Onboarding Graduate",
  "description": "Complete all onboarding requirements.",
  "order": 99,
  "isRequired": false,
  "requirements": [
    {
      "type": "complete-lessons",
      "value": "lesson-portfolio-basics",
      "description": "Complete Portfolio Basics lesson"
    },
    {
      "type": "pass-quiz",
      "value": "quiz-portfolio-knowledge", 
      "description": "Pass Portfolio Knowledge quiz"
    }
  ],
  "unlocks": ["lesson-risk-management"],
  "celebration": {
    "message": "Congratulations! You've completed onboarding!",
    "animation": "confetti",
    "shareText": "I just completed investment onboarding! 🎓"
  }
}
```

---

## 🛠️ API Endpoints for Data Management

### Content Management

**GET /api/course-content**
```bash
# Get all content
curl "http://localhost:3000/api/course-content"

# Filter by stage
curl "http://localhost:3000/api/course-content?stage=onboarding"

# Filter by type
curl "http://localhost:3000/api/course-content?type=lesson"

# Include user progress
curl "http://localhost:3000/api/course-content?userId=user123&includeProgress=true"
```

**POST /api/course-content**
```bash
# Create new content
curl -X POST http://localhost:3000/api/course-content \
  -H "Content-Type: application/json" \
  -d '{
    "id": "lesson-new",
    "type": "lesson",
    "stage": "beginner",
    "title": "New Lesson",
    "description": "A new lesson",
    "order": 1,
    "isRequired": false,
    "estimatedMinutes": 10,
    "content": {
      "introduction": "Introduction text",
      "sections": [],
      "keyTakeaways": []
    }
  }'
```

### User Progress Management

**GET /api/user-progress**
```bash
# Get user progress
curl "http://localhost:3000/api/user-progress?userId=user123"

# Get progress for specific content
curl "http://localhost:3000/api/user-progress?userId=user123&contentId=lesson-1"
```

**POST /api/user-progress**
```bash
# Update user progress
curl -X POST http://localhost:3000/api/user-progress \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "contentId": "lesson-portfolio-basics",
    "status": "in-progress",
    "progress": {
      "percentage": 50,
      "timeSpent": 300
    }
  }'
```

### User Statistics

**GET /api/user-stats**
```bash
# Get user stats and recommendations
curl "http://localhost:3000/api/user-stats?userId=user123"
```

---

## 📋 Sample Data Examples

### Complete Lesson Example

```json
{
  "id": "lesson-stock-analysis",
  "type": "lesson",
  "stage": "intermediate",
  "title": "Fundamental Stock Analysis",
  "description": "Learn how to analyze stocks using fundamental metrics.",
  "order": 1,
  "isRequired": false,
  "estimatedMinutes": 25,
  "content": {
    "introduction": "Fundamental analysis helps you understand a company's true value by examining financial statements, market position, and growth prospects.",
    "sections": [
      {
        "title": "Understanding Financial Ratios",
        "content": "Key ratios like P/E, P/B, and ROE tell us about company valuation and performance. The P/E ratio compares stock price to earnings per share, helping identify overvalued or undervalued stocks.",
        "type": "text"
      },
      {
        "title": "Reading Balance Sheets",
        "content": "The balance sheet shows assets, liabilities, and equity. Look for strong cash positions, manageable debt levels, and growing shareholder equity.",
        "type": "text"
      },
      {
        "title": "Interactive Ratio Calculator",
        "content": "Use our calculator to compute key ratios for any stock.",
        "type": "interactive",
        "duration": 600
      }
    ],
    "keyTakeaways": [
      "P/E ratio helps identify stock valuation",
      "Balance sheet strength indicates financial health",
      "Compare ratios to industry averages",
      "Look for consistent growth trends"
    ],
    "nextSteps": "Practice analyzing stocks in your portfolio using these techniques."
  },
  "prerequisites": ["lesson-portfolio-basics"],
  "tags": ["analysis", "fundamentals", "ratios", "stocks"]
}
```

### Interactive Quiz Example

```json
{
  "id": "quiz-risk-assessment",
  "type": "questionnaire",
  "stage": "beginner",
  "title": "Risk Tolerance Assessment",
  "description": "Discover your investment risk tolerance.",
  "order": 3,
  "isRequired": true,
  "estimatedMinutes": 8,
  "questions": [
    {
      "id": "q1",
      "question": "Your portfolio drops 20% in value. What do you do?",
      "type": "multiple-choice",
      "options": [
        "Sell everything to avoid further losses",
        "Hold steady and wait for recovery",
        "Buy more at the lower prices",
        "Panic and ask for help"
      ],
      "correctAnswer": "Hold steady and wait for recovery",
      "explanation": "Emotional decisions often lead to poor outcomes. Staying disciplined during downturns is key to long-term success.",
      "weight": 2
    },
    {
      "id": "q2",
      "question": "Rate your risk tolerance on a scale of 1-10:",
      "type": "slider",
      "options": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      "explanation": "Understanding your risk tolerance helps build an appropriate portfolio allocation.",
      "weight": 1
    },
    {
      "id": "q3",
      "question": "Diversification completely eliminates investment risk.",
      "type": "true-false",
      "options": ["True", "False"],
      "correctAnswer": "False",
      "explanation": "Diversification reduces but cannot eliminate all risk. Market risk affects all investments.",
      "weight": 1
    }
  ],
  "passingScore": 0.7,
  "maxAttempts": 2
}
```

### Portfolio-Based Achievement

```json
{
  "id": "achievement-portfolio-champion",
  "type": "achievement",
  "stage": "advanced",
  "title": "Portfolio Champion",
  "description": "Achieve a 15% return on your portfolio.",
  "order": 5,
  "isRequired": false,
  "criteria": {
    "type": "return-percentage",
    "threshold": 15,
    "description": "Achieve 15% portfolio return"
  },
  "rewards": {
    "badge": "portfolio-champion-badge",
    "points": 200,
    "title": "Investment Pro"
  },
  "rarity": "epic"
}
```

---

## ✅ Data Validation

### Validation Rules

1. **Required Fields:**
   - `id` (unique across all content)
   - `type` (lesson, questionnaire, achievement, milestone)
   - `stage` (onboarding, beginner, intermediate, advanced, expert)
   - `title` and `description`
   - `order` (for display sequence)

2. **Type-Specific Validation:**
   - **Lessons:** Must have `content.sections` array
   - **Questionnaires:** Must have `questions` array and `passingScore`
   - **Achievements:** Must have `criteria` and `rewards`
   - **Milestones:** Must have `requirements` and `unlocks` arrays

3. **Business Rules:**
   - Prerequisites must reference existing content IDs
   - Order numbers should be unique within each stage
   - Estimated minutes should be reasonable (1-120 minutes)

### Testing Validation

```bash
# Test with invalid data (should fail)
curl -X POST http://localhost:3000/api/course-content \
  -H "Content-Type: application/json" \
  -d '{"id": "", "type": "invalid"}' # Missing required fields

# Test with valid data (should succeed) 
curl -X POST http://localhost:3000/api/course-content \
  -H "Content-Type: application/json" \
  -d @valid-lesson.json
```

---

## 🎯 Best Practices

### 1. Content Organization

**Stage Progression:**
```
onboarding → beginner → intermediate → advanced → expert
```

**Order Numbers:**
- Use increments of 10 (10, 20, 30) to allow insertion
- Group related content with similar orders
- Reserve high numbers (90+) for milestones

### 2. Content IDs

**Naming Convention:**
```
lesson-{topic-name}        # lesson-portfolio-basics
quiz-{topic-name}          # quiz-risk-assessment  
achievement-{action}       # achievement-first-lesson
milestone-{stage}-complete # milestone-onboarding-complete
```

### 3. Prerequisites Chain

```json
// Example progression
"onboarding": [
  "lesson-portfolio-basics",     // No prerequisites
  "quiz-portfolio-knowledge"     // Requires lesson-portfolio-basics
],
"beginner": [
  "lesson-risk-management"       // Requires onboarding completion
]
```

### 4. Content Updates

**Version Control:**
- Always update `updatedAt` timestamp
- Consider versioning for major content changes
- Test content changes in staging environment first

**Deployment:**
```bash
# 1. Create/update content in staging
curl -X POST http://staging.app.com/api/course-content -d @new-content.json

# 2. Test functionality
curl "http://staging.app.com/api/course-content?stage=onboarding"

# 3. Deploy to production
curl -X POST http://app.com/api/course-content -d @new-content.json
```

### 5. Performance Optimization

**Content Caching:**
- Course content is cached for 30 minutes (rarely changes)
- User progress is cached for 5 minutes (frequently updated)
- Use `Cache-Control` headers appropriately

**Database Queries:**
- Always use indexes for filtering (stage, type, userId)
- Limit large result sets with pagination
- Use projection to fetch only needed fields

### 6. Integration with Portfolio System

**Achievement Triggers:**
- Portfolio value milestones
- Return percentage achievements  
- Trading streak rewards
- Leaderboard position badges

**Data Sync:**
```javascript
// Example: Check portfolio achievements
const userStats = await getUserPortfolioStats(userId);
if (userStats.totalReturn > 0.15) {
  await unlockAchievement(userId, 'achievement-portfolio-champion');
}
```

---

## 🚀 Quick Start Commands

```bash
# 1. Test MongoDB connection
curl http://localhost:3000/api/test-mongo

# 2. Seed initial data
curl -X POST http://localhost:3000/api/seed-course-data

# 3. View seeded content
curl "http://localhost:3000/api/course-content"

# 4. Test learning dashboard
# Visit: http://localhost:3000/learn

# 5. Create user progress
curl -X POST http://localhost:3000/api/user-progress \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "contentId": "lesson-portfolio-basics", 
    "status": "completed",
    "progress": {"percentage": 100, "timeSpent": 900}
  }'

# 6. View user stats
curl "http://localhost:3000/api/user-stats?userId=test-user-123"
```

---

## 📞 Support

For questions about MongoDB data management:

1. **API Issues:** Check `/api/test-mongo` endpoint first
2. **Data Validation:** Review Zod schemas in `lib/types/course.ts`
3. **Connection Issues:** Verify `MONGODB_URI` in `.env`
4. **Performance:** Check MongoDB Atlas metrics and indexes

**Logs Location:**
- Server logs: Check console output for MongoDB operations
- API responses: Include `timestamp` field for debugging
- Error tracking: Check error messages in API responses