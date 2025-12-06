/**
 * Rate limiting utilities for API routes
 */

import { NextRequest } from "next/server";

// In-memory rate limit store
// In production, consider using Redis or a dedicated rate limiting service
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  requests: number; // Number of requests allowed
  windowMs: number; // Time window in milliseconds
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  requests: 100, // 100 requests
  windowMs: 15 * 60 * 1000, // per 15 minutes
};

/**
 * Get client identifier for rate limiting
 * @param request - Next.js request object
 * @returns Client identifier string
 */
function getClientId(request: NextRequest): string {
  // Try to get IP from various headers (for proxy/load balancer scenarios)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return ip;
}

/**
 * Check if request is rate limited
 * @param request - Next.js request object
 * @param options - Rate limit options
 * @returns true if rate limited, false otherwise
 */
export function isRateLimited(
  request: NextRequest,
  options: RateLimitOptions = DEFAULT_OPTIONS
): boolean {
  const clientId = getClientId(request);
  const now = Date.now();
  
  const entry = rateLimitStore.get(clientId);
  
  // Clean up expired entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return false;
  }
  
  if (entry.count >= options.requests) {
    return true;
  }
  
  // Increment count
  entry.count++;
  return false;
}

/**
 * Get rate limit info for a client
 * @param request - Next.js request object
 * @param options - Rate limit options
 * @returns Rate limit info object
 */
export function getRateLimitInfo(
  request: NextRequest,
  options: RateLimitOptions = DEFAULT_OPTIONS
): { remaining: number; resetTime: number } {
  const clientId = getClientId(request);
  const entry = rateLimitStore.get(clientId);
  
  if (!entry) {
    return {
      remaining: options.requests,
      resetTime: Date.now() + options.windowMs,
    };
  }
  
  return {
    remaining: Math.max(0, options.requests - entry.count),
    resetTime: entry.resetTime,
  };
}

