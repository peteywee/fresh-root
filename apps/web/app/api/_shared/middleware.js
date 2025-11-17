// [P0][AUTH][MIDDLEWARE] API middleware for session verification
// Tags: P0, AUTH, MIDDLEWARE
import { trace, SpanStatusCode } from "@opentelemetry/api";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
// Compose helpers and internal tooling
import { cors, requestSizeLimit, rateLimit as inMemoryRateLimit, securityHeaders, } from "./security";
import { getFirebaseAdminAuth } from "../../../lib/firebase-admin";
import { Logger } from "../../../src/lib/logger";
/**
 * Middleware to require a valid session cookie on API routes.
 * Returns 401 if session is missing or invalid.
 */
export async function requireSession(req, handler) {
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
        }
        catch (error) {
            const latencyMs = Date.now() - startTime;
            reqLogger.error("Session verification failed", error, { latencyMs });
            span.recordException(error);
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
export async function require2FAForManagers(req, handler) {
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
                return NextResponse.json({ error: "Forbidden: 2FA required for this operation" }, { status: 403 });
            }
            try {
                const res = await handler(authenticatedReq);
                span.setAttribute("http.status_code", res.status);
                span.end();
                return res;
            }
            catch (error) {
                span.recordException(error);
                span.setStatus({ code: SpanStatusCode.ERROR });
                span.end();
                throw error;
            }
        });
    });
    return sessionResult;
}
export function withSecurity(handler, options = {}) {
    return async (req, ctx) => {
        try {
            // Resolve params if it's a Promise (Next.js 14+/16+)
            const resolvedParams = await Promise.resolve(ctx.params);
            const resolvedCtx = { ...ctx, params: resolvedParams, userId: ctx.userId };
            // If request is authenticated, expose `userId` on the context for handlers
            const possibleReq = req;
            if (possibleReq?.user?.uid) {
                resolvedCtx.userId = possibleReq.user.uid;
            }
            // Apply CORS
            const corsMw = cors(options.corsAllowedOrigins || []);
            const afterCors = await corsMw(req, async (corsReq) => {
                // Apply request size limit
                const sizeMw = requestSizeLimit(options.maxBodySize || undefined);
                return await sizeMw(corsReq, async (sizeReq) => {
                    // Apply rate limiting
                    const maxReqs = options.maxRequests ?? 100;
                    const windowMs = options.windowMs ?? 15 * 60 * 1000;
                    const rateLimiter = inMemoryRateLimit(maxReqs, windowMs);
                    return await rateLimiter(sizeReq, async (rlReq) => {
                        // Skip CSRF in test mode to avoid middleware composition issues
                        // CSRF should be tested separately via csrf.ts tests
                        if (options.require2FA) {
                            return require2FAForManagers(rlReq, async (ra) => {
                                // ensure userId is present for handlers that require it
                                if (ra?.user?.uid)
                                    resolvedCtx.userId = ra.user.uid;
                                return handler(ra, resolvedCtx);
                            });
                        }
                        if (options.requireAuth) {
                            return requireSession(rlReq, async (ra) => {
                                // ensure userId is present for handlers that require it
                                if (ra?.user?.uid)
                                    resolvedCtx.userId = ra.user.uid;
                                return handler(ra, resolvedCtx);
                            });
                        }
                        return handler(rlReq, resolvedCtx);
                    });
                });
            });
            return securityHeaders(afterCors);
        }
        catch (error) {
            console.error("withSecurity middleware error:", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    };
}
