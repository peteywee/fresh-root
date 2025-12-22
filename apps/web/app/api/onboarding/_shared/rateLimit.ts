// [P0][SECURITY][RATE_LIMIT] RateLimit
// Tags: P0, SECURITY, RATE_LIMIT
/**
 * [P1][API][SHARED] Rate-Limiting Middleware
 * Tags: api, middleware, rate-limit, security
 *
 * Overview:
 * - Centralized rate-limiting for onboarding endpoints
 * - Uses in-memory store (or Firestore for persistence)
 * - Consistent limits across all ONB flows
 */

import { NextResponse } from "next/server";

import type { AuthenticatedRequest } from "../../_shared/middleware";

const MAX_REQUESTS_PER_WINDOW = 5;
const WINDOW_MS = 60000; // 1 minute

// In-memory store (in production, use Redis or Firestore)
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(uid: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const key = `ratelimit:${uid}`;
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    // Window expired or first request
    const resetAt = now + WINDOW_MS;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetAt };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - entry.count,
    resetAt: entry.resetAt,
  };
}

export function withRateLimit(
  handler: (
    req: AuthenticatedRequest & {
      user?: { uid: string; customClaims?: Record<string, unknown> };
    },
  ) => Promise<NextResponse>,
) {
  return async (
    req: AuthenticatedRequest & {
      user?: { uid: string; customClaims?: Record<string, unknown> };
    },
  ) => {
    const uid = req.user?.uid;
    if (!uid) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 },
      );
    }

    const limit = checkRateLimit(uid);
    if (!limit.allowed) {
      const retryAfter = Math.ceil((limit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Rate limit exceeded. Please try again later.",
          },
        },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    // Add rate limit info to response headers
    const response = await handler(req);
    response.headers.set("X-RateLimit-Remaining", String(limit.remaining));
    response.headers.set("X-RateLimit-Reset", new Date(limit.resetAt).toISOString());

    return response;
  };
}
