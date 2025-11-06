//[P1][API][CODE] Schedules API route handler
// Tags: P1, API, CODE, validation, zod

import { ScheduleCreateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership } from "../../../src/lib/api/authorization";
import { csrfProtection } from "../../../src/lib/api/csrf";
import { rateLimit, RateLimits } from "../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../src/lib/api/sanitize";
import { serverError } from "../_shared/validation";

/**
 * GET /api/schedules
 * List schedules in an organization
 */
export const GET = rateLimit(RateLimits.STANDARD)(
  requireOrgMembership(async (request: NextRequest, context) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get("orgId") || context.orgId;

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
  }),
);

/**
 * POST /api/schedules
 * Create a new schedule
 */
export const POST = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    requireOrgMembership(async (request: NextRequest, context) => {
      try {
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get("orgId") || context.orgId;

        if (!orgId) {
          return NextResponse.json({ error: "orgId query parameter is required" }, { status: 400 });
        }

        const body = await request.json();
        const validated = ScheduleCreateSchema.parse(body);

        // Sanitize input
        const sanitized = sanitizeObject(validated);

        // In production, create schedule in Firestore
        const newSchedule = {
          id: `sched-${Date.now()}`,
          orgId,
          ...sanitized,
          status: "draft" as const,
          createdAt: new Date().toISOString(),
          createdBy: context.userId,
        };

        return NextResponse.json(newSchedule, { status: 201 });
      } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
          return NextResponse.json({ error: "Invalid schedule data" }, { status: 400 });
        }
        return serverError("Failed to create schedule");
      }
    }),
  ),
);
