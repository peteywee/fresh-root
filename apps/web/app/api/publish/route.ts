// [P0][PUBLISH][API] Publish endpoint

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { ok, badRequest, serverError } from "../_shared/validation";
import { PublishScheduleSchema } from "@fresh-schedules/types";

/**
 * POST /api/publish
 * Publish a schedule
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  input: PublishScheduleSchema,
  handler: async ({ input, context, params }) => {
    try {
      const { notifyStaff, message } = input;
      const scheduleId = (params?.id as string) || null;
      if (!scheduleId) return badRequest("scheduleId is required");

      const result = {
        success: true,
        scheduleId,
        message,
        notifyStaff: notifyStaff ?? true,
        publishedBy: context.auth?.userId,
        publishedAt: Date.now(),
      };

      return ok(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      console.error("Failed to publish schedule", { error: message, orgId: context.org?.orgId });
      return serverError("Failed to publish schedule");
    }
  },
});
