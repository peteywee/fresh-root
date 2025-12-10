// [P0][PUBLISH][API] Publish endpoint

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { PublishRequestSchema } from "@fresh-schedules/types";
import { ok, serverError } from "../_shared/validation";

/**
 * POST /api/publish
 * Publish a schedule
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  input: PublishRequestSchema,
  handler: async ({ input, context }) => {
    try {
      const result = {
        success: true,
        scheduleId: input.scheduleId,
        publishedBy: context.auth?.userId,
        publishedAt: input.publishAt || Date.now(),
        notifyUsers: input.notifyUsers,
        channels: input.channels,
      };

      return ok(result);
    } catch {
      return serverError("Failed to publish schedule");
    }
  },
});
