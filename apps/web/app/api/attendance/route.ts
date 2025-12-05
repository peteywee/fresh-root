// [P0][ATTENDANCE][API] Attendance tracking endpoint

import { CreateAttendanceRecordSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

/**
 * GET /api/attendance
 * List attendance records for an organization, shift, or schedule
 */
export const GET = createAuthenticatedEndpoint({
  org: "required",
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request, context }) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get("orgId") || context.org!.orgId;
      const shiftId = searchParams.get("shiftId");
      const scheduleId = searchParams.get("scheduleId");
      const staffUid = searchParams.get("staffUid");

      if (!orgId) {
        return NextResponse.json({ error: "orgId query parameter is required" }, { status: 400 });
      }

      // Mock data - in production, fetch from Firestore
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
          scheduledDuration: 480, // 8 hours in minutes
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
      return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 });
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
  handler: async ({ input, context }) => {
    try {
      const data = input;

      // Verify orgId matches context
      if (data.orgId !== context.org!.orgId) {
        return NextResponse.json({ error: "Organization ID mismatch" }, { status: 403 });
      }

      // Calculate scheduled duration in minutes
      const scheduledDuration = Math.floor((data.scheduledEnd - data.scheduledStart) / (60 * 1000));

      // In production, create in Firestore
      const newRecord = {
        id: `att-${Date.now()}`,
        ...data,
        status: "scheduled" as const,
        scheduledDuration,
        breakDuration: data.breakDuration || 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      return NextResponse.json(newRecord, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ error: "Invalid attendance record data" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to create attendance record" }, { status: 500 });
    }
  },
});
