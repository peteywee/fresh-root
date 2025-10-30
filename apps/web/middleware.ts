import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Gate: if user has no org membership/profile, redirect to /onboarding.
 * Assumes a server-managed cookie "orgId" set after onboarding.
 * Replace this with a real session check (e.g., iron-session / Firebase session) when wired.
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // Public routes: sign-in, onboarding, assets, api
  const PUBLIC = [/^\/onboarding/, /^\/signin/, /^\/api/, /^\/_next/, /^\/favicon\.ico$/];
  if (PUBLIC.some(rx => rx.test(pathname))) return NextResponse.next();

  const orgId = req.cookies.get("orgId")?.value;
  if (!orgId) {
    const dest = new URL("/onboarding", req.url);
    return NextResponse.redirect(dest);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"]
};
