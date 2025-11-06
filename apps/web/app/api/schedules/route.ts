//[P1][API][CODE] Schedules API route handler
// Tags: P1, API, CODE, validation, zod

import { ScheduleCreateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";

import { withValidation } from "../../../src/lib/api/validation";
import { requireSession, AuthenticatedRequest } from "../_shared/middleware";
import { serverError } from "../_shared/validation";

/**
 * GET /api/schedules
 * List schedules in an organization
 */
export async function GET(request: NextRequest) {
  return requireSession(request as AuthenticatedRequest, async (_authReq) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get("orgId");

      if (!orgId) {
        return NextResponse.json({ error: "orgId query parameter is required" }, { status: 400 });
      }

      // In production, fetch from Firestore filtered by orgId
      const schedules = [
        {
          id: "sched-1",
          orgId,
          name: "Week of Jan 15",
          description: "Weekly schedule",
          startDate: "2025-01-15T00:00:00Z",
          endDate: "2025-01-21T23:59:59Z",
          status: "published",
          createdAt: new Date().toISOString(),
          createdBy: "user-123",
        },
      ];

      return NextResponse.json({ schedules });
    } catch {
      return serverError("Failed to fetch schedules");
    }
  });
}

/**
 * POST /api/schedules
 * Create a new schedule
 */
export const POST = withValidation(
  ScheduleCreateSchema,
  async (request: NextRequest, data: z.infer<typeof ScheduleCreateSchema>) => {
    return requireSession(request as AuthenticatedRequest, async (authReq) => {
      try {
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get("orgId");

        if (!orgId) {
          return NextResponse.json({ error: "orgId query parameter is required" }, { status: 400 });
        }

        // In production, create schedule in Firestore
        const newSchedule = {
          id: `sched-${Date.now()}`,
          orgId,
          ...data,
          status: "draft" as const,
          createdAt: new Date().toISOString(),
          createdBy: authReq.user?.uid,
        };

        return NextResponse.json(newSchedule, { status: 201 });
      } catch {
        return serverError("Failed to create schedule");
      }
    });
  },
);
