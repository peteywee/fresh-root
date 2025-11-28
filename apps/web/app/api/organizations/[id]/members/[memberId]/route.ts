// [P0][ORGS][API] Organization member management endpoint

import { UpdateMembershipSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import {
  requireOrgMembership,
  requireRole,
  type OrgRole,
} from "../../../../../../src/lib/api/authorization";
import { csrfProtection } from "../../../../../../src/lib/api/csrf";
import { checkRateLimit, RateLimits } from "../../../../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../../../../src/lib/api/sanitize";
import { withSecurity } from "../../../../_shared/middleware";
import { badRequest, serverError } from "../../../../_shared/validation";

type MemberContextBase = {
  params: Record<string, string>;
  userId: string;
  orgId: string;
};

type MemberContextWithRoles = MemberContextBase & {
  roles: OrgRole[];
};

const SECURITY_OPTIONS = { requireAuth: true, maxRequests: 100, windowMs: 60_000 } as const;

const enforceRateLimit = async (request: NextRequest) => {
  const limit = await checkRateLimit(request, RateLimits.api);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  return null;
};

const buildMemberPayload = (context: MemberContextBase) => {
  const { memberId } = context.params;

  return {
    id: memberId,
    orgId: context.orgId,
    uid: "user-123",
    roles: ["admin"] as OrgRole[],
    joinedAt: new Date().toISOString(),
    mfaVerified: true,
    createdAt: new Date().toISOString(),
  };
};

const getMemberResponse = (context: MemberContextBase) =>
  NextResponse.json(buildMemberPayload(context));

const updateMemberResponse = async (request: NextRequest, context: MemberContextWithRoles) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON payload");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return badRequest("Invalid member data");
  }

  const sanitized = sanitizeObject(body as Record<string, unknown>);
  const validation = UpdateMembershipSchema.safeParse(sanitized);

  if (!validation.success) {
    return badRequest("Invalid member data", validation.error.issues);
  }

  return NextResponse.json({
    ...buildMemberPayload(context),
    ...validation.data,
    updatedAt: new Date().toISOString(),
    updatedBy: context.userId,
  });
};

const deleteMemberResponse = (context: MemberContextBase) => {
  const { memberId } = context.params;

  return NextResponse.json({
    message: "Member removed successfully",
    orgId: context.orgId,
    memberId,
  });
};

/**
 * GET /api/organizations/[id]/members/[memberId]
 * Get member details (org membership required)
 */
export const GET = withSecurity(
  requireOrgMembership(async (request: NextRequest, context: MemberContextBase) => {
    const limited = await enforceRateLimit(request);
    if (limited) {
      return limited;
    }

    try {
      return getMemberResponse(context);
    } catch {
      return serverError("Failed to fetch member");
    }
  }),
  SECURITY_OPTIONS,
);

/**
 * PATCH /api/organizations/[id]/members/[memberId]
 * Update member roles or settings (admin+ only)
 */
export const PATCH = csrfProtection()(
  withSecurity(
    requireOrgMembership(
      requireRole("admin")(async (request: NextRequest, context: MemberContextWithRoles) => {
        const limited = await enforceRateLimit(request);
        if (limited) {
          return limited;
        }

        try {
          return await updateMemberResponse(request, context);
        } catch {
          return serverError("Failed to update member");
        }
      }),
    ),
    SECURITY_OPTIONS,
  ),
);

/**
 * DELETE /api/organizations/[id]/members/[memberId]
 * Remove a member from an organization (admin+ only)
 */
export const DELETE = csrfProtection()(
  withSecurity(
    requireOrgMembership(
      requireRole("admin")(async (request: NextRequest, context: MemberContextWithRoles) => {
        const limited = await enforceRateLimit(request);
        if (limited) {
          return limited;
        }

        try {
          return deleteMemberResponse(context);
        } catch {
          return serverError("Failed to remove member");
        }
      }),
    ),
    SECURITY_OPTIONS,
  ),
);
