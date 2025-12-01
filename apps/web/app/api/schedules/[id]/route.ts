// [P0][SCHEDULE][API] Schedule detail endpoint

import { UpdateScheduleSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { badRequest, ok, parseJson, serverError } from "../../_shared/validation";

/**
 * GET /api/schedules/[id]
 * Fetch a schedule by ID
 */
export const GET = createOrgEndpoint({
  handler: async ({ request, context, params }) => {
    try {
      const { id } = params;
      if (!id) {
        return badRequest("Schedule ID is required");
      }

      // Mock data
      const schedule = {
        id,
        orgId: context.org?.orgId,
        name: "Q1 2025 Schedule",
        status: "draft",
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
      };

      return ok(schedule);
    } catch {
      return serverError("Failed to fetch schedule");
    }
  },
});

/**
 * PATCH /api/schedules/[id]
 * Update a schedule
 * Note: Requires 'manager' role for broader Series-A access
 */
export const PATCH = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ request, context, params }) => {
    try {
      const { id } = params;
      const parsed = await parseJson(request, UpdateScheduleSchema);
      if (!parsed.success) {
        return badRequest("Validation failed", parsed.details);
      }

      const updated = {
        id,
        ...parsed.data,
        updatedBy: context.auth?.userId,
        updatedAt: Date.now(),
      };

      return ok(updated);
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return badRequest("Invalid schedule data");
      }
      return serverError("Failed to update schedule");
    }
  },
});

/**
 * DELETE /api/schedules/[id]
 * Delete a schedule
 * Note: Requires 'manager' role for broader Series-A access
 */
export const DELETE = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ context, params }) => {
    try {
      const { id } = params;
      if (!id) {
        return badRequest("Schedule ID is required");
      }

      return ok({ deleted: true, id });
    } catch {
      return serverError("Failed to delete schedule");
    }
  },
});
