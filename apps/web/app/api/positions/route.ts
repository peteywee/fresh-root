// [P0][CORE][API] Positions list endpoint
export const dynamic = "force-dynamic";

import { CreatePositionSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

export const GET = createAuthenticatedEndpoint({
  org: "required",
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request, context }) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get("orgId") || context.org!.orgId;
      const userId = context.auth!.userId;
      if (!orgId) {
        return NextResponse.json({ error: "orgId query parameter is required" }, { status: 400 });
      }
      const positions = [{
        id: "pos-1",
        orgId,
        name: "Event Manager",
        description: "Manages event operations",
        type: "full_time",
        skillLevel: "advanced",
        hourlyRate: 35,
        color: "#3B82F6",
        isActive: true,
        requiredCertifications: [],
        createdBy: userId,
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
      }];
      return NextResponse.json({ positions, total: positions.length }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 });
    }
  },
});

export const POST = createAuthenticatedEndpoint({
  org: "required",
  roles: ["manager"],
  input: CreatePositionSchema,
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ input, context }) => {
    try {
      const data = input;
      const orgId = context.org!.orgId;
      const userId = context.auth!.userId;
      if (data.orgId !== orgId) {
        return NextResponse.json({ error: "Organization ID mismatch" }, { status: 403 });
      }
      const newPosition = {
        id: `pos-${Date.now()}`,
        ...data,
        isActive: true,
        requiredCertifications: data.requiredCertifications || [],
        createdBy: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return NextResponse.json(newPosition, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ error: "Invalid position data" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to create position" }, { status: 500 });
    }
  },
});
