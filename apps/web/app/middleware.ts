// [P2][API][MIDDLEWARE] Middleware middleware
// Tags: P2, API, MIDDLEWARE
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * App-wide middleware: enforce onboarding hard gate for app routes.
 * - Calls /api/session/bootstrap with the incoming cookies to retrieve
 *   the user's onboarding/profile shell.
 * - Redirects unauthenticated users to /signin
 * - If onboarding.status !== 'complete' redirects to /onboarding/profile
 *   when profile is incomplete, otherwise to /onboarding
 *
 * Public routes (signin, onboarding, api, _next, favicon) are exempt.
 * BYPASS_ONBOARDING_GUARD=true in dev continues to bypass the guard.
 */
export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // Public routes: sign-in, onboarding, assets, api
  const PUBLIC = [/^\/onboarding/, /^\/signin/, /^\/api/, /^\/_next/, /^\/favicon\.ico$/];
  if (PUBLIC.some((rx) => rx.test(pathname))) {
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return res;
  }

  // Allow bypass in development for faster iteration
  if (process.env.BYPASS_ONBOARDING_GUARD === "true" && process.env.NODE_ENV === "development") {
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return res;
  }

  // Only enforce for top-level app routes (prefixes commonly used by the app).
  // You can extend this matcher if other app prefixes need protection.
  const APP_PREFIXES = ["/app", "/dashboard", "/schedule", "/publish", "/settings"];
  const isAppRoute = APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // For non-app routes, still add headers and continue.
  if (!isAppRoute) {
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return res;
  }

  try {
    // Call our bootstrap endpoint with the incoming cookie header so the server
    // can validate the session and return the onboarding/profile shell.
    const bootstrapUrl = new URL("/api/session/bootstrap", req.url).toString();
    const bootstrapRes = await fetch(bootstrapUrl, {
      headers: {
        // Forward cookies so the session verification can run server-side
        cookie: req.headers.get("cookie") || "",
      },
    });

    if (bootstrapRes.status === 401) {
      // Not authenticated: redirect to sign-in
      const signInUrl = new URL("/signin", req.url);
      return NextResponse.redirect(signInUrl);
    }

    const data = await bootstrapRes.json();

    const onboarding = data?.onboarding || { status: "not_started", stage: "profile" };
    const profile = data?.profile || {};

    if (onboarding.status !== "complete") {
      // If profile is missing required fields, send to /onboarding/profile
      const needsProfile = !profile?.fullName || !profile?.selfDeclaredRole;
      const dest = new URL(needsProfile ? "/onboarding/profile" : "/onboarding", req.url);
      return NextResponse.redirect(dest);
    }

    // Onboarding complete — allow through
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return res;
  } catch (_e) {
    // On unexpected errors, conservatively allow the request so we don't block
    // traffic; frontend will still see the bootstrap endpoint fail and can act.
    const res = NextResponse.next();
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return res;
  }
}

export const config = {
  // Run middleware for all paths except static/_next (mirrors previous proxy matcher)
  matcher: ["/((?!_next|favicon.ico).*)"],
};
