// [P1][API][ATTENDANCE] Attendance records API route handler
// Tags: P1, API, ATTENDANCE, validation, zod

import { CreateAttendanceRecordSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { withSecurity } from "../_shared/middleware";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

// Rate limiting is handled via withSecurity options

/**
 * Handles GET requests to `/api/attendance` to list attendance records.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters.
 * @param {string} context.userId - The ID of the authenticated user.
 * @param {string} context.orgId - The ID of the user's organization.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const GET = withSecurity(
  requireOrgMembership(
    async (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string; orgId: string },
    ) => {
      try {
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get("orgId") || context.orgId;
        const shiftId = searchParams.get("shiftId");
        const scheduleId = searchParams.get("scheduleId");
        const staffUid = searchParams.get("staffUid");

        if (!orgId) {
          return badRequest("orgId query parameter is required");
        }

        // Mock data - in production, fetch from Firestore
        const records = [
          {
            id: "att-1",
            orgId,
            shiftId: shiftId || "shift-1",
            scheduleId: scheduleId || "sched-1",
            staffUid: staffUid || context.userId,
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

        return ok({ records: filtered, total: filtered.length });
      } catch {
        return serverError("Failed to fetch attendance records");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * Handles POST requests to `/api/attendance` to create a new attendance record.
 * Requires a 'scheduler' role or higher.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters.
 * @param {string} context.userId - The ID of the authenticated user.
 * @param {string} context.orgId - The ID of the user's organization.
 * @param {OrgRole[]} context.roles - The roles of the authenticated user.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("scheduler")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const parsed = await parseJson(request, CreateAttendanceRecordSchema);
          if (!parsed.success) {
            return badRequest("Validation failed", parsed.details);
          }

          const data: any = parsed.data;

          // Verify orgId matches context
          if (data.orgId !== context.orgId) {
            return badRequest("Organization ID mismatch", null, "FORBIDDEN");
          }

          // Calculate scheduled duration in minutes
          const scheduledDuration = Math.floor(
            (data.scheduledEnd - data.scheduledStart) / (60 * 1000),
          );

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
            return badRequest("Invalid attendance record data");
          }
          return serverError("Failed to create attendance record");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);
