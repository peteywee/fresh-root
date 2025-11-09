//[P1][API][SECURITY] Rate limiting middleware (in-memory)
// Tags: rate-limiting, security, dos-protection

import { NextRequest, NextResponse } from "next/server";

/**
 * Configuration for the rate limiter.
 * @property {number} max - The maximum number of requests allowed within the window.
 * @property {number} windowSeconds - The time window in seconds.
 * @property {(request: NextRequest) => string} [keyGenerator] - A function to generate a unique key for each request.
 */
export interface RateLimitConfig {
  max: number;
  windowSeconds: number;
  keyGenerator?: (request: NextRequest) => string;
}

/**
 * An in-memory rate limiter implementation.
 */
class InMemoryRateLimiter {
  private requests = new Map<string, { count: number; resetAt: number }>();

  /**
   * Checks if a request is allowed under the rate limit.
   *
   * @param {string} key - The unique key for the request.
   * @param {number} max - The maximum number of requests.
   * @param {number} windowSeconds - The time window in seconds.
   * @returns {Promise<{ allowed: boolean; remaining: number; resetAt: number }>} An object indicating if the request is allowed, the remaining requests, and when the limit resets.
   */
  async checkLimit(
    key: string,
    max: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const now = Date.now();
    const entry = this.requests.get(key);

    if (!entry || entry.resetAt < now) {
      const resetAt = now + windowSeconds * 1000;
      this.requests.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: max - 1, resetAt };
    }

    if (entry.count >= max) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    this.requests.set(key, entry);
    return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
  }

  /**
   * Cleans up expired entries from the rate limiter's memory.
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (entry.resetAt < now) {
        this.requests.delete(key);
      }
    }
  }
}

const limiter = new InMemoryRateLimiter();
setInterval(() => limiter.cleanup(), 60000);

/**
 * The default key generator for rate limiting, based on the request's IP address and path.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @returns {string} The generated key.
 */
function defaultKeyGenerator(request: NextRequest): string {
  const ip =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  return `${request.nextUrl.pathname}:${ip}`;
}

/**
 * A middleware function to apply rate limiting to a Next.js API route.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {RateLimitConfig} [config=RateLimits.default] - The rate limit configuration.
 * @returns {Promise<NextResponse | null>} A promise that resolves to a `NextResponse` with a 429 status if the rate limit is exceeded, or `null` otherwise.
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = RateLimits.default,
): Promise<NextResponse | null> {
  const keyFn = config.keyGenerator ?? defaultKeyGenerator;
  const key = keyFn(request);

  const result = await limiter.checkLimit(key, config.max, config.windowSeconds);

  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000) },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": config.max.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.resetAt.toString(),
          "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
        },
      },
    );
  }

  return null;
}

/**
 * A collection of predefined rate limit configurations.
 * @property {object} default - The default rate limit.
 * @property {object} strict - A stricter rate limit.
 * @property {object} auth - A rate limit for authentication routes.
 * @property {object} api - A general rate limit for API routes.
 */
export const RateLimits = {
  default: { max: 60, windowSeconds: 60 },
  strict: { max: 10, windowSeconds: 60 },
  auth: { max: 5, windowSeconds: 300 },
  api: { max: 100, windowSeconds: 60 },
};
