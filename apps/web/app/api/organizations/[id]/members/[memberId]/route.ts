//[P1][API][CODE] Organization Member [memberId] API route handler
// Tags: P1, API, CODE, validation, zod, rbac

import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { requireSession, AuthenticatedRequest } from "../../../../_shared/middleware";
import { serverError } from "../../../../_shared/validation";
import { withValidation } from "../../../../../../src/lib/api/validation";
import { MembershipUpdateSchema } from "@fresh-schedules/types";

/**
 * GET /api/organizations/[id]/members/[memberId]
 * Get member details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  return requireSession(request as AuthenticatedRequest, async (_authReq) => {
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
}

/**
 * PATCH /api/organizations/[id]/members/[memberId]
 * Update member roles or settings
 */
async function patchHandler(
  request: NextRequest,
  data: z.infer<typeof MembershipUpdateSchema>,
  params: { id: string; memberId: string },
) {
  return requireSession(request as AuthenticatedRequest, async (authReq) => {
    try {
      const { id: orgId, memberId } = params;

      // In production:
      // 1. Verify requester has permission to modify roles
      // 2. Validate role changes are allowed
      // 3. Update in Firestore

      const updatedMember = {
        id: memberId,
        orgId,
        uid: "user-123",
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: authReq.user?.uid,
      };

      return NextResponse.json(updatedMember);
    } catch {
      return serverError("Failed to update member");
    }
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; memberId: string }> },
) {
  const params = await context.params;
  const validated = withValidation(MembershipUpdateSchema, (req, data) =>
    patchHandler(req, data, params),
  );
  return validated(request);
}

/**
 * DELETE /api/organizations/[id]/members/[memberId]
 * Remove a member from an organization
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  return requireSession(request as AuthenticatedRequest, async (_authReq) => {
    try {
      const { id: orgId, memberId } = await params;

      // In production:
      // 1. Verify requester has permission to remove members
      // 2. Prevent removing the last org_owner
      // 3. Delete from Firestore

      return NextResponse.json({
        message: "Member removed successfully",
        orgId,
        memberId,
      });
    } catch {
      return serverError("Failed to remove member");
    }
  });
}
