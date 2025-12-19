// [P1][API][MIDDLEWARE] Next.js middleware with route protection via proxy
// Tags: P1, API, MIDDLEWARE, AUTH
import type { NextRequest } from "next/server";
import { proxy } from "../proxy";

/**
 * Global middleware for the web app. Applies:
 * 1. Route protection (via proxy function)
 * 2. Security headers
 */
export function middleware(request: NextRequest) {
  // First, apply route protection
  const authResponse = proxy(request);

  // If proxy returns a redirect (unauthorized), return it immediately
  if (authResponse.status === 307 || authResponse.status === 308) {
    return authResponse;
  }

  // Otherwise, add security headers to the response
  const response = authResponse;

  // Basic security headers (tune as needed).
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: blob:; media-src 'self' data: blob:; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'self';",
  );

  return response;
}

// Apply to all routes except those handled by proxy's PUBLIC list
export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
