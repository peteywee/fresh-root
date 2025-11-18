//[P1][API][SECURITY] Rate limiting middleware (in-memory)
// Tags: rate-limiting, security, dos-protection

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Runtime rate limiter (in-memory) - careful: not suitable for multi-instance production
 * Use: `rateLimit(config)(handler)`
 */
export interface RateLimitConfig {
  max: number;
  windowSeconds: number;
  keyGenerator?: (request: NextRequest) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // ms since epoch
}

class InMemoryRateLimiter {
  private requests = new Map<string, { count: number; resetAt: number }>();

  async checkLimit(key: string, max: number, windowSeconds: number): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.requests.get(key);

    if (!entry || entry.resetAt < now) {
      const resetAt = now + Math.max(1, Math.floor(windowSeconds)) * 1000;
      this.requests.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: Math.max(0, max - 1), resetAt };
    }

    if (entry.count >= max) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    this.requests.set(key, entry);
    return { allowed: true, remaining: Math.max(0, max - entry.count), resetAt: entry.resetAt };
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (entry.resetAt < now) this.requests.delete(key);
    }
  }

  // Clear all stored counters (useful for tests and graceful shutdown)
  reset() {
    this.requests.clear();
  }
}

class NoOpRateLimiter {
  async checkLimit(_key: string, _max: number, windowSeconds: number): Promise<RateLimitResult> {
    return { allowed: true, remaining: Number.MAX_SAFE_INTEGER, resetAt: Date.now() + Math.max(1, Math.floor(windowSeconds)) * 1000 };
  }
  cleanup() {
    /* noop */
  }
  reset() {
    /* noop */
  }
}

// Allow in-memory limiter only when explicitly enabled in production.
// Prefer a server-only env var `RATE_LIMIT_ALLOW_IN_MEMORY`. For compatibility, still accept `NEXT_PUBLIC_ALLOW_IN_MEMORY_RATE_LIMIT`.
const ALLOW_IN_MEMORY = (process.env.RATE_LIMIT_ALLOW_IN_MEMORY === "true") || (process.env.NEXT_PUBLIC_ALLOW_IN_MEMORY_RATE_LIMIT === "true") || process.env.NODE_ENV !== "production";

// If explicitly enabling in-memory limiter in production, log a conspicuous warning for operators
if (process.env.NODE_ENV === "production" && (process.env.RATE_LIMIT_ALLOW_IN_MEMORY === "true" || process.env.NEXT_PUBLIC_ALLOW_IN_MEMORY_RATE_LIMIT === "true")) {
  console.warn("rate-limit: In-memory rate limiter enabled in production via env var. This is not recommended for multi-instance deployments.");
}

// Extend globalThis type to avoid `any` usage and share limiter across HMR reloads
declare global {
  var __rateLimiter: InMemoryRateLimiter | NoOpRateLimiter | undefined;
  var __rateLimiterInterval: ReturnType<typeof setInterval> | undefined;
}

if (!globalThis.__rateLimiter) {
  globalThis.__rateLimiter = ALLOW_IN_MEMORY ? new InMemoryRateLimiter() : new NoOpRateLimiter();
}

// Ensure a single cleanup interval is created when allowed and supported by the runtime.
function ensureCleanupInterval() {
  if (!ALLOW_IN_MEMORY) return;
  if (typeof setInterval !== "function") return;
  if (globalThis.__rateLimiterInterval) return; // already set

  try {
    globalThis.__rateLimiterInterval = setInterval(() => {
      try {
        globalThis.__rateLimiter?.cleanup();
      } catch (err) {
        // swallow cleanup errors to avoid destabilizing server
        // but log so operators can investigate
        console.error("rate-limit cleanup error:", err);
      }
    }, 60_000);
  } catch (err) {
    // some runtimes (Edge) do not allow setInterval; that's fine
    console.warn("rate-limit: could not start cleanup interval", err);
  }
}

ensureCleanupInterval();

const limiter = globalThis.__rateLimiter as InMemoryRateLimiter | NoOpRateLimiter;

type HeadersLike = Headers | Record<string, string | undefined> | undefined;

type AnyRequest = NextRequest & { headers?: HeadersLike; nextUrl?: { pathname?: string }; url?: string };

