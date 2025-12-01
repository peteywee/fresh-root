// [P0][ORG][MEMBERS][API] Organization members endpoint

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { badRequest, ok, serverError } from "../../../_shared/validation";

const AddMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["member", "manager", "admin"]).describe("Member role in organization"),
});

// TEST COVERAGE NOTE: AddMemberSchema validation tests should verify:
// - email field validates format and is required
// - role field restricts to valid enum values  
// - error messages returned for missing/invalid fields
// See @fresh-schedules/api-framework/src/testing.ts for test utilities

/**
 * GET /api/organizations/[id]/members
 * List members of an organization
 */
export const GET = createOrgEndpoint({
  handler: async ({ context, params }) => {
    try {
      const { id } = params;
      const members = [
        {
          id: "member-1",
          orgId: id,
          email: "user@example.com",
          role: "admin",
          joinedAt: Date.now(),
        },
      ];
      return ok({ members, total: members.length });
    } catch {
      return serverError("Failed to fetch members");
    }
  },
});

/**
 * POST /api/organizations/[id]/members
 * Add a member to organization
 */
export const POST = createOrgEndpoint({
  roles: ["admin"],
  handler: async ({ request, context, params }) => {
    try {
      const body = await request.json();
      const validated = AddMemberSchema.parse(body);
      const member = {
        id: `member-${Date.now()}`,
        orgId: params.id,
        ...validated,
        joinedAt: Date.now(),
        addedBy: context.auth?.userId,
      };
      return NextResponse.json(member, { status: 201 });
    } catch {
      return serverError("Failed to add member");
    }
  },
});

/**
 * PATCH /api/organizations/[id]/members
 * Update member role
 */
export const PATCH = createOrgEndpoint({
  roles: ["admin"],
  handler: async ({ request, context, params }) => {
    try {
      const body = await request.json();
      const { memberId, role } = body;
      const updated = { memberId, role, updatedBy: context.auth?.userId };
      return ok(updated);
    } catch {
      return serverError("Failed to update member");
    }
  },
});

/**
 * DELETE /api/organizations/[id]/members
 * Remove member from organization
 */
export const DELETE = createOrgEndpoint({
  roles: ["admin"],
  handler: async ({ request, context, params }) => {
    try {
      const body = await request.json();
      const { memberId } = body;
      return ok({ removed: true, memberId });
    } catch {
      return serverError("Failed to remove member");
    }
  },
});
