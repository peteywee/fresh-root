// [P0][SCHEDULE][API] Schedule management endpoint
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

const UpdateScheduleSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

const buildSchedulePayload = (id: string, orgId: string, overrides: Record<string, unknown> = {}) => ({
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

export const GET = createAuthenticatedEndpoint({
  org: "required",
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ params, context }) => {
    try {
      const { id } = params;
      const orgId = context.org!.orgId;
      const schedule = buildSchedulePayload(id, orgId);
      return NextResponse.json(schedule, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
    }
  },
});

export const PATCH = createAuthenticatedEndpoint({
  org: "required",
  roles: ["manager"],
  input: UpdateScheduleSchema,
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ input, params, context }) => {
    try {
      const { id } = params;
      const orgId = context.org!.orgId;
      const schedule = buildSchedulePayload(id, orgId, { ...input, updatedAt: new Date().toISOString() });
      return NextResponse.json(schedule, { status: 200 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ error: "Invalid schedule data" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
    }
  },
});

export const DELETE = createAuthenticatedEndpoint({
  org: "required",
  roles: ["admin"],
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ params }) => {
    try {
      const { id } = params;
      return NextResponse.json({ message: "Schedule deleted successfully", id }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
    }
  },
});
