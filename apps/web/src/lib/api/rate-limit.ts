//[P1][API][SECURITY] Rate limiting middleware (in-memory)
// Tags: rate-limiting, security, dos-protection

import { NextRequest, NextResponse } from "next/server";

export interface RateLimitConfig {
  max: number;
  windowSeconds: number;
  keyGenerator?: (request: NextRequest) => string;
}

class InMemoryRateLimiter {
  private requests = new Map<string, { count: number; resetAt: number }>();

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
setInterval(() => { limiter.cleanup(); }, 60000);

function defaultKeyGenerator(request: NextRequest): string {
  const ip =
    request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  return `${request.nextUrl.pathname}:${ip}`;
}

export async function rateLimitCheck(
  request: NextRequest,
  config: RateLimitConfig = RateLimits.default,
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
} | NextResponse> {
  const keyFn = config.keyGenerator ?? defaultKeyGenerator;
  const key = keyFn(request);

  const result = await limiter.checkLimit(key, config.max, config.windowSeconds);
  if (!result.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000) },
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

  // On allowed requests, return the usage metadata so wrapper can attach headers.
  return { allowed: true, remaining: result.remaining, resetAt: result.resetAt };
}

// Create a HOF middleware wrapper to match the expected testing usage of rateLimit(config)(handler)
export function rateLimit(
  config: RateLimitConfig = RateLimits.default,
): (
  handler: (request: NextRequest, context: Record<string, unknown>) => Promise<NextResponse>,
) => (request: NextRequest, context: Record<string, unknown>) => Promise<NextResponse> {
  return (handler) => async (request, context) => {
    const check = await rateLimitCheck(request, config);
    if ((check as NextResponse)?.status === 429) return check as NextResponse;

    // If allowed, invoke handler and attach rate limit headers to the response
    const res = await handler(request, context);
    const usage = check as { allowed: boolean; remaining: number; resetAt: number };
    res.headers.set("X-RateLimit-Limit", config.max.toString());
    res.headers.set("X-RateLimit-Remaining", String(usage.remaining));
    res.headers.set("X-RateLimit-Reset", String(usage.resetAt));
    return res;
  };
}

export const RateLimits = {
  // lowercase canonical
  default: { max: 60, windowSeconds: 60 },
  strict: { max: 10, windowSeconds: 60 },
  auth: { max: 5, windowSeconds: 60 },
  api: { max: 100, windowSeconds: 60 },
  // uppercase aliases expected by tests
  DEFAULT: { max: 60, windowSeconds: 60 },
  STRICT: { max: 10, windowSeconds: 60 },
  AUTH: { max: 5, windowSeconds: 60 },
  WRITE: { max: 30, windowSeconds: 60 },
  STANDARD: { max: 100, windowSeconds: 60 },
};