function defaultKeyGenerator(request: NextRequest): string {
  // defensive header/url access to support test harnesses and plain objects
  const getHeader = (name: string) => {
    try {
      if (!request) return undefined;

      const headersAny = (request as AnyRequest).headers;

      if (!headersAny) return undefined;

      // Headers-like (Request/NextRequest)
      if (typeof (headersAny as Headers).get === "function") {
        return (headersAny as Headers).get(name) ?? undefined;
      }

      // Plain headers object
      if (typeof headersAny === "object") {
        const dict = headersAny as Record<string, string | undefined>;
        return dict[name.toLowerCase()] ?? dict[name] ?? undefined;
      }

      return undefined;
    } catch {
      return undefined;
    }
  };

  // x-forwarded-for may be a comma-separated list; take the left-most (original client)
  const xff = getHeader("x-forwarded-for") ?? getHeader("x-real-ip");
  const ip = typeof xff === "string" ? xff.split(",")[0].trim() : xff ?? "unknown";
  // common headers used by proxy/auth layers
  const rawUser = getHeader("x-user-id") ?? getHeader("x-uid") ?? getHeader("authorization");
  // avoid using full tokens/PII in rate-limit keys — hash long values
  const userId = typeof rawUser === "string" && rawUser.length > 0 ? hashKeyPart(rawUser) : rawUser;

  let pathname = "unknown";
  try {
    const r = request as AnyRequest;
    if (r.nextUrl?.pathname) pathname = r.nextUrl.pathname;
    else if (r.url) pathname = new URL(r.url, "http://localhost").pathname;
  } catch {
    pathname = "unknown";
  }

  return `${pathname}:${ip}${userId ? `:user:${userId}` : ""}`;
}

function hashKeyPart(s: string) {
  try {
    return crypto.createHash("sha256").update(s).digest("hex").slice(0, 8);
  } catch {
    // fallback to a short substring if crypto isn't available in runtime
    return s.slice(-8);
  }
}

function buildRateLimitHeaders(config: RateLimitConfig, result: { remaining: number; resetAt: number }) {
  // Reset header should be in epoch seconds per common conventions
  const resetSeconds = Math.floor(result.resetAt / 1000);
  const retryAfter = Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000));

  // Use lowercase header names (Headers are case-insensitive, but common practice is lowercase)
  return {
    "x-ratelimit-limit": String(config.max),
    "x-ratelimit-remaining": String(Math.max(0, result.remaining)),
    "x-ratelimit-reset": String(resetSeconds),
    "retry-after": String(retryAfter),
  } as Record<string, string>;
}

async function checkAndGetResult(request: NextRequest, config: RateLimitConfig) {
  if (!config || typeof config.max !== "number" || config.max <= 0) throw new Error("rateLimit: invalid config.max (must be > 0)");
  if (!config || typeof config.windowSeconds !== "number" || config.windowSeconds <= 0)
    throw new Error("rateLimit: invalid config.windowSeconds (must be > 0)");

  const keyFn = config.keyGenerator ?? defaultKeyGenerator;
  let key: string;
  try {
    key = (keyFn(request) ?? "unknown") as string;
  } catch (e) {
    // Key generator must not throw — fallback to safe key
    console.warn("rateLimit: keyGenerator threw, falling back to 'unknown'", e);
    key = "unknown";
  }
  const result = await limiter.checkLimit(key, config.max, config.windowSeconds);
  return { key, result } as { key: string; result: RateLimitResult };
}

// Higher-order middleware: rateLimit(config)(handler)
// Overloads: support both middleware-style and inline checks for backwards compatibility
export function rateLimit(config: RateLimitConfig): <T extends (request: NextRequest, ctx?: any) => Promise<Response | NextResponse>>(handler: T) => (request: NextRequest, ctx?: any) => Promise<Response | NextResponse>;
export function rateLimit(request: NextRequest, config: RateLimitConfig): Promise<NextResponse | null>;
// Implementation uses `any` for compatibility with both call styles.
 
