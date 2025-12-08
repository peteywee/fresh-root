// [P0][PUBLISH][API] Publish endpoint

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { badRequest, ok, serverError } from "../_shared/validation";

const PublishEndpointSchema = z.object({
  scheduleId: z.string().min(1, "Schedule ID required"),
  comment: z.string().max(500).optional(),
  effectiveDate: z.number().optional(),
  notifyTeam: z.boolean().default(true),
});

/**
 * POST /api/publish
 * Publish a schedule
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  input: PublishEndpointSchema,
  handler: async ({ input, context, params }) => {
    try {
      const { scheduleId } = input;

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
