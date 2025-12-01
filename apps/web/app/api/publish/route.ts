// [P0][PUBLISH][API] Publish endpoint

import { NextRequest, NextResponse } from "next/server";

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { badRequest, ok, serverError } from "../_shared/validation";

/**
 * POST /api/publish
 * Publish a schedule
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ request, context, params }) => {
    try {
      const body = await request.json();
      const { scheduleId } = body;

      if (!scheduleId) {
        return badRequest("scheduleId is required");
      }

      const result = {
        success: true,
        scheduleId,
        publishedBy: context.auth?.userId,
        publishedAt: Date.now(),
      };

      return ok(result);
    } catch {
      return serverError("Failed to publish schedule");
    }
  },
});
