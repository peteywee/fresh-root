// [P0][ONBOARDING][API] Verify eligibility endpoint
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

const VerifyEligibilitySchema = z.object({
  email: z.string().email().optional(),
  role: z.string().optional(),
}).passthrough();

interface ErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000;

function checkRateLimit(uid: string): number {
  const now = Date.now();
  const entry = rateLimitMap.get(uid);
  if (!entry || entry.resetTime <= now) {
    rateLimitMap.set(uid, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return RATE_LIMIT_MAX - 1;
  }
  entry.count++;
  return Math.max(0, RATE_LIMIT_MAX - entry.count);
}

export const POST = createAuthenticatedEndpoint({
  input: VerifyEligibilitySchema,
  handler: async ({ input, context }) => {
    const uid = context.auth?.userId;
    if (!uid) {
      return NextResponse.json<ErrorResponse>({ error: "Not authenticated", code: "GEN_NOT_AUTHENTICATED" }, { status: 401 });
    }
    if (!input.email || !input.role) {
      return NextResponse.json<ErrorResponse>({ error: "Missing email or role", code: "ONB_ELIGIBILITY_INVALID_REQUEST" }, { status: 400 });
    }
    const allowedRoles = ["owner_founder_director", "manager_supervisor", "corporate_hq", "manager", "org_owner", "admin"];
    if (!allowedRoles.includes(input.role)) {
      return NextResponse.json<ErrorResponse>({ error: "Role not allowed for onboarding", code: "ONB_ELIGIBILITY_ROLE_DENIED" }, { status: 403 });
    }
    const rateLimitRemaining = checkRateLimit(uid);
    return NextResponse.json({
      ok: true,
      eligible: true,
      email: input.email,
      role: input.role,
      isStub: false,
      rate_limit_remaining: rateLimitRemaining,
    }, { status: 200 });
  },
});
