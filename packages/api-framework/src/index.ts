// [P0][API][CODE] Index
// Tags: P0, API, CODE
/**
 * @fresh-schedules/api-framework
 *
 * The Internal SDK - A "Framework within a Framework"
 *
 * This module provides a single factory function that wraps all the boilerplate:
 * - Global error handling
 * - Rate limiting
 * - Authentication verification
 * - Organization context loading
 * - Role-based permissions
 * - Request validation (Zod)
 * - Audit logging
 * - CSRF protection
 *
 * USAGE:
 * ```typescript
 * import { createEndpoint } from '@fresh-schedules/api-framework';
 *
 * export const GET = createEndpoint({
 *   auth: 'required',
 *   org: 'required',
 *   roles: ['admin', 'manager'],
 *   rateLimit: { maxRequests: 100, windowMs: 60000 },
 *   input: MyInputSchema,  // Zod schema
 *   handler: async ({ input, context }) => {
 *     // Your clean business logic here
 *     return { data: result };
 *   }
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";

import type { OrgRole } from "../../types/src/rbac";

// =============================================================================
// TYPES
// =============================================================================

export interface AuthContext {
  userId: string;
  email: string;
  emailVerified: boolean;
  customClaims: Record<string, unknown>;
}

export interface OrgContext {
  orgId: string;
  role: OrgRole;
  membershipId: string;
}

export interface RequestContext {
  auth: AuthContext | null;
  org: OrgContext | null;
  requestId: string;
  timestamp: number;
}

export interface EndpointConfig<TInput = unknown, TOutput = unknown> {
  /** Authentication requirement */
  auth?: "required" | "optional" | "none";

  /** Organization context requirement */
  org?: "required" | "optional" | "none";

  /** Required roles (if org is required) */
  roles?: OrgRole[];

  /** Rate limiting configuration */
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };

  /** CSRF protection (default: true for mutations) */
  csrf?: boolean;

  /** Zod schema for request body/query validation */
  input?: ZodSchema<TInput>;

  /** The actual handler function */
  handler: (params: {
    request: NextRequest;
    input: TInput;
    context: RequestContext;
    params: Record<string, string>;
  }) => Promise<TOutput>;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: Record<string, string[]>;
  requestId: string;
  retryable: boolean;
}

export type ErrorCode =
  | "VALIDATION_FAILED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "BAD_REQUEST";

// =============================================================================
// ERROR FACTORY
// =============================================================================

function createErrorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  requestId: string,
  details?: Record<string, string[]>,
): NextResponse<{ error: ApiError }> {
  const error: ApiError = {
    code,
    message,
    requestId,
    retryable: code === "RATE_LIMITED" || code === "INTERNAL_ERROR",
    ...(details && { details }),
  };

  return NextResponse.json({ error }, { status });
}

// =============================================================================
// MIDDLEWARE FUNCTIONS
// =============================================================================

/**
 * Rate limiting with sliding window (in-memory for now)
 *
 * ⚠️ PRODUCTION WARNING: In-memory storage is NOT suitable for multi-instance deployments.
 *
 * For production, you MUST:
 * 1. Set REDIS_URL environment variable
 * 2. Use Upstash REST API (recommended for Vercel) or ioredis
 * 3. Replace this Map with Redis client (see packages/api-framework/src/redis.ts)
 *
 * Without Redis, clients can bypass rate limits by hitting different instances.
 *
 * TODO: Replace with Redis for multi-instance deployments
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

async function checkRateLimit(
  key: string,
  config: { maxRequests: number; windowMs: number },
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: config.maxRequests - record.count, resetAt: record.resetAt };
}

/**
 * Verify Firebase session cookie and extract user info
 */
async function verifyAuth(request: NextRequest): Promise<AuthContext | null> {
  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    // Dynamic import to avoid bundling firebase-admin in client
    const { getAuth } = await import("firebase-admin/auth");
    const decodedToken = await getAuth().verifySessionCookie(sessionCookie, true);

    return {
      userId: decodedToken.uid,
      email: decodedToken.email || "",
      emailVerified: decodedToken.email_verified || false,
      customClaims: decodedToken.customClaims || {},
    };
  } catch {
    return null;
  }
}

