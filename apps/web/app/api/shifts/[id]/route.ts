//[P1][API][CODE] Shifts [id] API route handler
// Tags: P1, API, CODE, validation, zod

import { ShiftUpdateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { withValidation } from "../../../../src/lib/api/validation";
import { requireSession, AuthenticatedRequest } from "../../_shared/middleware";
import { serverError } from "../../_shared/validation";

/**
 * GET /api/shifts/[id]
 * Get shift details
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireSession(request as AuthenticatedRequest, async (_authReq) => {
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
  });
}

/**
 * PATCH /api/shifts/[id]
 * Update shift details
 */
async function patchHandler(
  request: NextRequest,
  data: z.infer<typeof ShiftUpdateSchema>,
  params: { id: string },
) {
  return requireSession(request as AuthenticatedRequest, async (_authReq) => {
    try {
      const { id } = params;

      // In production:
      // 1. Check for overlapping shifts if times change
      // 2. Validate user can modify this shift
      // 3. Update in Firestore

      const updatedShift = {
        id,
        scheduleId: "sched-1",
        positionId: "pos-1",
        ...data,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json(updatedShift);
    } catch {
      return serverError("Failed to update shift");
    }
  });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const validated = withValidation(ShiftUpdateSchema, (req, data) =>
    patchHandler(req, data, params),
  );
  return validated(request);
}

/**
 * DELETE /api/shifts/[id]
 * Delete a shift
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return requireSession(request as AuthenticatedRequest, async (_authReq) => {
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
  });
}
