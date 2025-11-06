//[P1][API][CODE] Organization Member [memberId] API route handler
// Tags: P1, API, CODE, validation, zod, rbac

import { MembershipUpdateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";
// ...existing code...

import { requireOrgMembership, requireRole } from "../../../../../../src/lib/api/authorization";
import { withValidation } from "../../../../../../src/lib/api/validation";
import { serverError } from "../../../../_shared/validation";

/**
 * GET /api/organizations/[id]/members/[memberId]
 * Get member details (org membership required)
 */
export const GET = requireOrgMembership(async (request: NextRequest, context) => {
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
 * Update member roles or settings
 */
/**
 * PATCH /api/organizations/[id]/members/[memberId]
 * Update member roles or settings (admin+ only)
 */
requireRole("admin")(async (request: NextRequest, context) => {
  return withValidation(MembershipUpdateSchema, async (req, data) => {
    const { params, userId } = context;
    try {
      const { id: orgId, memberId } = params;
      // In production: permission checks, update Firestore
      const updatedMember = {
        id: memberId,
        orgId,
        uid: "user-123",
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      };
      return NextResponse.json(updatedMember);
    } catch {
      return serverError("Failed to update member");
    }
  })(request);
});
// ...existing code...

/**
 * DELETE /api/organizations/[id]/members/[memberId]
 * Remove a member from an organization (admin+ only)
 */
export const DELETE = requireOrgMembership(
  requireRole("admin")(async (request: NextRequest, context) => {
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
);
