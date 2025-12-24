// [P0][APP][CODE] Proxy
// Tags: P0, APP, CODE
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Super admin emails that skip onboarding and go straight to dashboard
const SUPER_ADMIN_EMAILS = ["admin@email.com"];

/**
 * Gate: Check authentication and org membership.
 * 1. If no session cookie -> redirect to /login
 * 2. If super admin -> allow through (skip onboarding)
 * 3. If session but no orgId -> redirect to /onboarding
 *
 * TEMPORARY: Set BYPASS_ONBOARDING_GUARD=true in env to disable for development.
 */
export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // Public routes: home, sign-in, login, onboarding, auth callback, assets, api
  const PUBLIC = [/^\/$/, /^\/onboarding/, /^\/signin/, /^\/login/, /^\/auth/, /^\/api/, /^\/_next/, /^\/favicon\.ico$/];
  if (PUBLIC.some((rx) => rx.test(pathname))) return NextResponse.next();

  // TEMPORARY: Allow bypassing the guard for development only
  if (process.env.BYPASS_ONBOARDING_GUARD === "true" && process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // Check for authenticated session first
  const session = req.cookies.get("session")?.value;
  if (!session) {
    const dest = new URL("/login", req.url);
    dest.searchParams.set("redirect", pathname);
    return NextResponse.redirect(dest);
  }

  // Check for super admin flag in cookie (set during login for admin users)
  const isSuperAdmin = req.cookies.get("isSuperAdmin")?.value === "true";
  if (isSuperAdmin) {
    // Super admins skip onboarding - go straight to dashboard/ops
    return NextResponse.next();
  }

  // Then check for org membership
  const orgId = req.cookies.get("orgId")?.value;
  if (!orgId) {
    const dest = new URL("/onboarding", req.url);
    return NextResponse.redirect(dest);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
