// [P0][SECURITY][RATE_LIMIT] Rate Limit Examples
// Tags: P0, SECURITY, RATE_LIMIT
/**
 * apps/web/app/api/_shared/rate-limit-examples.ts
 *
 * Copy-paste examples of how to use withRateLimit in your route handlers.
 *
 * Do NOT import this file; these are just for reference and copy-paste.
 * See individual route.ts files for actual implementations.
 */

/* ============================================================================ */
/* EXAMPLE 1: Simple rate-limited POST handler (with session)                  */
/* ============================================================================ */

/*
// File: apps/web/app/api/onboarding/create-network-org/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "../_shared/rate-limit-middleware";
import { requireSession } from "../_shared/middleware";

export const POST = withRateLimit(
  requireSession(async (req) => {
    // Your existing handler logic
    const body = await req.json();

    // ... validate, process, etc.

    return NextResponse.json({ success: true });
  }),
  {
    feature: "onboarding",
    route: "POST /api/onboarding/create-network-org",
    max: 30,
    windowSeconds: 60
  }
);
*/

/* ============================================================================ */
/* EXAMPLE 2: Strict rate limiting for auth endpoints                          */
/* ============================================================================ */

/*
// File: apps/web/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "../_shared/rate-limit-middleware";

export const POST = withRateLimit(
  async (req) => {
    const { email, password } = await req.json();

    // ... login logic

    return NextResponse.json({ success: true, token: "..." });
  },
  {
    feature: "auth",
    route: "POST /api/auth/login",
    max: 5,           // ← Strict: 5 attempts per minute
    windowSeconds: 60,
    keyPrefix: "auth:login"
  }
);
*/

/* ============================================================================ */
/* EXAMPLE 3: Generous rate limiting for public endpoints                      */
/* ============================================================================ */

/*
// File: apps/web/app/api/public/search/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "../_shared/rate-limit-middleware";

export const GET = withRateLimit(
  async (req) => {
    const query = req.nextUrl.searchParams.get("q");

    // ... search logic

    return NextResponse.json({ results: [] });
  },
  {
    feature: "search",
    route: "GET /api/public/search",
    max: 100,         // ← Generous: 100 searches per minute
    windowSeconds: 60,
    keyPrefix: "search"
  }
);
*/

/* ============================================================================ */
/* EXAMPLE 4: Chaining multiple middleware (session + rate limit)              */
/* ============================================================================ */

/*
// File: apps/web/app/api/schedules/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "../_shared/rate-limit-middleware";
import { requireSession } from "../_shared/middleware";
import { requireAuth } from "../_shared/middleware"; // another middleware

// Compose middleware: requireAuth → requireSession → withRateLimit
const authHandler = requireAuth(
  requireSession(async (req) => {
    // Your handler logic here
    return NextResponse.json({ success: true });
  })
);

export const POST = withRateLimit(authHandler, {
  feature: "schedules",
  route: "POST /api/schedules/create",
  max: 10,
  windowSeconds: 60,
  keyPrefix: "schedules:create"
});
*/

/* ============================================================================ */
/* EXAMPLE 5: Rate limiting without upstream middleware                        */
/* ============================================================================ */

/*
// File: apps/web/app/api/public/ping/route.ts

import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "../_shared/rate-limit-middleware";

// Stand-alone handler with just rate limiting
export const GET = withRateLimit(
  async (req) => {
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  },
  {
    feature: "health",
    route: "GET /api/public/ping",
    max: 1000,        // ← Very generous for health checks
    windowSeconds: 60
  }
);
*/

/* ============================================================================ */
/* QUICK REFERENCE: Configuration Options                                     */
/* ============================================================================ */

/*
RateLimitConfig {
  // REQUIRED: Human-readable feature name (e.g., "onboarding", "auth")
  feature: string;

  // REQUIRED: Route identifier (e.g., "POST /api/onboarding/create")
  route: string;

  // REQUIRED: Max requests allowed per window
  max: number;

  // REQUIRED: Window size in seconds
  windowSeconds: number;

  // OPTIONAL: Custom namespace prefix (default: "api")
  // Use this to separate different rate limit buckets
  keyPrefix?: string;
}
*/

/* ============================================================================ */
/* MEMORY USAGE & ENVIRONMENT CONSIDERATIONS                                  */
/* ============================================================================ */

/*
DEVELOPMENT / LOCAL:
  - Uses in-memory rate limiter (InMemoryRateLimiter)
  - Perfect for single-process development
  - Buckets stored in Map, automatically cleaned on window reset
  - No external dependencies

PRODUCTION WITH REDIS:
  - Set REDIS_URL env var (e.g., redis://localhost:6379)
  - Uses RedisRateLimiter (multi-instance safe)
  - Keys expire automatically in Redis after windowSeconds
  - Shared across all instances of your app

PRODUCTION WITHOUT REDIS:
  - Falls back to in-memory (NOT recommended for multi-instance)
  - Each instance has its own bucket – requests may split across processes
  - If you need strict rate limiting, set up Redis
*/

/* ============================================================================ */
/* COMMON PATTERNS                                                             */
/* ============================================================================ */

/*
1. STRICT AUTH (5 attempts/min):
   max: 5, windowSeconds: 60, keyPrefix: "auth"

2. MODERATE API (30 calls/min):
   max: 30, windowSeconds: 60, keyPrefix: "api"

3. GENEROUS PUBLIC (100 calls/min):
   max: 100, windowSeconds: 60, keyPrefix: "public"

4. BURST PROTECTION (10 calls/second):
   max: 10, windowSeconds: 1, keyPrefix: "burst"

5. HOURLY QUOTA (1000 calls/hour):
   max: 1000, windowSeconds: 3600, keyPrefix: "hourly"
*/

export { };

