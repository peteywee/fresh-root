//[P1][API][ONBOARDING] Verify Eligibility Endpoint (server)
// Tags: api, onboarding, eligibility

import { NextResponse } from "next/server";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";
import { withRequestLogging } from "../../_shared/logging";

/**
 * ErrorResponse is a canonical shape for API error responses.
 * In the future, this should be imported from @fresh-schedules/types.
 */
interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Track rate limits in-memory (per uid, last 24h)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 100; // requests per 24h
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(uid: string): number {
  const now = Date.now();
  const entry = rateLimitMap.get(uid);

  if (!entry || entry.resetTime <= now) {
    // Reset window
    rateLimitMap.set(uid, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return RATE_LIMIT_MAX - 1;
  }

  entry.count++;
  return Math.max(0, RATE_LIMIT_MAX - entry.count);
}

export async function verifyEligibilityHandler(
  req: AuthenticatedRequest & {
    user?: { uid: string; customClaims?: Record<string, unknown> };
  },
  adminDb?: any,
) {
  const uid = req.user?.uid;
  const claims = req.user?.customClaims || {};

  // Check authentication first
  if (!uid) {
    return NextResponse.json<ErrorResponse>(
      {
        error: "Not authenticated",
        code: "GEN_NOT_AUTHENTICATED",
      },
      { status: 401 },
    );
  }

  // Parse request body to validate required fields
  let body: any = {};
  if (req.json) {
    try {
      body = await req.json();
    } catch {
      // If no body or invalid JSON, treat as missing fields
      body = {};
    }
  }

  // Validate required fields
  if (!body.email || !body.role) {
    return NextResponse.json<ErrorResponse>(
      {
        error: "Missing email or role",
        code: "ONB_ELIGIBILITY_INVALID_REQUEST",
      },
      { status: 400 },
    );
  }

  // Validate role is allowed
  const allowedRoles = [
    "owner_founder_director",
    "manager_supervisor",
    "corporate_hq",
    "manager",
    "org_owner",
    "admin",
  ];

  if (!allowedRoles.includes(body.role)) {
    return NextResponse.json<ErrorResponse>(
      {
        error: "Role not allowed for onboarding",
        code: "ONB_ELIGIBILITY_ROLE_DENIED",
      },
      { status: 403 },
    );
  }

  // Check rate limit
  const rateLimitRemaining = checkRateLimit(uid);

  // Stub mode (no adminDb) or use adminDb if available
  const isStub = !adminDb;

  return NextResponse.json(
    {
      ok: true,
      eligible: true,
      email: body.email,
      role: body.role,
      isStub,
      rate_limit_remaining: rateLimitRemaining,
    },
    { status: 200 },
  );
}

// Adapter wraps the test-friendly handler for use with withSecurity middleware
async function apiRoute(
  req: AuthenticatedRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ctx?: { params: Record<string, string> },
) {
  return verifyEligibilityHandler(req);
}

export const POST = withRequestLogging(
  withSecurity(apiRoute, {
    requireAuth: true,
  }),
);
