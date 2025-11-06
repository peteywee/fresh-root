//[P1][API][CODE] Shifts API route handler
// Tags: P1, API, CODE, validation, zod

import { ShiftCreateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api/authorization";
import { csrfProtection } from "../../../src/lib/api/csrf";
import { rateLimit, RateLimits } from "../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../src/lib/api/sanitize";
import { serverError } from "../_shared/validation";

/**
 * GET /api/shifts
 * List shifts (filter by scheduleId if provided)
 */
export const GET = rateLimit(RateLimits.STANDARD)(
  requireOrgMembership(async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      const scheduleId = searchParams.get("scheduleId");
      const orgId = searchParams.get("orgId") || context.orgId;

      if (!orgId) {
        return NextResponse.json({ error: "orgId query parameter is required" }, { status: 400 });
      }

      const shifts = [
        {
          id: "shift-1",
          scheduleId: scheduleId ?? "sched-1",
          positionId: "pos-1",
          userId: "user-123",
          startTime: "2025-01-15T09:00:00Z",
          endTime: "2025-01-15T17:00:00Z",
          status: "published",
          breakMinutes: 30,
          createdAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({ shifts, orgId });
    } catch {
      return serverError("Failed to fetch shifts");
    }
  }),
);

/**
 * POST /api/shifts
 * Create a new shift (requires scheduler+ role)
 */
export const POST = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    requireOrgMembership(
      requireRole("scheduler")(async (request: NextRequest, context) => {
        try {
          const { searchParams } = new URL(request.url);
          const scheduleIdFromQuery = searchParams.get("scheduleId");
          const body = await request.json();

          const validated = ShiftCreateSchema.parse(body);
          const sanitized = sanitizeObject(validated);

          const scheduleId = scheduleIdFromQuery || (body?.scheduleId as string | undefined);
          if (!scheduleId) {
            return NextResponse.json(
              { error: "scheduleId is required in query or body" },
              { status: 400 },
            );
          }

          const newShift = {
            id: `shift-${Date.now()}`,
            orgId: context.orgId,
            scheduleId,
            status: "draft" as const,
            createdAt: new Date().toISOString(),
            createdBy: context.userId,
            ...sanitized,
          };

          return NextResponse.json(newShift, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json({ error: "Invalid shift data" }, { status: 400 });
          }
          return serverError("Failed to create shift");
        }
      }),
    ),
  ),
);
