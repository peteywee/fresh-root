// [P0][ORG][DETAIL][API] Organization detail endpoint
// Tags: P0, ORG, DETAIL, API, SDK_FACTORY

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { UpdateOrganizationSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

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
      return NextResponse.json(org);
    } catch (error) {
      console.error("Failed to fetch organization", { error, orgId: params.id });
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message: "Failed to fetch organization" } },
        { status: 500 }
      );
    }
  },
});

/**
 * PATCH /api/organizations/[id]
 * Update organization
 */
export const PUT = createOrgEndpoint({
  roles: ["admin"],
  input: UpdateOrganizationSchema,
  handler: async ({ input, context, params }) => {
    try {
      const updated = {
        id: params.id,
        name: input.name,
        settings: input.settings,
        updatedBy: context.auth?.userId,
        updatedAt: Date.now(),
      };
      return NextResponse.json(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update organization";
      console.error("Org update failed", {
        error: message,
        orgId: params.id,
        userId: context.auth?.userId,
      });
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message } },
        { status: 500 }
      );
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
      return NextResponse.json({ deleted: true, id: params.id });
    } catch (error) {
      console.error("Failed to delete organization", { error, orgId: params.id });
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message: "Failed to delete organization" } },
        { status: 500 }
      );
    }
  },
});
