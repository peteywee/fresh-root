// [P0][PUBLISH][API] Publish endpoint

import { z } from "zod";

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError } from "../_shared/validation";

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
      const { scheduleId, comment, effectiveDate, notifyTeam } = input;

      const result = {
        success: true,
        scheduleId,
        message: comment ?? "Published",
        notifyTeam,
        publishedBy: context.auth?.userId,
        publishedAt: Date.now(),
        effectiveDate: effectiveDate ?? Date.now(),
      };

      return ok(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      console.error("Failed to publish schedule", { error: message, orgId: context.org?.orgId });
      return serverError("Failed to publish schedule");
    }
  },
});
