// [P0][ORG][DETAIL][API] Organization detail endpoint

import { z } from "zod";
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError } from "../../_shared/validation";

const UpdateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  settings: z.record(z.any()).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

/**
 * GET /api/organizations/[id]
 * Get organization details
 */
export const GET = createOrgEndpoint({
  handler: async ({ context, params }) => {
    try {
      const { id } = params;
      const org = {
        id,
        name: "Sample Organization",
        ownerId: context.auth?.userId,
        memberCount: 1,
        createdAt: Date.now(),
      };
      return ok(org);
    } catch {
      return serverError("Failed to fetch organization");
    }
  },
});

/**
 * PATCH /api/organizations/[id]
 * Update organization
 */
export const PATCH = createOrgEndpoint({
  roles: ["admin"],
  input: UpdateOrgSchema,
  handler: async ({ input, context, params }) => {
    try {
      const updated = {
        id: params.id,
        ...input,
        updatedBy: context.auth?.userId,
        updatedAt: Date.now(),
      };
      return ok(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update organization";
      console.error("Failed to update organization", { error: message, orgId: params.id, userId: context.auth?.userId });
      return serverError("Failed to update organization");
    }
  },
});

/**
 * DELETE /api/organizations/[id]
 */
export const DELETE = createOrgEndpoint({
  roles: ["admin"],
  handler: async ({ context, params }) => {
    try {
      return ok({ deleted: true, id: params.id });
    } catch {
      return serverError("Failed to delete organization");
    }
  },
});
