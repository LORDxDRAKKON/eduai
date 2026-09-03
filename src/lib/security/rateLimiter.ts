/**
 * In-memory rate limiter for Next.js API routes.
 * Uses a sliding window counter per IP address.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (entry.resetAt < now) store.delete(key);
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSecs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSecs * 1000;

  let entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { allowed: true, remaining: config.limit - 1, resetAt: entry.resetAt };
  }

  entry.count += 1;
  const allowed = entry.count <= config.limit;
  const remaining = Math.max(0, config.limit - entry.count);

  return { allowed, remaining, resetAt: entry.resetAt };
}

/** Extract a safe IP identifier from request headers */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

// Pre-defined rate limit configs
export const RATE_LIMITS = {
  /** Login: 10 attempts per 15 minutes */
  login: { limit: 10, windowSecs: 15 * 60 },
  /** Signup: 5 accounts per hour */
  signup: { limit: 5, windowSecs: 60 * 60 },
  /** AI generation: 30 requests per minute */
  aiGeneration: { limit: 30, windowSecs: 60 },
  /** General API: 100 requests per minute */
  api: { limit: 100, windowSecs: 60 },
} satisfies Record<string, RateLimitConfig>;
