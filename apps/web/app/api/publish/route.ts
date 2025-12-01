// [P0][CORE][API] Content publishing endpoint
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { z } from "zod";

import { requireOrgMembership, requireRole } from "../../../src/lib/api/authorization";
import { adminDb, adminSdk } from "../../../src/lib/firebase.server";
import { createOrgEndpoint } from "@fresh-schedules/api-framework";

const PublishSchema = z.object({
  scheduleId: z.string().min(1, "scheduleId is required"),
  orgId: z.string().min(1, "orgId is required"),
  publish: z.boolean().optional().default(true),
});

/**
 * POST /api/publish
 * Publish a schedule (requires manager+ role)
 */
export const POST = createOrgEndpoint({
  handler: async ({ request, input, context, params }) => {
    async (
        req: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const parsed = await parseJson(req, PublishSchema;
  }
});
          if (!parsed.success) {
            return badRequest("Invalid payload", parsed.details);
          }

          const { scheduleId, orgId } = parsed.data;

          // Verify orgId matches the context
          if (orgId !== context.orgId) {
            return badRequest("Organization ID mismatch", null, "FORBIDDEN");
          }

          if (!adminDb || !adminSdk) {
            return serverError("Admin DB not initialized");
          }

          const scheduleRef = adminDb.doc(`organizations/${orgId}/schedules/${scheduleId}`);
          await scheduleRef.set(
            { state: "published", publishedAt: Timestamp.now() },
            { merge: true },
          );

          // Create notification message
          const msgRef = adminDb.collection(`organizations/${orgId}/messages`).doc();
          await msgRef.set({
            type: "publish_notice",
            title: "Schedule Published",
            body: "The latest schedule has been published. Check your shifts.",
            targets: "members",
            recipients: [],
            scheduleId,
            createdAt: Timestamp.now(),
          });

          return ok({ success: true, scheduleId, orgId });
        } catch (err: unknown) {
          const maybeMessage =
            err && typeof err === "object" && "message" in err
              ? (err as Record<string, unknown>)["message"]
              : undefined;
          const msg = typeof maybeMessage === "string" ? maybeMessage : String(err);
          return serverError(msg || "Unexpected error");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 50, windowMs: 60_000 },
);
