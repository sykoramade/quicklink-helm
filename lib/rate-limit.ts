/**
 * In-memory rate limiter
 * Tracks link creation attempts per user
 * Limit: 60 creations per hour per user
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const LIMIT = 60;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check if user is rate limited
 * Returns { limited: boolean, remaining: number }
 */
export function checkRateLimit(userId: string): { limited: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    // Create new window
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return { limited: false, remaining: LIMIT - 1 };
  }

  if (entry.count >= LIMIT) {
    return { limited: true, remaining: 0 };
  }

  entry.count++;
  return { limited: false, remaining: LIMIT - entry.count };
}

/**
 * Reset rate limit for user (for testing)
 */
export function resetRateLimit(userId: string): void {
  rateLimitMap.delete(userId);
}
