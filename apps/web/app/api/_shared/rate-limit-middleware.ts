// [P0][SECURITY][MIDDLEWARE] Rate Limit Middleware middleware
// Tags: P0, SECURITY, MIDDLEWARE, RATE_LIMIT
/**
 * apps/web/app/api/_shared/rate-limit-middleware.ts
 *
 * Shared helper to apply rate limiting to API route handlers.
 *
 * Usage (example in a route.ts file):
 *
 *   import { withRateLimit } from "../_shared/rate-limit-middleware";
 *   import { requireSession } from "../_shared/middleware"; // your existing auth
 *
 *   export const POST = withRateLimit(
 *     requireSession(async (req) => {
 *       // your handler logic
 *     }),
 *     {
 *       feature: "onboarding",
 *       route: "POST /api/onboarding/create-network-org",
 *       max: 30,
 *       windowSeconds: 60
 *     }
 *   );
 */

import { NextRequest, NextResponse } from "next/server";

import { buildRateLimitKey, getRateLimiter, type RateLimitOptions } from "@/src/lib/api/rate-limit";

interface RateLimitConfig extends RateLimitOptions {
  /**
   * Human-readable feature name (e.g. "onboarding", "schedules").
   */
  feature: string;

  /**
   * Route identifier (e.g. "POST /api/onboarding/create-network-org").
   */
  route: string;
}

/**
 * Wrap a Next.js route handler with rate limiting.
 *
 * The handler should be a function that takes NextRequest and returns
 * a Promise<NextResponse>.
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig,
): (req: NextRequest) => Promise<NextResponse> {
  const limiter = getRateLimiter({
    max: config.max,
    windowSeconds: config.windowSeconds,
    keyPrefix: config.keyPrefix ?? "api",
  });

  return async (req: NextRequest): Promise<NextResponse> => {
    // Derive client identity from headers; you can refine this to use session.
    const ip =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || (req as any).ip || null;

    // TODO: if you have requireSession upstream, you can attach user/org to
    //       request context and read them here instead of relying on IP.
    const key = buildRateLimitKey({
      feature: config.feature,
      route: config.route,
      ip,
      userId: null,
      orgId: null,
    });

    const result = await limiter.consume(key, 1);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": config.max.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
          },
        },
      );
    }

    return handler(req);
  };
}
