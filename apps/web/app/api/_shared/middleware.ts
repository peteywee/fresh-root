// [P0][AUTH][MIDDLEWARE] API middleware for session verification
// Tags: P0, AUTH, MIDDLEWARE
import { trace, SpanStatusCode } from "@opentelemetry/api";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

import { getFirebaseAdminAuth } from "../../../lib/firebase-admin";
import { Logger } from "../../../src/lib/logger";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string;
    email?: string;
    customClaims?: Record<string, unknown>;
  };
  logger?: Logger;
}

/**
 * Middleware to require a valid session cookie on API routes.
 * Returns 401 if session is missing or invalid.
 */
export async function requireSession(
  req: AuthenticatedRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  const startTime = Date.now();
  const reqLogger = Logger.fromRequest(req);

  const tracer = trace.getTracer("apps-web");
  return await tracer.startActiveSpan("auth.requireSession", async (span) => {
    try {
      const sessionCookie = req.cookies.get("session")?.value;

      if (!sessionCookie) {
        reqLogger.warn("Missing session cookie");
        span.setStatus({ code: SpanStatusCode.ERROR, message: "No session cookie" });
        span.setAttribute("http.status_code", 401);
        span.end();
        return NextResponse.json({ error: "Unauthorized: No session cookie" }, { status: 401 });
      }

      const auth = getFirebaseAdminAuth();
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

      // Attach user info and logger to request
      req.user = {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        customClaims: decodedClaims,
      };
      req.logger = reqLogger.child({ uid: decodedClaims.uid });

      // Set Sentry user context
      Sentry.setUser({
        id: decodedClaims.uid,
        email: decodedClaims.email,
      });

      const response = await handler(req);
      const latencyMs = Date.now() - startTime;

      span.setAttribute("enduser.id", decodedClaims.uid);
      span.setAttribute("http.status_code", response.status);
      span.setAttribute("http.route", req.nextUrl.pathname);
      span.end();

      reqLogger.info("Request authenticated", { uid: decodedClaims.uid, latencyMs });
      return response;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      reqLogger.error("Session verification failed", error, { latencyMs });
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.end();
      return NextResponse.json({ error: "Unauthorized: Invalid session" }, { status: 401 });
    }
  });
}

/**
 * Middleware to require 2FA for manager/admin operations.
 * Checks for 'mfa' claim in the session token.
 */
export async function require2FAForManagers(
  req: AuthenticatedRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
): Promise<NextResponse> {
  // First verify session
  const sessionResult = await requireSession(req, async (authenticatedReq) => {
    const tracer = trace.getTracer("apps-web");
    return tracer.startActiveSpan("auth.require2FAForManagers", async (span) => {
      const hasMFA = authenticatedReq.user?.customClaims?.mfa === true;

      if (!hasMFA) {
        authenticatedReq.logger?.warn("2FA required but not present", {
          uid: authenticatedReq.user?.uid,
        });
        span.setStatus({ code: SpanStatusCode.ERROR, message: "2FA required" });
        span.setAttribute("http.status_code", 403);
        span.end();
        return NextResponse.json(
          { error: "Forbidden: 2FA required for this operation" },
          { status: 403 },
        );
      }

      try {
        const res = await handler(authenticatedReq);
        span.setAttribute("http.status_code", res.status);
        span.end();
        return res;
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.end();
        throw error;
      }
    });
  });

  return sessionResult;
}
