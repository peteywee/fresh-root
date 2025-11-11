// [P2][API][MIDDLEWARE] Next.js middleware for security headers
// Tags: P2, API, MIDDLEWARE
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Global middleware for the web app. Applies basic security headers
 * and can later enforce auth / routing rules as needed.
 */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

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

// Limit middleware to app + onboarding routes (adjust as needed).
export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*"],
};
