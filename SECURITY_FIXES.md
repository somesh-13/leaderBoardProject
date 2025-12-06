# Security Review and Fixes

This document outlines the security vulnerabilities found and fixed during the code review.

## Fixed Vulnerabilities

### 1. ✅ Regex Injection Vulnerability
**Severity:** High  
**Location:** `lib/utils/db.ts`, `lib/services/portfolioService.ts`

**Issue:** Username parameters were used directly in regex patterns without escaping special characters, allowing potential regex injection attacks.

**Fix:** 
- Created `lib/utils/security.ts` with `escapeRegex()` function
- Added `sanitizeUsername()` function to validate and sanitize usernames
- Updated all database queries to use sanitized and escaped usernames

**Files Changed:**
- `lib/utils/db.ts` - `getUserByUsername()`, `createUserInDb()`
- `lib/services/portfolioService.ts` - `getPortfolioByUsername()`

### 2. ✅ Missing Authentication/Authorization
**Severity:** Critical  
**Location:** `app/api/portfolio/route.ts` (POST endpoint)

**Issue:** The POST endpoint for creating/updating portfolios had no authentication checks, allowing anyone to create or modify portfolios.

**Fix:**
- Created `lib/utils/auth.ts` with authentication utilities
- Added `requireAuthMiddleware()` function
- Added `isAuthorized()` function for resource-level authorization
- Protected POST endpoint with authentication
- Added authorization check to ensure users can only update their own portfolios

**Files Changed:**
- `app/api/portfolio/route.ts` - Added auth checks to POST endpoint

### 3. ✅ NoSQL Injection Vulnerability
**Severity:** High  
**Location:** `lib/utils/db.ts`

**Issue:** ObjectId parameters were not validated before use in MongoDB queries.

**Fix:**
- Added `isValidObjectId()` function in `lib/utils/security.ts`
- Added validation to all functions that accept ObjectId parameters
- Functions updated: `getUserById()`, `updateUserLastLogin()`, `updateUserEmailVerification()`

**Files Changed:**
- `lib/utils/db.ts` - Added ObjectId validation

### 4. ✅ Missing Rate Limiting
**Severity:** Medium  
**Location:** Multiple API endpoints

**Issue:** Most API endpoints lacked rate limiting, making them vulnerable to DoS attacks and abuse.

**Fix:**
- Created `lib/utils/rateLimit.ts` with rate limiting utilities
- Added rate limiting to:
  - `/api/portfolio` (GET: 100/15min, POST: 20/15min)
  - `/api/leaderboard/[username]` (100/15min)
  - `/api/portfolio/[username]/snapshot` (100/15min)
  - `/api/prices` (200/15min)
  - `/api/auth/signup` (5/15min - stricter for signup)

**Files Changed:**
- `app/api/portfolio/route.ts`
- `app/api/leaderboard/[username]/route.ts`
- `app/api/portfolio/[username]/snapshot/route.ts`
- `app/api/prices/route.ts`
- `app/api/auth/signup/route.ts`

### 5. ✅ Missing NextAuth Secret
**Severity:** Critical  
**Location:** `auth.ts`

**Issue:** NextAuth secret was not explicitly configured, which could lead to security issues in production.

**Fix:**
- Added explicit `secret` configuration in `authOptions`
- Added check to ensure `NEXTAUTH_SECRET` is set in production
- Set session maxAge to 30 days

**Files Changed:**
- `auth.ts`

### 6. ✅ Missing Security Headers
**Severity:** Medium  
**Location:** `next.config.js`

**Issue:** No security headers were configured, leaving the application vulnerable to various attacks.

**Fix:**
- Added comprehensive security headers:
  - `Strict-Transport-Security` (HSTS)
  - `X-Frame-Options` (prevent clickjacking)
  - `X-Content-Type-Options` (prevent MIME sniffing)
  - `X-XSS-Protection`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `X-DNS-Prefetch-Control`

**Files Changed:**
- `next.config.js`

### 7. ✅ Information Disclosure in Error Messages
**Severity:** Medium  
**Location:** Multiple API endpoints

**Issue:** Error messages exposed internal details that could aid attackers.

