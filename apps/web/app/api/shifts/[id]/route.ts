// [P0][SHIFTS][DETAIL][API] Shift detail endpoint

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { badRequest, ok, serverError } from "../../_shared/validation";

/**
 * GET /api/shifts/[id]
 * Get shift details
 */
export const GET = createOrgEndpoint({
  handler: async ({ context, params }) => {
    try {
      const { id } = params;
      const shift = {
        id,
        name: "Sample Shift",
        orgId: context.org?.orgId,
        startTime: Date.now(),
        endTime: Date.now() + 28800000,
      };
      return ok(shift);
    } catch {
      return serverError("Failed to fetch shift");
    }
  },
});

/**
 * PATCH /api/shifts/[id]
 * Update shift
 */
export const PATCH = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ request, context, params }) => {
    try {
      const body = await request.json();
      const { name, startTime, endTime } = body;
      const updated = {
        id: params.id,
        name,
        startTime,
        endTime,
        updatedBy: context.auth?.userId,
      };
      return ok(updated);
    } catch {
      return serverError("Failed to update shift");
    }
  },
});

/**
 * DELETE /api/shifts/[id]
 * Delete shift
 */
export const DELETE = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ context, params }) => {
    try {
      return ok({ deleted: true, id: params.id });
    } catch {
      return serverError("Failed to delete shift");
    }
  },
});
