// [P1][API][SCHEDULES] Schedules API route handler
// Tags: P1, API, SCHEDULES, validation, zod

import { CreateScheduleSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { withSecurity } from "../_shared/middleware";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

// Rate limiting is handled via withSecurity options

/**
 * GET /api/schedules
 * List schedules for an organization
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
        const status = searchParams.get("status");

        if (!orgId) {
          return badRequest("orgId query parameter is required");
        }

        // Mock data - in production, fetch from Firestore
        const schedules = [
          {
            id: "sched-1",
            orgId,
            name: "January 2025 Schedule",
            description: "Monthly event schedule",
            startDate: new Date("2025-01-01").getTime(),
            endDate: new Date("2025-01-31").getTime(),
            status: "published",
            visibility: "team",
            stats: {
              totalShifts: 42,
              assignedShifts: 38,
              unassignedShifts: 4,
              totalHours: 336,
              totalCost: 11760,
              conflictCount: 0,
            },
            aiGenerated: false,
            createdBy: context.userId,
            createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          },
        ];

        const filtered = status ? schedules.filter((s) => s.status === status) : schedules;

        return ok({ schedules: filtered, total: filtered.length });
      } catch {
        return serverError("Failed to fetch schedules");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * POST /api/schedules
 * Create a new schedule (requires scheduler+ role)
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
          const parsed = await parseJson(request, CreateScheduleSchema);
          if (!parsed.success) {
            return badRequest("Validation failed", parsed.details);
          }

          const data: any = parsed.data;

          // Verify orgId matches context
          if (data.orgId !== context.orgId) {
            return badRequest("Organization ID mismatch", null, "FORBIDDEN");
          }

          // In production, create in Firestore
          const newSchedule = {
            id: `sched-${Date.now()}`,
            ...data,
            status: "draft" as const,
            visibility: data.visibility || "team",
            stats: {
              totalShifts: 0,
              assignedShifts: 0,
              unassignedShifts: 0,
              totalHours: 0,
              totalCost: 0,
              conflictCount: 0,
            },
            aiGenerated: false,
            createdBy: context.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          return NextResponse.json(newSchedule, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return badRequest("Invalid schedule data");
          }
          return serverError("Failed to create schedule");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);
