// [P2][API][MIDDLEWARE] Middleware middleware
// Tags: P2, API, MIDDLEWARE
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple edge middleware for routing.
 *
 * Auth & rate limiting are handled inside route handlers via the SDK's
 * createEndpoint, createAuthenticatedEndpoint, createOrgEndpoint, etc.
 *
 * This middleware just passes requests through to allow edge processing
 * of routing logic.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
