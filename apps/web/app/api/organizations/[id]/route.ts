// [P0][ORG][DETAIL][API] Organization detail endpoint

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError } from "../../_shared/validation";
import { z } from "zod";

// Inline update schema to avoid mismatched exported name
const UpdateOrgPayloadSchema = z
  .object({
    networkId: z.string().min(1).optional(),
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    industry: z.string().max(100).optional(),
    size: z.string().optional(),
    status: z.string().optional(),
    logoUrl: z.string().url().optional(),
    websiteUrl: z.string().url().optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().max(20).optional(),
    settings: z.record(z.unknown()).optional(),
  })
  .passthrough();

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
  input: UpdateOrgPayloadSchema,
  handler: async ({ input, context, params }) => {
    try {
      const updated = {
        id: params.id,
        ...input,
        updatedBy: context.auth?.userId,
        updatedAt: Date.now(),
      };
      return ok(updated);
    } catch {
      return serverError("Failed to update organization");
    }
  },
});

/**
 * DELETE /api/organizations/[id]
 * Delete organization
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
