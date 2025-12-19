// [P0][PUBLISH][API] Publish schedule endpoint with Firestore
export const dynamic = "force-dynamic";

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { ok, serverError, badRequest } from "../_shared/validation";
import { FLAGS } from "../../../src/lib/features";

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
 * Publish a schedule - updates schedule status to published
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  input: PublishRequestSchema,
  rateLimit: { maxRequests: 20, windowMs: 60_000 },
  handler: async ({ input, context, params: _params, request: _request }) => {
    try {
      const validated = input as PublishRequest;
      const orgId = context.org?.orgId;
      const userId = context.auth?.userId;
      const now = Date.now();

      // F1: Write to Firestore if enabled
      if (FLAGS.FIRESTORE_WRITES && orgId) {
        const db = getFirestore();
        const scheduleRef = db.doc(`orgs/${orgId}/schedules/${validated.scheduleId}`);
        
        // Verify schedule exists
        const scheduleSnap = await scheduleRef.get();
        if (!scheduleSnap.exists) {
          return badRequest("Schedule not found", undefined, "NOT_FOUND");
        }

        // Update schedule status to published
        await scheduleRef.update({
          status: "published",
          publishedAt: validated.publishAt || now,
          publishedBy: userId,
          updatedAt: FieldValue.serverTimestamp(),
        });

        // TODO: Send notifications if validated.notifyUsers is true
        // This would integrate with a notification service

        return ok({
          success: true,
          scheduleId: validated.scheduleId,
          publishedBy: userId,
          publishedAt: validated.publishAt || now,
          notifyUsers: validated.notifyUsers,
          channels: validated.channels,
        });
      }

      // Fallback: Mock response when Firestore disabled
      return ok({
        success: true,
        scheduleId: validated.scheduleId,
        publishedBy: userId,
        publishedAt: validated.publishAt || now,
        notifyUsers: validated.notifyUsers,
        channels: validated.channels,
      });
    } catch {
      return serverError("Failed to publish schedule");
    }
  },
});
