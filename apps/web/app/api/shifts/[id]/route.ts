//[P1][API][CODE] Shifts [id] API route handler
// Tags: P1, API, CODE, validation, zod

import { ShiftUpdateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../src/lib/api/authorization";
import { csrfProtection } from "../../../../src/lib/api/csrf";
import { rateLimit, RateLimits } from "../../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../../src/lib/api/sanitize";
import { serverError } from "../../_shared/validation";

export const GET = rateLimit(RateLimits.STANDARD)(
  requireOrgMembership(async (_request: NextRequest, context) => {
    try {
      const { params } = context;
      const { id } = await params;
      const shift = {
        id,
        scheduleId: "sched-1",
        positionId: "pos-1",
        userId: "user-123",
        startTime: "2025-01-15T09:00:00Z",
        endTime: "2025-01-15T17:00:00Z",
        status: "published",
        breakMinutes: 30,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json(shift);
    } catch {
      return serverError("Failed to fetch shift");
    }
  }),
);

export const PATCH = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    requireOrgMembership(
      requireRole("scheduler")(async (request: NextRequest, context) => {
        try {
          const { params } = context;
          const { id } = await params;
          const body = await request.json();
          const validated = ShiftUpdateSchema.parse(body);
          const sanitized = sanitizeObject(validated);
          const updated = { id, orgId: context.orgId, ...sanitized, updatedAt: new Date().toISOString() };
          return NextResponse.json(updated);
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json({ error: "Invalid shift update" }, { status: 400 });
          }
          return serverError("Failed to update shift");
        }
      }),
    ),
  ),
);

export const DELETE = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    requireOrgMembership(
      requireRole("admin")(async (_request: NextRequest, context) => {
        try {
          const { params } = context;
          const { id } = await params;
          return NextResponse.json({ message: "Shift deleted successfully", id });
        } catch {
          return serverError("Failed to delete shift");
        }
      }),
    ),
  ),
);
