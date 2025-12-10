// [P0][PUBLISH][API] Publish endpoint
<<<<<<< HEAD
// Tags: P0, PUBLISH, API, SDK_FACTORY

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { PublishRequestSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";
=======

import { z } from "zod";

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError } from "../_shared/validation";

const PublishEndpointSchema = z.object({
  scheduleId: z.string().min(1, "Schedule ID required"),
  comment: z.string().max(500).optional(),
  effectiveDate: z.number().optional(),
  notifyTeam: z.boolean().default(true),
});
>>>>>>> origin/dev

/**
 * POST /api/publish
 * Publish a schedule
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
<<<<<<< HEAD
  input: PublishRequestSchema,
  handler: async ({ input, context }) => {
    try {
      const published = {
        id: `publish-${Date.now()}`,
        entityType: input.entityType,
        entityId: input.entityId,
        publishAt: input.publishAt || Date.now(),
        notifyUsers: input.notifyUsers,
        channels: input.channels,
        orgId: context.org!.orgId,
        publishedBy: context.auth!.userId,
        status: "published",
        createdAt: Date.now(),
      };
      return NextResponse.json(published);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to publish";
      console.error("Publish failed", {
        error: message,
        orgId: context.org?.orgId,
        userId: context.auth?.userId,
      });
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message } },
        { status: 500 }
      );
=======
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
>>>>>>> origin/dev
    }
  },
});