/**
 * Load organization context from membership
 */
async function loadOrgContext(userId: string, request: NextRequest): Promise<OrgContext | null> {
  // Get orgId from query params or headers
  const url = new URL(request.url);
  const orgId = url.searchParams.get("orgId") || request.headers.get("x-org-id");

  if (!orgId) {
    return null;
  }

  try {
    const { getFirestore } = await import("firebase-admin/firestore");
    const db = getFirestore();

    // Query membership for this user + org
    const membershipQuery = await db
      .collectionGroup("memberships")
      .where("uid", "==", userId)
      .where("orgId", "==", orgId)
      .where("status", "==", "active")
      .limit(1)
      .get();

    if (membershipQuery.empty) {
      return null;
    }

    const membership = membershipQuery.docs[0].data();

    return {
      orgId,
      role: membership.role as OrgRole,
      membershipId: membershipQuery.docs[0].id,
    };
  } catch {
    return null;
  }
}

/**
 * Check if user has required role (hierarchical)
 */
function hasRequiredRole(userRole: OrgRole, requiredRoles: OrgRole[]): boolean {
  const roleHierarchy: Record<OrgRole, number> = {
    org_owner: 100,
    admin: 80,
    manager: 60,
    scheduler: 50,
    corporate: 45,
    staff: 40,
  };

  const userLevel = roleHierarchy[userRole];
  const minRequired = Math.min(...requiredRoles.map((r) => roleHierarchy[r]));

  return userLevel >= minRequired;
}

/**
 * CSRF token verification
 *
 * ⚠️ IMPORTANT: Current implementation requires token distribution mechanism:
 * 1. Generate CSRF token on initial page load (e.g., from a GET endpoint)
 * 2. Store in both secure HttpOnly cookie AND response body
 * 3. Client sends token in X-CSRF-Token header for mutations
 * 4. This middleware verifies token matches cookie (timing-safe comparison)
 *
 * For stateless APIs or if token distribution is not feasible:
 * - Set csrf: false in endpoint config to disable
 * - Consider using SameSite=Strict cookies instead
 * - Use CORS preflight requirements for additional protection
 *
 * References:
 * - https://owasp.org/www-community/attacks/csrf
 * - https://developer.mozilla.org/en-US/docs/Glossary/CSRF
 */
