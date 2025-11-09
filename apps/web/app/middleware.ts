// [P2][API][MIDDLEWARE] Middleware middleware
// Tags: P2, API, MIDDLEWARE
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * A global middleware that adds basic security headers to every response.
 * This can be extended to enforce authentication, tenant routing, and other cross-cutting concerns.
 *
 * @param {NextRequest} _req - The Next.js request object.
 * @returns {NextResponse} The Next.js response object with added security headers.
 */
export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}
