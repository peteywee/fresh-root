// [P0][SHIFTS][API] Shifts list endpoint
export const dynamic = "force-dynamic";

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateShiftSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { badRequest, ok, serverError } from "../_shared/validation";

/**
 * GET /api/shifts
 * List shifts for an organization
 */
export const GET = createOrgEndpoint({
  handler: async ({ request, context }) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get("orgId") || context.org?.orgId;

      if (!orgId) {
        return badRequest("orgId query parameter is required");
      }

      // Mock data - in production, fetch from Firestore
      const shifts = [
        {
          id: "shift-1",
          orgId,
          name: "Morning Shift",
          startTime: 8 * 60,
          endTime: 16 * 60,
          isActive: true,
        },
      ];

      return ok({ shifts, total: shifts.length });
    } catch {
      return serverError("Failed to fetch shifts");
    }
  },
});

/**
 * POST /api/shifts
 * Create new shift
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  input: CreateShiftSchema,
  handler: async ({ input, context }) => {
    try {
      const validated = input as Record<string, unknown>;

      const shift = {
        id: `shift-${Date.now()}`,
        orgId: context.org?.orgId,
        ...(validated || {}),
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
      };

      return NextResponse.json(shift, { status: 201 });
    } catch {
      return serverError("Failed to create shift");
    }
  },
});
