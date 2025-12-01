// [P0][SCHEDULE][API] Schedules list endpoint
import { CreateScheduleSchema } from "@fresh-schedules/types";
import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

import { adminDb } from "@/src/lib/firebase.server";

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export const GET = createAuthenticatedEndpoint({
  org: "required",
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request, context }) => {
    const { searchParams } = new URL(request.url);
    const limit = parsePositiveInt(searchParams.get("limit"), 20);
    const offset = parsePositiveInt(searchParams.get("offset"), 0);
    const orgId = context.org!.orgId;

    if (!adminDb) {
      return NextResponse.json({ error: "Admin DB not initialized" }, { status: 500 });
    }

    try {
      const snapshot = await adminDb
        .collection(`organizations/${orgId}/schedules`)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .offset(offset)
        .get();

      const schedules = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      return NextResponse.json({ data: schedules, limit, offset }, { status: 200 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
});

export const POST = createAuthenticatedEndpoint({
  org: "required",
  roles: ["manager"],
  input: CreateScheduleSchema,
  rateLimit: { maxRequests: 50, windowMs: 60_000 },
  handler: async ({ input, context }) => {
    const orgId = context.org!.orgId;
    const userId = context.auth!.userId;

    if (!adminDb) {
      return NextResponse.json({ error: "Admin DB not initialized" }, { status: 500 });
    }

    try {
      const { name, startDate, endDate } = input;
      const scheduleRef = adminDb.collection(`organizations/${orgId}/schedules`).doc();
      const now = Timestamp.now();

      const schedule = {
        id: scheduleRef.id,
        name,
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        state: "draft",
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      };

      await scheduleRef.set(schedule);

      return NextResponse.json({ success: true, schedule }, { status: 201 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
});
