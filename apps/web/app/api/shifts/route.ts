//[P1][API][CODE] Shifts API route handler
// Tags: P1, API, CODE, validation, zod

import { ShiftCreateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { rateLimit, RateLimits } from "../../../src/lib/api/rate-limit";
import { csrfProtection } from "../../../src/lib/api/csrf";
import { requireOrgMembership } from "../../../src/lib/api/authorization";
import { sanitizeObject } from "../../../src/lib/api/sanitize";
import { serverError } from "../_shared/validation";

/**
 * GET /api/shifts
 * List shifts for a schedule
 */
export const GET = rateLimit(RateLimits.STANDARD)(
  requireOrgMembership(async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      const scheduleId = searchParams.get("scheduleId");

      if (!scheduleId) {
        return NextResponse.json(
          { error: "scheduleId query parameter is required" },
          { status: 400 },
        );
      }

      // In production, fetch from Firestore filtered by scheduleId
      const shifts = [
        {
          id: "shift-1",
          scheduleId,
          positionId: "pos-1",
          userId: "user-123",
          startTime: "2025-01-15T09:00:00Z",
          endTime: "2025-01-15T17:00:00Z",
          status: "published",
          breakMinutes: 30,
          notes: "Morning shift",
          createdAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({ shifts });
    } catch {
      return serverError("Failed to fetch shifts");
    }
  }),
);

/**
 * POST /api/shifts
 * Create a new shift
 */
export const POST = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    requireOrgMembership(async (request: NextRequest, context) => {
      try {
        const { searchParams } = new URL(request.url);
        const scheduleId = searchParams.get("scheduleId");

        if (!scheduleId) {
          return NextResponse.json(
            { error: "scheduleId query parameter is required" },
            { status: 400 },
          );
        }

        const body = await request.json();
        const validated = ShiftCreateSchema.parse(body);
        const sanitized = sanitizeObject(validated);

        // In production:
        // 1. Check for overlapping shifts for the same user
        // 2. Validate position belongs to same org as schedule
        // 3. Create shift in Firestore

        const newShift = {
          id: `shift-${Date.now()}`,
          scheduleId,
          ...sanitized,
          status: "draft" as const,
          createdAt: new Date().toISOString(),
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
);

