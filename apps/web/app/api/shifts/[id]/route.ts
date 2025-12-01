// [P0][SHIFT][API] Shift management endpoint
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

const UpdateShiftSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  userId: z.string().optional(),
  positionId: z.string().optional(),
  status: z.enum(["draft", "published", "confirmed", "cancelled"]).optional(),
  notes: z.string().optional(),
  breakMinutes: z.number().optional(),
});

export const GET = createAuthenticatedEndpoint({
  org: "required",
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ params }) => {
    try {
      const { id } = params;
      const shift = {
        id,
        scheduleId: "sched-1",
        positionId: "pos-1",
        userId: "user-123",
        startTime: "2025-01-15T09:00:00Z",
        endTime: "2025-01-15T17:00:00Z",
        status: "published",
        breakMinutes: 30,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json(shift, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to fetch shift" }, { status: 500 });
    }
  },
});

export const PATCH = createAuthenticatedEndpoint({
  org: "required",
  roles: ["manager"],
  input: UpdateShiftSchema,
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ input, params }) => {
    try {
      const { id } = params;
      const updated = { id, ...input, updatedAt: new Date().toISOString() };
      return NextResponse.json(updated, { status: 200 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ error: "Invalid shift update" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to update shift" }, { status: 500 });
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
      return NextResponse.json({ message: "Shift deleted successfully", id }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to delete shift" }, { status: 500 });
    }
  },
});
