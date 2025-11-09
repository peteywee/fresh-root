// [P0][API][SCHEDULE] Schedule publish endpoint
// Tags: P0, API, SCHEDULE
import { NextRequest } from "next/server";
import { z } from "zod";

import { requireOrgMembership, requireRole } from "../../../src/lib/api/authorization";
import { adminDb, adminSdk } from "../../../src/lib/firebase.server";
import { withSecurity } from "../_shared/middleware";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

const PublishSchema = z.object({
  scheduleId: z.string().min(1, "scheduleId is required"),
  orgId: z.string().min(1, "orgId is required"),
  publish: z.boolean().optional().default(true),
});

/**
 * Handles POST requests to `/api/publish` to publish a schedule.
 * Requires 'manager' role or higher.
 *
 * @param {NextRequest} req - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters.
 * @param {string} context.userId - The ID of the authenticated user.
 * @param {string} context.orgId - The ID of the user's organization.
 * @param {OrgRole[]} context.roles - The roles of the authenticated user.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("manager")(
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
          const parsed = await parseJson(req, PublishSchema);
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

          const FieldValue = adminSdk.firestore.FieldValue;
          const scheduleRef = adminDb.doc(`organizations/${orgId}/schedules/${scheduleId}`);
          await scheduleRef.set(
            { state: "published", publishedAt: FieldValue.serverTimestamp() },
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
            createdAt: FieldValue.serverTimestamp(),
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
