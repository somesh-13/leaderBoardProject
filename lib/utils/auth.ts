/**
 * Authentication utilities for API routes
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get the current session from the request
 * Note: In Next.js App Router, getServerSession works with cookies automatically
 * @param request - Next.js request object (optional, for future use)
 * @returns Session object or null
 */
export async function getSession(request?: NextRequest) {
  try {
    // getServerSession automatically reads cookies from the request
    // In App Router API routes, it works without explicit request passing
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Require authentication for API routes
 * @param request - Next.js request object (optional)
 * @returns Session object or null (if not authenticated)
 */
export async function requireAuth(request?: NextRequest) {
  const session = await getSession(request);
  
  if (!session || !session.user) {
    return null;
  }
  
  return session;
}

/**
 * Require authentication middleware - returns error response if not authenticated
 * @param request - Next.js request object (optional)
 * @returns Session object or NextResponse with error
 */
export async function requireAuthMiddleware(request?: NextRequest): Promise<{ session: any } | NextResponse> {
  const session = await requireAuth(request);
  
  if (!session) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Unauthorized - Authentication required',
        timestamp: new Date().toISOString()
      },
      { status: 401 }
    );
  }
  
  return { session };
}

/**
 * Check if user is authorized to access a resource
 * @param session - Session object
 * @param resourceOwnerId - ID of the resource owner
 * @param isAdminAllowed - Whether admins can access any resource
 * @returns true if authorized
 */
export function isAuthorized(
  session: any,
  resourceOwnerId: string,
  isAdminAllowed: boolean = false
): boolean {
  if (!session || !session.user) {
    return false;
  }
  
  // Admin can access any resource if allowed
  if (isAdminAllowed && session.user.role === 'admin') {
    return true;
  }
  
  // User can access their own resources
  return session.user.id === resourceOwnerId || session.user.username === resourceOwnerId;
}

