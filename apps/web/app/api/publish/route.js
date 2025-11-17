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
 * POST /api/publish
 * Publish a schedule (requires manager+ role)
 */
export const POST = withSecurity(requireOrgMembership(requireRole("manager")(async (req, context) => {
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
        await scheduleRef.set({ state: "published", publishedAt: FieldValue.serverTimestamp() }, { merge: true });
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
    }
    catch (err) {
        const maybeMessage = err && typeof err === "object" && "message" in err
            ? err["message"]
            : undefined;
        const msg = typeof maybeMessage === "string" ? maybeMessage : String(err);
        return serverError(msg || "Unexpected error");
    }
})), { requireAuth: true, maxRequests: 50, windowMs: 60_000 });