async function verifyCsrf(request: NextRequest): Promise<boolean> {
  const csrfToken = request.headers.get("x-csrf-token");
  const csrfCookie = request.cookies.get("csrf")?.value;

  if (!csrfToken || !csrfCookie) {
    return false;
  }

  // Timing-safe comparison
  if (csrfToken.length !== csrfCookie.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < csrfToken.length; i++) {
    result |= csrfToken.charCodeAt(i) ^ csrfCookie.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Audit logging
 */
async function logAudit(
  action: string,
  context: RequestContext,
  request: NextRequest,
  success: boolean,
  details?: Record<string, unknown>,
): Promise<void> {
  const logEntry = {
    timestamp: new Date().toISOString(),
    requestId: context.requestId,
    action,
    userId: context.auth?.userId || "anonymous",
    orgId: context.org?.orgId || null,
    ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
    success,
    details,
  };

  // In production: send to Cloud Logging, Datadog, etc.
  // For now: structured console log
  console.info("[AUDIT]", JSON.stringify(logEntry));
}

// =============================================================================
// MAIN FACTORY
// =============================================================================

/**
 * Create a protected API endpoint with all middleware applied
 */
export function createEndpoint<TInput = unknown, TOutput = unknown>(
  config: EndpointConfig<TInput, TOutput>,
): (request: NextRequest, context: { params: Promise<Record<string, string>> }) => Promise<NextResponse> {
  const {
    auth = "required",
    org = "none",
    roles = [],
    rateLimit,
    csrf,
    input: inputSchema,
    handler,
  } = config;

  return async (request: NextRequest, routeContext: { params: Promise<Record<string, string>> }) => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    const params = await routeContext.params;

    // Initialize context
    const context: RequestContext = {
      auth: null,
      org: null,
      requestId,
      timestamp: startTime,
    };

    try {
      // =========================================================================
      // STEP 1: Rate Limiting
      // =========================================================================
      if (rateLimit) {
        const rateLimitKey = request.headers.get("x-forwarded-for") || "global";
        const result = await checkRateLimit(rateLimitKey, rateLimit);

        if (!result.allowed) {
          return createErrorResponse(
            "RATE_LIMITED",
            "Too many requests. Please try again later.",
            429,
            requestId,
          );
        }
      }

      // =========================================================================
      // STEP 2: Authentication
      // =========================================================================
      const authContext = await verifyAuth(request);
      context.auth = authContext;

      if (auth === "required" && !authContext) {
        return createErrorResponse("UNAUTHORIZED", "Authentication required.", 401, requestId);
      }

      // =========================================================================
      // STEP 3: CSRF Protection (for mutations)
      // =========================================================================
      const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
      const shouldCheckCsrf = csrf ?? isMutation;

      if (shouldCheckCsrf) {
        const csrfValid = await verifyCsrf(request);
        if (!csrfValid) {
          return createErrorResponse("FORBIDDEN", "Invalid CSRF token.", 403, requestId);
        }
      }

      // =========================================================================
      // STEP 4: Organization Context
      // =========================================================================
      if (org !== "none" && authContext) {
        const orgContext = await loadOrgContext(authContext.userId, request);
        context.org = orgContext;

        if (org === "required" && !orgContext) {
          return createErrorResponse(
            "FORBIDDEN",
            "Organization membership required.",
            403,
            requestId,
          );
        }

        // =========================================================================
        // STEP 5: Role Check
        // =========================================================================
        if (roles.length > 0 && orgContext) {
          if (!hasRequiredRole(orgContext.role, roles)) {
            return createErrorResponse(
              "FORBIDDEN",
              `Insufficient permissions. Required role: ${roles.join(" or ")}.`,
              403,
              requestId,
            );
          }
        }
      }

      // =========================================================================
      // STEP 6: Input Validation
      // =========================================================================
      let validatedInput: TInput = {} as TInput;

      if (inputSchema) {
        try {
          let rawInput: unknown;

          if (request.method === "GET") {
            // Parse query params
            const url = new URL(request.url);
            rawInput = Object.fromEntries(url.searchParams);
          } else {
            // Parse JSON body
            rawInput = await request.json().catch(() => ({}));
          }

          validatedInput = inputSchema.parse(rawInput);
        } catch (error) {
          if (error instanceof ZodError) {
            const details: Record<string, string[]> = {};
            error.issues.forEach((e: import("zod").ZodIssue) => {
              const path = e.path.join(".");
              if (!details[path]) details[path] = [];
              details[path].push(e.message);
            });

            return createErrorResponse(
              "VALIDATION_FAILED",
              "Request validation failed.",
              400,
              requestId,
              details,
            );
          }
          throw error;
        }
      }

      // =========================================================================
      // STEP 7: Execute Handler
      // =========================================================================
      const result = await handler({
        request,
        input: validatedInput,
        context,
        params,
      });

      // =========================================================================
      // STEP 8: Audit Log (Success)
      // =========================================================================
      const duration = Date.now() - startTime;
      await logAudit(`${request.method} ${new URL(request.url).pathname}`, context, request, true, {
        durationMs: duration,
      });

      // Return success response
      return NextResponse.json(
        { data: result, meta: { requestId, durationMs: duration } },
        { status: 200 },
      );
    } catch (error) {
      // =========================================================================
      // GLOBAL ERROR HANDLER
      // =========================================================================
      console.error(`[ERROR] Request ${requestId}:`, error);

      await logAudit(
        `${request.method} ${new URL(request.url).pathname}`,
        context,
        request,
        false,
        { error: error instanceof Error ? error.message : "Unknown error" },
      );

      return createErrorResponse("INTERNAL_ERROR", "An unexpected error occurred.", 500, requestId);
    }
  };
}

// =============================================================================
// CONVENIENCE WRAPPERS
// =============================================================================

/**
 * Create a public endpoint (no auth required)
 */
export function createPublicEndpoint<TInput = unknown, TOutput = unknown>(
  config: Omit<EndpointConfig<TInput, TOutput>, "auth" | "org" | "roles">,
): ReturnType<typeof createEndpoint> {
  return createEndpoint({
    ...config,
    auth: "none",
    org: "none",
    roles: [],
    csrf: false,
  });
}

/**
 * Create an authenticated endpoint (auth required, no org context)
 */
export function createAuthenticatedEndpoint<TInput = unknown, TOutput = unknown>(
  config: Omit<EndpointConfig<TInput, TOutput>, "auth">,
): ReturnType<typeof createEndpoint> {
  return createEndpoint({
    ...config,
    auth: "required",
  });
}

/**
 * Create an org-scoped endpoint (auth + org membership required)
 */
export function createOrgEndpoint<TInput = unknown, TOutput = unknown>(
  config: Omit<EndpointConfig<TInput, TOutput>, "auth" | "org"> & { roles?: OrgRole[] },
): ReturnType<typeof createEndpoint> {
  return createEndpoint({
    ...config,
    auth: "required",
    org: "required",
  });
}

/**
 * Create an admin-only endpoint
 */
export function createAdminEndpoint<TInput = unknown, TOutput = unknown>(
  config: Omit<EndpointConfig<TInput, TOutput>, "auth" | "org" | "roles">,
): ReturnType<typeof createEndpoint> {
  return createEndpoint({
    ...config,
    auth: "required",
    org: "required",
    roles: ["admin", "org_owner"],
  });
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

export { z } from "zod";
export type { ZodSchema } from "zod";
export type { OrgRole };

// =============================================================================
// REDIS & RATE LIMITING
// =============================================================================

export * from "./redis";
export { checkRateLimit, createRateLimitMiddleware } from "./redis";
export type { RateLimitConfig, RateLimitResult, RedisClient } from "./redis";

// TODO: Add Route Factory pattern here next
// - validateInput(schema: ZodSchema, data: unknown)
// - withRateLimit(handler, config)
// - withAuth(handler, required: boolean)
// - withOrgContext(handler, required: boolean)
// - withAuditLog(handler, event: string)

// =============================================================================
// SPECIALIZED ENDPOINT FACTORY: Rate-Limited Public Endpoint
// =============================================================================

/**
 * createRateLimitedEndpoint
 *
 * Factory for public endpoints that require rate limiting without authentication.
 * Useful for APIs like webhooks, public reports, or throttled free-tier endpoints.
 *
 * EXAMPLE:
 * ```typescript
 * export const GET = createRateLimitedEndpoint({
 *   rateLimit: { maxRequests: 10, windowMs: 60000 },
 *   handler: async ({ request, context }) => {
 *     const ip = request.headers.get('x-forwarded-for') || 'unknown';
 *     return NextResponse.json({ message: 'OK' });
 *   }
 * });
 * ```
 */
export function createRateLimitedEndpoint<TOutput = unknown>(
  config: Omit<EndpointConfig<unknown, TOutput>, "auth" | "org"> & {
    handler: (params: {
      request: NextRequest;
      context: RequestContext;
      params: Record<string, string>;
    }) => Promise<NextResponse>;
  },
): (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<NextResponse> {
  return createEndpoint({
    auth: "none",
    org: "none",
    ...config,
  });
}


// =============================================================================
// SDK ENHANCEMENTS
// =============================================================================
// Export all enhancement modules for advanced use cases
export * from "./enhancements";

