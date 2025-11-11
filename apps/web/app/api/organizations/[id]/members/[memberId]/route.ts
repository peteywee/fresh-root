//[P1][API][CODE] Organization Member [memberId] API route handler
// Tags: P1, API, CODE, validation, zod, rbac

import { UpdateMembershipSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../../../src/lib/api/authorization";
import { csrfProtection } from "../../../../../../src/lib/api/csrf";
import { rateLimit, RateLimits } from "../../../../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../../../../src/lib/api/sanitize";
import { serverError } from "../../../../_shared/validation";

/**
 * GET /api/organizations/[id]/members/[memberId]
 * Get member details (org membership required)
 */
export const GET = requireOrgMembership(async (request: NextRequest, context) => {
  // Apply rate limiting using the inline check pattern used elsewhere
  const rateLimitResult = await rateLimit(request, RateLimits.api);
  if (rateLimitResult) return rateLimitResult;

  const { params } = context;
  try {
    const { id: orgId, memberId } = await params;
    // In production, fetch from Firestore and check permissions
    const member = {
      id: memberId,
      orgId,
      uid: "user-123",
      roles: ["admin"],
      joinedAt: new Date().toISOString(),
      mfaVerified: true,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json(member);
  } catch {
    return serverError("Failed to fetch member");
  }
});

/**
 * PATCH /api/organizations/[id]/members/[memberId]
 * Update member roles or settings (admin+ only)
 */
export const PATCH = csrfProtection()(
  requireOrgMembership(
    requireRole("admin")(async (request: NextRequest, context) => {
      // Inline rate-limiting check
      const rateLimitResult = await rateLimit(request, RateLimits.api);
      if (rateLimitResult) return rateLimitResult;

      const { params, userId } = context;
      try {
        const { id: orgId, memberId } = await params;

        const body = await request.json();
        const validated = UpdateMembershipSchema.parse(body);
        const sanitized = sanitizeObject(validated);

        // In production: permission checks, update Firestore
        const updatedMember = {
          id: memberId,
          orgId,
          uid: "user-123",
          ...sanitized,
          updatedAt: new Date().toISOString(),
          updatedBy: userId,
        };
        return NextResponse.json(updatedMember);
      } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
          return NextResponse.json({ error: "Invalid member data" }, { status: 400 });
        }
        return serverError("Failed to update member");
      }
    }),
  ),
);

/**
 * DELETE /api/organizations/[id]/members/[memberId]
 * Remove a member from an organization (admin+ only)
 */
export const DELETE = csrfProtection()(
  requireOrgMembership(
    requireRole("admin")(async (request: NextRequest, context) => {
      // Inline rate-limiting check
      const rateLimitResult = await rateLimit(request, RateLimits.api);
      if (rateLimitResult) return rateLimitResult;

      const { params } = context;
      try {
        const { id: orgId, memberId } = params;
        // In production: permission checks, delete from Firestore
        return NextResponse.json({
          message: "Member removed successfully",
          orgId,
          memberId,
        });
      } catch {
        return serverError("Failed to remove member");
      }
    }),
  ),
);
