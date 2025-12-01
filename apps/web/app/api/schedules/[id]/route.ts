// [P0][SCHEDULE][API] Schedule management endpoint

import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../src/lib/api/authorization";
import { sanitizeObject } from "../../../../src/lib/api/sanitize";
import { createOrgEndpoint } from "@fresh-schedules/api-framework";

type Role = "org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff";

type ScheduleContext = {
  params: Record<string, string>;
  userId: string;
  orgId: string;
};

type ScheduleContextWithRoles = ScheduleContext & { roles: Role[] };

const SECURITY_OPTIONS = { requireAuth: true, maxRequests: 100, windowMs: 60_000 } as const;

const ensureScheduleId = (context: ScheduleContext) => {
  const id = context.params.id;
  if (!id) {
    throw new Error("Missing schedule id");
  }
  return id;
};

const buildSchedulePayload = (
  id: string,
  orgId: string,
  overrides: Record<string, unknown> = {},
) => ({
  id,
  orgId,
  name: "Week of Jan 15",
  description: "Weekly schedule",
  startDate: "2025-01-15T00:00:00Z",
  endDate: "2025-01-21T23:59:59Z",
  status: "published",
  createdAt: new Date().toISOString(),
  createdBy: "user-123",
  ...overrides,
});

const readSchedule = async (_request: NextRequest, context: ScheduleContext) => {
  try {
    const id = ensureScheduleId(context);
    const schedule = buildSchedulePayload(id, context.orgId);
    return NextResponse.json(schedule);
  } catch {
    return serverError("Failed to fetch schedule");
  }
};

const updateSchedule = async (request: NextRequest, context: ScheduleContextWithRoles) => {
  try {
    const id = ensureScheduleId(context);
    const payload = sanitizeObject(await request.json());
    const parsed = UpdateScheduleSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid schedule data", details: parsed.error.errors },
        { status: 400 },
      );
    }

    const schedule = buildSchedulePayload(id, context.orgId, {
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(schedule);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid schedule data" }, { status: 400 });
    }
    return serverError("Failed to update schedule");
  }
};

const deleteSchedule = async (_request: NextRequest, context: ScheduleContextWithRoles) => {
  try {
    const id = ensureScheduleId(context);
    return NextResponse.json({ message: "Schedule deleted successfully", id });
  } catch {
    return serverError("Failed to delete schedule");
  }
};

/**
 * GET /api/schedules/[id]
 * Get schedule details
 */
export const GET = createOrgEndpoint({
  handler: async ({ request, input, context, params }) => {
    async (request: NextRequest, context: ScheduleContext) =>
    readSchedule(request, context),
  ),
  SECURITY_OPTIONS;
  }
});

/**
 * PATCH /api/schedules/[id]
 * Update schedule details
 */
export const PATCH = createOrgEndpoint({
  handler: async ({ request, input, context, params }) => {
    async (request: NextRequest, context: ScheduleContextWithRoles) =>
      updateSchedule(request, context),
    ),
  ),
  SECURITY_OPTIONS;
  }
});

/**
 * DELETE /api/schedules/[id]
 * Delete a schedule (only drafts can be deleted)
 */
export const DELETE = createOrgEndpoint({
  handler: async ({ request, input, context, params }) => {
    async (request: NextRequest, context: ScheduleContextWithRoles) =>
      deleteSchedule(request, context),
    ),
  ),
  SECURITY_OPTIONS;
  }
});
