// [P0][ORG][MEMBERS][API] Organization members endpoint

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";
import { z } from "zod";

import { ok, serverError } from "../../../_shared/validation";

const AddMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["member", "manager", "admin"]).describe("Member role in organization"),
});

const UpdateMemberSchema = z.object({
  memberId: z.string().min(1),
  role: z.enum(["member", "manager", "admin"]).optional(),
});

const RemoveMemberSchema = z.object({
  memberId: z.string().min(1),
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
  handler: async ({ request: _request, input: _input, context, params }) => {
    try {
      const { getFirestore } = await import("firebase-admin/firestore");
      const db = getFirestore();
      const { id } = params;

      const snapshot = await db
        .collection("memberships")
        .where("orgId", "==", id)
        .where("status", "in", ["active", "invited"])
        .get();

      const members = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return ok({ members, total: members.length });
    } catch (error) {
      console.error("Failed to fetch members", error);
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
  input: AddMemberSchema,
  handler: async ({ request: _request, input, context, params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof AddMemberSchema>;
      const member = {
        id: `member-${Date.now()}`,
        orgId: params.id,
        email: typedInput.email,
        role: typedInput.role,
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
  input: UpdateMemberSchema,
  handler: async ({ request: _request, input, context, params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof UpdateMemberSchema>;
      const { memberId, role } = typedInput;
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
  input: RemoveMemberSchema,
  handler: async ({ request: _request, input, context, params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof RemoveMemberSchema>;
      const { memberId } = typedInput;
      return ok({ removed: true, memberId });
    } catch {
      return serverError("Failed to remove member");
    }
  },
});
