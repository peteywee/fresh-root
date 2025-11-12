//[P1][API][AUTH] Next.js-compatible session authentication middleware
// Tags: session, jwt, nextjs, firebase, security

import { getAuth } from "firebase-admin/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware: Require a valid Firebase session cookie (JWT)
 * Usage: Wrap API route handlers to enforce authentication
 */
export function requireSession(
  handler: (
    request: NextRequest,
    context: { params: Record<string, string>; userId: string },
  ) => Promise<NextResponse>,
) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> },
  ): Promise<NextResponse> => {
    // Get session cookie from Next.js request cookies
    const cookie = request.cookies.get("session")?.value;
    if (!cookie) {
      return NextResponse.json({ error: "Unauthorized - No session cookie" }, { status: 401 });
    }
    let decoded;
    try {
      const auth = getAuth();
      decoded = await auth.verifySessionCookie(cookie, true);
    } catch {
      return NextResponse.json({ error: "Unauthorized - Invalid session" }, { status: 401 });
    }
    // Set x-user-id header for downstream middleware
    const modifiedRequest = new NextRequest(request.url, request);
    modifiedRequest.headers.set("x-user-id", decoded.uid);
    return handler(modifiedRequest, { ...context, userId: decoded.uid });
  };
}
