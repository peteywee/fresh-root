// [P0][SECURITY][MIDDLEWARE] Security middleware stack for API routes
// Tags: P0, SECURITY, MIDDLEWARE
import { NextRequest, NextResponse } from "next/server";

/**
 * A middleware that adds a suite of security headers to the response, inspired by Helmet.
 *
 * @param {NextResponse} response - The Next.js response object.
 * @returns {NextResponse} The response object with security headers added.
 */
export function securityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com;",
  );

  // Strict Transport Security (HSTS)
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  // X-Frame-Options
  response.headers.set("X-Frame-Options", "DENY");

  // X-Content-Type-Options
  response.headers.set("X-Content-Type-Options", "nosniff");

  // X-DNS-Prefetch-Control
  response.headers.set("X-DNS-Prefetch-Control", "off");

  // Referrer-Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=()",
  );

  return response;
}

/**
 * Rate limiting store (in-memory - use Redis in production)
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * A simple in-memory rate limiting middleware.
 *
 * @param {number} [maxRequests=100] - The maximum number of requests allowed per window.
 * @param {number} [windowMs=15 * 60 * 1000] - The time window in milliseconds.
 * @returns {Function} A middleware function that applies rate limiting.
 */
export function rateLimit(maxRequests = 100, windowMs = 15 * 60 * 1000) {
  return async (
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
  ): Promise<NextResponse> => {
    // Get client identifier (IP or user ID from session)
    const clientId =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const entry = rateLimitStore.get(clientId);

    // Clean up expired entries periodically
    if (rateLimitStore.size > 10000) {
      for (const [key, value] of rateLimitStore.entries()) {
        if (value.resetTime < now) {
          rateLimitStore.delete(key);
        }
      }
    }

    if (!entry || entry.resetTime < now) {
      // Create new entry
      rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return handler(req);
    }

    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": entry.resetTime.toString(),
          },
        },
      );
    }

    // Increment count
    entry.count += 1;
    rateLimitStore.set(clientId, entry);

    const response = await handler(req);

    // Add rate limit headers to response
    response.headers.set("X-RateLimit-Limit", maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", (maxRequests - entry.count).toString());
    response.headers.set("X-RateLimit-Reset", entry.resetTime.toString());

    return response;
  };
}

/**
 * A middleware for handling Cross-Origin Resource Sharing (CORS).
 *
 * @param {string[]} [allowedOrigins=[]] - An array of allowed origins.
 * @returns {Function} A middleware function that handles CORS.
 */
export function cors(allowedOrigins: string[] = []) {
  return async (
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
  ): Promise<NextResponse> => {
    const origin = req.headers.get("origin");
    const isAllowed =
      !origin ||
      origin === req.nextUrl.origin ||
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes("*");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": isAllowed ? origin || "*" : "",
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const response = await handler(req);

    if (isAllowed && origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    return response;
  };
}

/**
 * A middleware to limit the size of the request body.
 *
 * @param {number} [maxBytes=10 * 1024 * 1024] - The maximum request body size in bytes.
 * @returns {Function} A middleware function that enforces the request size limit.
 */
export function requestSizeLimit(maxBytes = 10 * 1024 * 1024) {
  return async (
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
  ): Promise<NextResponse> => {
    const contentLength = req.headers.get("content-length");

    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      return NextResponse.json(
        { error: "Request body too large" },
        {
          status: 413,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return handler(req);
  };
}

/**
 * A combined security middleware stack that applies all security measures in the correct order.
 *
 * @param {object} [options] - The options for the security stack.
 * @param {object} [options.rateLimit] - The rate limit options.
 * @param {number} [options.rateLimit.maxRequests] - The maximum number of requests.
 * @param {number} [options.rateLimit.windowMs] - The time window in milliseconds.
 * @param {object} [options.cors] - The CORS options.
 * @param {string[]} [options.cors.allowedOrigins] - The allowed origins.
 * @param {number} [options.maxBodySize] - The maximum request body size.
 * @returns {Function} A middleware function that applies the entire security stack.
 */
export function securityStack(options?: {
  rateLimit?: { maxRequests?: number; windowMs?: number };
  cors?: { allowedOrigins?: string[] };
  maxBodySize?: number;
}) {
  const rateLimitMiddleware = rateLimit(
    options?.rateLimit?.maxRequests,
    options?.rateLimit?.windowMs,
  );
  const corsMiddleware = cors(options?.cors?.allowedOrigins);
  const sizeLimitMiddleware = requestSizeLimit(options?.maxBodySize);

  return async (
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>,
  ): Promise<NextResponse> => {
    // Apply middleware in order: CORS → Size Limit → Rate Limit → Handler → Security Headers
    return corsMiddleware(req, (req1) =>
      sizeLimitMiddleware(req1, (req2) =>
        rateLimitMiddleware(req2, async (req3) => {
          const response = await handler(req3);
          return securityHeaders(response);
        }),
      ),
    );
  };
}
