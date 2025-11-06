// [P2][API][MIDDLEWARE] Middleware middleware
// Tags: P2, API, MIDDLEWARE
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Global middleware: adds basic headers defense in depth;
 * can be extended to enforce auth/tenant routing.
 */
export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}
