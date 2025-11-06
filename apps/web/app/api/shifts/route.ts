//[P1][API][CODE] Shifts API route handler
// Tags: P1, API, CODE, validation, zod

import { ShiftCreateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { withValidation } from "../../../src/lib/api/validation";
import { requireSession, AuthenticatedRequest } from "../_shared/middleware";
import { serverError } from "../_shared/validation";

/**
 * GET /api/shifts
 * List shifts for a schedule
 */
export async function GET(request: NextRequest) {
  return requireSession(request as AuthenticatedRequest, async (_authReq) => {
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
  });
}

/**
 * POST /api/shifts
 * Create a new shift
 */
export const POST = withValidation(
  ShiftCreateSchema,
  async (request: NextRequest, data: z.infer<typeof ShiftCreateSchema>) => {
    return requireSession(request as AuthenticatedRequest, async (_authReq) => {
      try {
        const { searchParams } = new URL(request.url);
        const scheduleId = searchParams.get("scheduleId");

        if (!scheduleId) {
          return NextResponse.json(
            { error: "scheduleId query parameter is required" },
            { status: 400 },
          );
        }

        // In production:
        // 1. Check for overlapping shifts for the same user
        // 2. Validate position belongs to same org as schedule
        // 3. Create shift in Firestore

        const newShift = {
          id: `shift-${Date.now()}`,
          scheduleId,
          ...data,
          status: "draft" as const,
          createdAt: new Date().toISOString(),
        };

        return NextResponse.json(newShift, { status: 201 });
      } catch {
        return serverError("Failed to create shift");
      }
    });
  },
);
