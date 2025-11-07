//[P1][API][CODE] Schedules [id] API route handler
// Tags: P1, API, CODE, validation, zod

import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../src/lib/api/authorization";
import { sanitizeObject } from "../../../../src/lib/api/sanitize";
import { withSecurity } from "../../_shared/middleware";
import { serverError, UpdateScheduleSchema } from "../../_shared/validation";

/**
 * GET /api/schedules/[id]
 * Get schedule details
 */
export const GET = withSecurity(
  requireOrgMembership(
    async (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string; orgId: string },
    ) => {
      try {
        const { id } = context.params;

        // In production, fetch from Firestore and check permissions
        const schedule = {
          id,
          orgId: context.orgId,
          name: "Week of Jan 15",
          description: "Weekly schedule",
          startDate: "2025-01-15T00:00:00Z",
          endDate: "2025-01-21T23:59:59Z",
          status: "published",
          createdAt: new Date().toISOString(),
          createdBy: "user-123",
        };

        return NextResponse.json(schedule);
      } catch {
        return serverError("Failed to fetch schedule");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * PATCH /api/schedules/[id]
 * Update schedule details
 */
export const PATCH = withSecurity(
  requireOrgMembership(
    requireRole("manager")(
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
          const { id } = context.params;

          const body = await request.json();
          const validated = UpdateScheduleSchema.parse(body);
          const sanitized = sanitizeObject(validated);

          // In production, update in Firestore after checking permissions
          const updatedSchedule = {
            id,
            orgId: context.orgId,
            name: "Week of Jan 15",
            ...sanitized,
            updatedAt: new Date().toISOString(),
          };

          return NextResponse.json(updatedSchedule);
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json({ error: "Invalid schedule data" }, { status: 400 });
          }
          return serverError("Failed to update schedule");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * DELETE /api/schedules/[id]
 * Delete a schedule (only drafts can be deleted)
 */
export const DELETE = withSecurity(
  requireOrgMembership(
    requireRole("admin")(
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
          const { id } = context.params;

          // In production, check if schedule is draft before deleting
          return NextResponse.json({
            message: "Schedule deleted successfully",
            id,
          });
        } catch {
          return serverError("Failed to delete schedule");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);
