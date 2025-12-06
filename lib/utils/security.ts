/**
 * Security utilities for input sanitization and validation
 */

/**
 * Escape special regex characters to prevent regex injection
 * @param str - String to escape
 * @returns Escaped string safe for use in regex
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sanitize username - remove any potentially dangerous characters
 * @param username - Username to sanitize
 * @returns Sanitized username
 */
export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    return '';
  }
  
  // Remove any characters that aren't alphanumeric, underscore, or hyphen
  // This matches the validation in zod.ts
  return username.trim().replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Validate ObjectId format to prevent NoSQL injection
 * @param id - ID to validate
 * @returns true if valid ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  // MongoDB ObjectId is 24 hex characters
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Sanitize error message to prevent information disclosure
 * @param error - Error object or message
 * @param isDevelopment - Whether in development mode
 * @returns Sanitized error message
 */
export function sanitizeErrorMessage(error: unknown, isDevelopment: boolean = false): string {
  if (isDevelopment) {
    // In development, show more details
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
  
  // In production, return generic error message
  if (error instanceof Error) {
    // Only expose certain safe error messages
    const safeMessages = ['Validation failed', 'Invalid input', 'Not found', 'Unauthorized'];
    if (safeMessages.some(msg => error.message.includes(msg))) {
      return error.message;
    }
  }
  
  return 'An error occurred. Please try again later.';
}

/**
 * Validate and sanitize ticker symbol
 * @param ticker - Ticker symbol to validate
 * @returns Sanitized ticker or null if invalid
 */
export function sanitizeTicker(ticker: string): string | null {
  if (!ticker || typeof ticker !== 'string') {
    return null;
  }
  
  // Ticker should be 1-5 uppercase letters/numbers
  const sanitized = ticker.trim().toUpperCase().replace(/[^A-Z0-9.]/g, '');
  
  if (sanitized.length === 0 || sanitized.length > 10) {
    return null;
  }
  
  return sanitized;
}

