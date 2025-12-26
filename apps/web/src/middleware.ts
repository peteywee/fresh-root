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

  // Basic security headers
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Required for Firebase Google popup auth to communicate with opener
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");

  // CSP: Allow Firebase Auth and Google APIs for authentication
  const csp = [
    "default-src 'self'",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://accounts.google.com",
    "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
    "frame-ancestors 'self'",
  ].join("; ");
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

// Apply to all routes except those handled by proxy's PUBLIC list
export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
