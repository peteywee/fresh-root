//[P1][API][CODE] Schedules [id] API route handler
// Tags: P1, API, CODE, validation, zod

import { ScheduleUpdateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../src/lib/api/authorization";
import { csrfProtection } from "../../../../src/lib/api/csrf";
import { rateLimit, RateLimits } from "../../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../../src/lib/api/sanitize";
import { serverError } from "../../_shared/validation";

/**
 * GET /api/schedules/[id]
 * Get schedule details
 */
export const GET = rateLimit(RateLimits.STANDARD)(
  requireOrgMembership(
    async (request: NextRequest, context, { params }: { params: Promise<{ id: string }> }) => {
      try {
        const { id } = await params;

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
);

/**
 * PATCH /api/schedules/[id]
 * Update schedule details
 */
export const PATCH = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    requireOrgMembership(
      requireRole("manager")(
        async (request: NextRequest, context, { params }: { params: Promise<{ id: string }> }) => {
          try {
            const { id } = await params;

            const body = await request.json();
            const validated = ScheduleUpdateSchema.parse(body);
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
  ),
);

/**
 * DELETE /api/schedules/[id]
 * Delete a schedule (only drafts can be deleted)
 */
export const DELETE = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    requireOrgMembership(
      requireRole("admin")(
        async (request: NextRequest, context, { params }: { params: Promise<{ id: string }> }) => {
          try {
            const { id } = await params;

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
  ),
);
