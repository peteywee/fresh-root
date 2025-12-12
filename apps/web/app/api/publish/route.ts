// [P0][PUBLISH][API] Publish endpoint

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { z } from "zod";

import { ok, serverError } from "../_shared/validation";

// Publish request schema
const PublishRequestSchema = z.object({
  scheduleId: z.string().min(1),
  publishAt: z.number().optional(),
  notifyUsers: z.boolean().default(true),
  channels: z.array(z.string()).default([]),
});

type PublishRequest = z.infer<typeof PublishRequestSchema>;

/**
 * POST /api/publish
 * Publish a schedule
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  input: PublishRequestSchema,
  handler: async ({ input, context }: { input: PublishRequest; context: any }) => {
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
