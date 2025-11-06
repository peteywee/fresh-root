//[P1][API][CODE] Schedules [id] API route handler
// Tags: P1, API, CODE, validation, zod

import { ScheduleUpdateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { withValidation } from "../../../../src/lib/api/validation";
import { requireSession, AuthenticatedRequest } from "../../_shared/middleware";
import { serverError } from "../../_shared/validation";

/**
 * GET /api/schedules/[id]
 * Get schedule details
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return requireSession(request as AuthenticatedRequest, async (_authReq) => {
    try {
      const { id } = await params;

      // In production, fetch from Firestore and check permissions
      const schedule = {
        id,
        orgId: "org-1",
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
  });
}

/**
 * PATCH /api/schedules/[id]
 * Update schedule details
 */
async function patchHandler(
  request: NextRequest,
  data: z.infer<typeof ScheduleUpdateSchema>,
  params: { id: string },
) {
  return requireSession(request as AuthenticatedRequest, async (_authReq) => {
    try {
      const { id } = params;

      // In production, update in Firestore after checking permissions
      const updatedSchedule = {
        id,
        orgId: "org-1",
        name: "Week of Jan 15",
        ...data,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json(updatedSchedule);
    } catch {
      return serverError("Failed to update schedule");
    }
  });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const validated = withValidation(ScheduleUpdateSchema, (req, data) =>
    patchHandler(req, data, params),
  );
  return validated(request);
}

/**
 * DELETE /api/schedules/[id]
 * Delete a schedule (only drafts can be deleted)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return requireSession(request as AuthenticatedRequest, async (_authReq) => {
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
  });
}
