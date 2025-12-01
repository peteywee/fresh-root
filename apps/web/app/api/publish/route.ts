// [P0][CORE][API] Content publishing endpoint
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

import { adminDb, adminSdk } from "../../../src/lib/firebase.server";

const PublishSchema = z.object({
  scheduleId: z.string().min(1, "scheduleId is required"),
  orgId: z.string().min(1, "orgId is required"),
  publish: z.boolean().optional().default(true),
});

export const POST = createAuthenticatedEndpoint({
  org: "required",
  roles: ["manager"],
  input: PublishSchema,
  rateLimit: { maxRequests: 50, windowMs: 60_000 },
  handler: async ({ input, context }) => {
    try {
      const { scheduleId, orgId } = input;
      const contextOrgId = context.org!.orgId;
      if (orgId !== contextOrgId) {
        return NextResponse.json({ error: "Organization ID mismatch" }, { status: 403 });
      }
      if (!adminDb || !adminSdk) {
        return NextResponse.json({ error: "Admin DB not initialized" }, { status: 500 });
      }
      const scheduleRef = adminDb.doc(`organizations/${orgId}/schedules/${scheduleId}`);
      await scheduleRef.set({ state: "published", publishedAt: Timestamp.now() }, { merge: true });
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
      return NextResponse.json({ success: true, scheduleId, orgId }, { status: 200 });
    } catch (err: unknown) {
      const maybeMessage = err && typeof err === "object" && "message" in err ? (err as Record<string, unknown>)["message"] : undefined;
      const msg = typeof maybeMessage === "string" ? maybeMessage : String(err);
      return NextResponse.json({ error: msg || "Unexpected error" }, { status: 500 });
    }
  },
});
