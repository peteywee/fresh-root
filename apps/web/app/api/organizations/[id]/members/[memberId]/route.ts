// [P0][ORG][MEMBER][DETAIL][API] Organization member detail endpoint

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { UpdateMemberApiSchema } from "@fresh-schedules/types";

import { ok, serverError } from "../../../../_shared/validation";

/**
 * GET /api/organizations/[id]/members/[memberId]
 * Get member details
 */
export const GET = createOrgEndpoint({
  handler: async ({ context, params }) => {
    try {
      const { id, memberId } = params;
      const member = {
        id: memberId,
        orgId: id,
        email: "member@example.com",
        role: "staff",
        joinedAt: Date.now(),
      };
      return ok(member);
    } catch {
      return serverError("Failed to fetch member");
    }
  },
});

/**
 * PATCH /api/organizations/[id]/members/[memberId]
 * Update member role or permissions
 */
export const PATCH = createOrgEndpoint({
  roles: ["admin"],
  input: UpdateMemberApiSchema,
  handler: async ({ input, context, params }) => {
    try {
      const { role, permissions } = input;
      const updated = {
        id: params.memberId,
        orgId: params.id,
        role,
        permissions,
        updatedBy: context.auth?.userId,
      };
      return ok(updated);
    } catch {
      return serverError("Failed to update member");
    }
  },
});

/**
 * DELETE /api/organizations/[id]/members/[memberId]
 * Remove member from organization
 */
export const DELETE = createOrgEndpoint({
  roles: ["admin"],
  handler: async ({ context, params }) => {
    try {
      return ok({ removed: true, memberId: params.memberId });
    } catch {
      return serverError("Failed to remove member");
    }
  },
});
