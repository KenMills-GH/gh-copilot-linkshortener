/**
 * Simple in-memory rate limiter
 * For production, use a distributed solution like Redis
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

interface RateLimitConfig {
  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;

  /**
   * Maximum number of requests per window
   * @default 10
   */
  max?: number;
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier for the client (e.g., userId, IP address)
 * @param config - Rate limit configuration
 * @returns true if request is allowed, false if rate limited
 *
 * @example
 * ```ts
 * const allowed = checkRateLimit(userId, { max: 5, windowMs: 60000 });
 * if (!allowed) {
 *   return { error: "Too many requests. Please try again later." };
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): boolean {
  const { windowMs = 60000, max = 10 } = config;
  const now = Date.now();
  const userLimit = store.get(identifier);

  // Clean up old entries periodically (simple garbage collection)
  if (Math.random() < 0.01) {
    cleanupExpiredEntries(now);
  }

  // No previous requests or window has expired
  if (!userLimit || now > userLimit.resetTime) {
    store.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  // Rate limit exceeded
  if (userLimit.count >= max) {
    return false;
  }

  // Increment count and allow request
  userLimit.count++;
  return true;
}

/**
 * Clean up expired entries from the store
 */
function cleanupExpiredEntries(now: number): void {
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}

/**
 * Get remaining requests for an identifier
 */
export function getRemainingRequests(
  identifier: string,
  max: number = 10
): number {
  const userLimit = store.get(identifier);
  if (!userLimit || Date.now() > userLimit.resetTime) {
    return max;
  }
  return Math.max(0, max - userLimit.count);
}

/**
 * Reset rate limit for an identifier (useful for testing)
 */
export function resetRateLimit(identifier: string): void {
  store.delete(identifier);
}