**Fix:**
- Created `sanitizeErrorMessage()` function in `lib/utils/security.ts`
- Updated all API endpoints to use sanitized error messages
- Error messages are generic in production, detailed in development

**Files Changed:**
- `app/api/portfolio/route.ts`
- `app/api/leaderboard/[username]/route.ts`
- `app/api/portfolio/[username]/snapshot/route.ts`
- `app/api/prices/route.ts`
- `app/api/auth/signup/route.ts`

### 8. ✅ Input Validation and Sanitization
**Severity:** Medium  
**Location:** Multiple API endpoints

**Issue:** Username and other input parameters were not properly sanitized before use.

**Fix:**
- Added input sanitization to all username parameters
- Added validation for numeric inputs (shares, avgPrice, totalInvested)
- Added length limits and format validation

**Files Changed:**
- `app/api/portfolio/route.ts` - Added validation for positions and numeric fields
- `app/api/leaderboard/[username]/route.ts` - Added username sanitization
- `app/api/portfolio/[username]/snapshot/route.ts` - Added username sanitization

## New Security Utilities

### `lib/utils/security.ts`
Contains security utility functions:
- `escapeRegex()` - Escapes special regex characters
- `sanitizeUsername()` - Sanitizes and validates usernames
- `isValidObjectId()` - Validates MongoDB ObjectId format
- `sanitizeErrorMessage()` - Sanitizes error messages for production
- `sanitizeTicker()` - Validates and sanitizes ticker symbols

### `lib/utils/auth.ts`
Contains authentication utilities:
- `getSession()` - Gets current session
- `requireAuth()` - Requires authentication
- `requireAuthMiddleware()` - Middleware for protected routes
- `isAuthorized()` - Checks resource-level authorization

### `lib/utils/rateLimit.ts`
Contains rate limiting utilities:
- `isRateLimited()` - Checks if request is rate limited
- `getRateLimitInfo()` - Gets rate limit information
- Uses in-memory store (consider Redis for production)

## Recommendations for Production

1. **Use Redis for Rate Limiting:** The current implementation uses in-memory storage. For production with multiple instances, use Redis or a dedicated rate limiting service.

2. **Environment Variables:** Ensure all sensitive environment variables are properly configured:
   - `NEXTAUTH_SECRET` - Required for NextAuth
   - `MONGODB_URI` - MongoDB connection string
   - `NEXT_PUBLIC_POLYGON_API_KEY` - Consider if this should be server-side only

3. **API Key Security:** The `NEXT_PUBLIC_POLYGON_API_KEY` is exposed to the client. Consider:
   - Moving API calls to server-side only
   - Using a proxy endpoint that doesn't expose the key
   - Implementing API key rotation

4. **Monitoring:** Add monitoring and alerting for:
   - Rate limit violations
   - Authentication failures
   - Unusual API usage patterns

5. **CORS Configuration:** If the API is accessed from external domains, configure CORS properly in `next.config.js`.

6. **Content Security Policy:** Consider adding a Content Security Policy header (note: Chart.js requires `unsafe-eval`).

7. **Database Security:**
   - Ensure MongoDB is not exposed to the internet
   - Use MongoDB Atlas IP whitelist
   - Enable MongoDB authentication
   - Use connection string encryption

8. **Session Security:**
   - Consider shorter session expiration times
   - Implement session refresh tokens
   - Add CSRF protection (NextAuth handles this, but verify)

## Testing Recommendations

1. Test rate limiting with multiple concurrent requests
2. Test authentication on all protected endpoints
3. Test authorization - ensure users can't access/modify other users' data
4. Test input validation with malicious inputs
5. Test error handling to ensure no information leakage
6. Perform security scanning with tools like OWASP ZAP or Snyk

## Summary

All critical and high-severity vulnerabilities have been addressed. The application now has:
- ✅ Proper input sanitization and validation
- ✅ Authentication and authorization on protected endpoints
- ✅ Rate limiting on all API endpoints
- ✅ Security headers configured
- ✅ Secure error handling
- ✅ NextAuth properly configured

The codebase is now significantly more secure and follows security best practices.

