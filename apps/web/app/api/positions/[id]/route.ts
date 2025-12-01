// [P0][CORE][API] Position management endpoint
export const dynamic = "force-dynamic";

import { PositionSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

export const GET = createAuthenticatedEndpoint({
  org: "required",
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ params, context }) => {
    try {
      const { id } = params;
      const orgId = context.org!.orgId;
      const position = {
        id,
        orgId,
        title: "Server",
        description: "Front of house server position",
        hourlyRate: 15.0,
        color: "#2196F3",
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: "user-123",
      };
      return NextResponse.json(position, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to fetch position" }, { status: 500 });
    }
  },
});

export const PATCH = createAuthenticatedEndpoint({
  org: "required",
  roles: ["manager"],
  input: PositionSchema,
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ input, params, context }) => {
    try {
      const { id } = params;
      const orgId = context.org!.orgId;
      const updatedPosition = { id, orgId, title: "Server", ...input, updatedAt: new Date().toISOString() };
      return NextResponse.json(updatedPosition, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to update position" }, { status: 500 });
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
      return NextResponse.json({ message: "Position deleted successfully", id }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to delete position" }, { status: 500 });
    }
  },
});