export function rateLimit(arg1: any, arg2?: any): any {
  const isConfig = (v: unknown): v is RateLimitConfig => {
    if (!v || typeof v !== "object") return false;
    const obj = v as Record<string, unknown>;
    // Heuristics: treat common http-like objects as requests (they will have
    // `method`, `url`, or `headers`), otherwise treat objects with `max` or
    // `windowSeconds` as configs. Be lenient for numbers provided as strings.
    const looksLikeRequest = (x: Record<string, unknown>) =>
      Boolean(x.method || x.url || x.headers);
    if (looksLikeRequest(obj)) return false;
    const hasMax = obj.max !== undefined && (typeof obj.max === "number" || !isNaN(Number(obj.max)));
    const hasWindow = obj.windowSeconds !== undefined && (typeof obj.windowSeconds === "number" || !isNaN(Number(obj.windowSeconds)));
    return Boolean(hasMax || hasWindow || obj.max !== undefined || obj.windowSeconds !== undefined);
  };
  // Middleware HOF path: rateLimit(config)(handler)
  if (isConfig(arg1) && arg2 === undefined) {
    const config = arg1 as RateLimitConfig;
    return function <T extends (request: NextRequest, ctx?: any) => Promise<Response | NextResponse>>(handler: T) {
      return async (request: NextRequest, ctx?: any) => {
        const { result } = await checkAndGetResult(request, config);

        if (!result.allowed) {
          return NextResponse.json(
            { error: "Rate limit exceeded", retryAfter: Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000)) },
            {
              status: 429,
              headers: buildRateLimitHeaders(config, result),
            },
          );
        }

        const response = await handler(request, ctx);

        // Attach rate limit headers to the response if headers are mutable
        try {
          const resp = response as unknown as { headers?: { set?: (k: string, v: string) => void } };
          const respHeaders = resp?.headers;
          if (respHeaders && typeof respHeaders.set === "function") {
            // prefer lowercase header keys
            respHeaders.set("x-ratelimit-limit", String(config.max));
            respHeaders.set("x-ratelimit-remaining", String(Math.max(0, result.remaining)));
            respHeaders.set("x-ratelimit-reset", String(Math.floor(result.resetAt / 1000)));
          }
        } catch {
          // ignore failures when headers are readonly
        }

        return response;
      };
    };
  }

  // Inline check path: await rateLimit(request, config)
  const request = arg1 as NextRequest;
  const config = arg2 as RateLimitConfig;
  return (async () => {
    const { result } = await checkAndGetResult(request, config);
    if (!result.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000)) },
        {
          status: 429,
          headers: buildRateLimitHeaders(config, result),
        },
      );
    }
    return null;
  })();
}

/** Programmatic check helper -- returns { key, result } so routes can act upon it. */
export async function checkRateLimit(request: NextRequest, config: RateLimitConfig) {
  return await checkAndGetResult(request, config);
}

/** Get the active limiter instance (may be NoOpRateLimiter in production) */
export function getRateLimiter() {
  return globalThis.__rateLimiter as InMemoryRateLimiter | NoOpRateLimiter | undefined;
}

/** Reset in-memory counters (no-op for NoOp limiter). Useful for tests. */
export function resetRateLimiter(): void {
  try {
    const rl = getRateLimiter() as unknown as { reset?: () => void } | undefined;
    rl?.reset?.();
  } catch {
    // ignore
  }
}

/** Shutdown periodic cleanup timer and reset counters. Useful for test teardown. */
export function shutdownRateLimiter(): void {
  try {
    if (globalThis.__rateLimiterInterval) {
      try {
        clearInterval(globalThis.__rateLimiterInterval as unknown as number);
      } catch {
        // ignore
      }
      globalThis.__rateLimiterInterval = undefined as unknown as ReturnType<typeof setInterval> | undefined;
    }
    resetRateLimiter();
  } catch {
    // ignore
  }
}

export const RateLimits = {
  STRICT: { max: 10, windowSeconds: 60 },
  STANDARD: { max: 100, windowSeconds: 60 },
  AUTH: { max: 5, windowSeconds: 60 },
  WRITE: { max: 30, windowSeconds: 60 },
  // alias for convenience
  api: { max: 100, windowSeconds: 60 },
};

// Backwards-compatible default export
export default rateLimit;
