// [P0][PUBLISH][API] Publish endpoint
// Tags: P0, PUBLISH, API, SDK_FACTORY

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { PublishRequestSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

/**
 * POST /api/publish
 * Publish a schedule
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
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
    }
  },
});

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
