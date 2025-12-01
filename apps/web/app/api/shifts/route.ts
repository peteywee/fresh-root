// [P0][SHIFT][API] Shifts list endpoint
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

const CreateShiftSchema = z.object({
  scheduleId: z.string().optional(),
  positionId: z.string(),
  userId: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  breakMinutes: z.number().optional(),
  notes: z.string().optional(),
});

export const GET = createAuthenticatedEndpoint({
  org: "required",
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request, context }) => {
    try {
      const { searchParams } = new URL(request.url);
      const scheduleId = searchParams.get("scheduleId");
      const orgId = searchParams.get("orgId") || context.org!.orgId;
      if (!orgId) {
        return NextResponse.json({ error: "orgId query parameter is required" }, { status: 400 });
      }
      const shifts = [{
        id: "shift-1",
        scheduleId: scheduleId ?? "sched-1",
        positionId: "pos-1",
        userId: "user-123",
        startTime: "2025-01-15T09:00:00Z",
        endTime: "2025-01-15T17:00:00Z",
        status: "published",
        breakMinutes: 30,
        createdAt: new Date().toISOString(),
      }];
      return NextResponse.json({ shifts, orgId }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to fetch shifts" }, { status: 500 });
    }
  },
});

export const POST = createAuthenticatedEndpoint({
  org: "required",
  roles: ["manager"],
  input: CreateShiftSchema,
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request, input, context }) => {
    try {
      const { searchParams } = new URL(request.url);
      const scheduleIdFromQuery = searchParams.get("scheduleId");
      const userId = context.auth!.userId;
      const scheduleId = scheduleIdFromQuery || input.scheduleId;
      if (!scheduleId) {
        return NextResponse.json({ error: "scheduleId is required in query or body" }, { status: 400 });
      }
      const newShift = {
        id: `shift-${Date.now()}`,
        status: "draft" as const,
        createdAt: new Date().toISOString(),
        createdBy: userId,
        ...input,
      };
      return NextResponse.json(newShift, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ error: "Invalid shift data" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to create shift" }, { status: 500 });
    }
  },
});
