//[P1][API][CODE] Organization Members API route handler
// Tags: P1, API, CODE, validation, zod, rbac

import { MembershipCreateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { withValidation } from "../../../../../src/lib/api/validation";
import { requireSession, AuthenticatedRequest } from "../../../_shared/middleware";
import { serverError } from "../../../_shared/validation";

/**
 * GET /api/organizations/[id]/members
 * List members of an organization
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireSession(request as AuthenticatedRequest, async (_authReq) => {
    try {
      const { id: orgId } = await params;

      // In production, fetch from Firestore filtered by orgId
      const members = [
        {
          id: "mem-1",
          orgId,
          uid: "user-123",
          roles: ["admin"],
          joinedAt: new Date().toISOString(),
          mfaVerified: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "mem-2",
          orgId,
          uid: "user-456",
          roles: ["manager"],
          joinedAt: new Date().toISOString(),
          mfaVerified: false,
          createdAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({ members });
    } catch {
      return serverError("Failed to fetch members");
    }
  });
}

/**
 * POST /api/organizations/[id]/members
 * Add a member to an organization
 */
async function postHandler(
  request: NextRequest,
  data: z.infer<typeof MembershipCreateSchema>,
  params: { id: string },
) {
  return requireSession(request as AuthenticatedRequest, async (authReq) => {
    try {
      const { id: orgId } = params;

      // In production:
      // 1. Verify requester has permission to add members
      // 2. Verify user being added exists
      // 3. Check if user is already a member
      // 4. Create membership in Firestore

      const newMember = {
        id: `mem-${Date.now()}`,
        orgId,
        ...data,
        joinedAt: new Date().toISOString(),
        invitedBy: authReq.user?.uid,
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json(newMember, { status: 201 });
    } catch {
      return serverError("Failed to add member");
    }
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const validated = withValidation(MembershipCreateSchema, (req, data) =>
    postHandler(req, data, params),
  );
  return validated(request);
}
