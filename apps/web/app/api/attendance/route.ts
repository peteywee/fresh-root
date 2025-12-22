// [P0][ATTENDANCE][API][D1] Attendance tracking endpoint with Firestore persistence

import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { CreateAttendanceRecordSchema } from "@fresh-schedules/types";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { badRequest, forbidden, serverError } from "../_shared/validation";

import { FLAGS } from "../../../src/lib/features";

/**
 * GET /api/attendance
 * List attendance records for an organization, shift, or schedule
 */
export const GET = createAuthenticatedEndpoint({
  org: "required",
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request, input: _input, context, params: _params }) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get("orgId") || context.org!.orgId;
      const shiftId = searchParams.get("shiftId");
      const scheduleId = searchParams.get("scheduleId");
      const staffUid = searchParams.get("staffUid");

      if (!orgId) {
        return badRequest("orgId query parameter is required");
      }

      // D1: Fetch from Firestore if FIRESTORE_WRITES enabled
      if (FLAGS.FIRESTORE_WRITES) {
        const db = getFirestore();
        let query = db.collection('attendance_records').doc(orgId).collection('records');

        // Apply filters
        if (shiftId) query = query.where('shiftId', '==', shiftId) as any;
        if (scheduleId) query = query.where('scheduleId', '==', scheduleId) as any;
        if (staffUid) query = query.where('staffUid', '==', staffUid) as any;

        const snapshot = await query.get();
        const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({ records, total: records.length }, { status: 200 });
      }

      // Fallback: Mock data when Firestore disabled
      const records = [
        {
          id: "att-1",
          orgId,
          shiftId: shiftId || "shift-1",
          scheduleId: scheduleId || "sched-1",
          staffUid: staffUid || context.auth!.userId,
          status: "checked_in",
          scheduledStart: Date.now() - 2 * 60 * 60 * 1000,
          scheduledEnd: Date.now() + 6 * 60 * 60 * 1000,
          actualCheckIn: Date.now() - 2 * 60 * 60 * 1000,
          checkInMethod: "qr_code",
          scheduledDuration: 480,
          breakDuration: 30,
          createdAt: Date.now() - 2 * 60 * 60 * 1000,
          updatedAt: Date.now(),
        },
      ];

      // Apply filters
      let filtered = records;
      if (shiftId) filtered = filtered.filter((r) => r.shiftId === shiftId);
      if (scheduleId) filtered = filtered.filter((r) => r.scheduleId === scheduleId);
      if (staffUid) filtered = filtered.filter((r) => r.staffUid === staffUid);

      return NextResponse.json({ records: filtered, total: filtered.length }, { status: 200 });
    } catch {
      return serverError("Failed to fetch attendance records");
    }
  },
});

/**
 * POST /api/attendance
 * Create a new attendance record (requires scheduler+ role)
 */
export const POST = createAuthenticatedEndpoint({
  org: "required",
  roles: ["scheduler"],
  input: CreateAttendanceRecordSchema,
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const data = input as z.infer<typeof CreateAttendanceRecordSchema>;

      // Verify orgId matches context
      if (data.orgId !== context.org!.orgId) {
        return forbidden("Organization ID mismatch");
      }

      // Calculate scheduled duration in minutes (coerce to number to satisfy TS)
      const scheduledEnd = Number(data.scheduledEnd);
      const scheduledStart = Number(data.scheduledStart);
      const scheduledDuration = Math.floor((scheduledEnd - scheduledStart) / (60 * 1000));

      const recordId = `att-${Date.now()}`;
      const newRecord = {
        id: recordId,
        ...data,
        status: "scheduled" as const,
        scheduledDuration,
        breakDuration: data.breakDuration || 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // D1: Write to Firestore if enabled
      if (FLAGS.FIRESTORE_WRITES) {
        const db = getFirestore();
        await db
          .collection('attendance_records')
          .doc(data.orgId)
          .collection('records')
          .doc(recordId)
          .set(newRecord);
      }

      return NextResponse.json(newRecord, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return badRequest("Invalid attendance record data");
      }
      return serverError("Failed to create attendance record");
    }
  },
});
