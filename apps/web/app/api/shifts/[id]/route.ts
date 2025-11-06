//[P1][API][CODE] Shifts [id] API route handler
// Tags: P1, API, CODE, validation, zod

import { ShiftUpdateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { rateLimit, RateLimits } from "../../../../src/lib/api/rate-limit";
import { csrfProtection } from "../../../../src/lib/api/csrf";
import { requireOrgMembership, requireRole } from "../../../../src/lib/api/authorization";
import { sanitizeObject } from "../../../../src/lib/api/sanitize";
import { serverError } from "../../_shared/validation";

/**
 * GET /api/shifts/[id]
 * Get shift details
 */
export const GET = rateLimit(RateLimits.STANDARD)(
  requireOrgMembership(async (request: NextRequest, context) => {
    const { params } = context;
    try {
      const { id } = await params;

      // In production, fetch from Firestore and check permissions
      const shift = {
        id,
        scheduleId: "sched-1",
        positionId: "pos-1",
        userId: "user-123",
        startTime: "2025-01-15T09:00:00Z",
        endTime: "2025-01-15T17:00:00Z",
        status: "published",
        breakMinutes: 30,
        notes: "Morning shift",
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json(shift);
    } catch {
      return serverError("Failed to fetch shift");
    }
  }),
);

/**
 * PATCH /api/shifts/[id]
 * Update shift details (manager+ can modify any shift, staff can modify their own)
 */
export const PATCH = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    requireOrgMembership(
      requireRole("manager")(async (request: NextRequest, context) => {
        const { params } = context;
        try {
          const { id } = await params;

          const body = await request.json();
          const validated = ShiftUpdateSchema.parse(body);
          const sanitized = sanitizeObject(validated);

          // In production:
          // 1. Check for overlapping shifts if times change
          // 2. Validate user can modify this shift (manager+ or own shift)
          // 3. Update in Firestore

          const updatedShift = {
            id,
            scheduleId: "sched-1",
            positionId: "pos-1",
            ...sanitized,
            updatedAt: new Date().toISOString(),
            updatedBy: context.userId,
          };

          return NextResponse.json(updatedShift);
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json({ error: "Invalid shift data" }, { status: 400 });
          }
          return serverError("Failed to update shift");
        }
      }),
    ),
  ),
);

/**
 * DELETE /api/shifts/[id]
 * Delete a shift (manager+ only)
 */
export const DELETE = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    requireOrgMembership(
      requireRole("manager")(async (request: NextRequest, context) => {
        const { params } = context;
        try {
          const { id } = await params;

          // In production, check permissions and delete from Firestore
          return NextResponse.json({
            message: "Shift deleted successfully",
            id,
          });
        } catch {
          return serverError("Failed to delete shift");
        }
      }),
    ),
  ),
);
