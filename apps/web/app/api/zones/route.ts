// [P0][CORE][API] Zones list endpoint
import { CreateZoneSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

export const GET = createAuthenticatedEndpoint({
  org: "required",
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request, context }) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get("orgId") || context.org!.orgId;
      const venueId = searchParams.get("venueId");
      const userId = context.auth!.userId;
      if (!orgId) {
        return NextResponse.json({ error: "orgId query parameter is required" }, { status: 400 });
      }
      const zones = [{
        id: "zone-1",
        orgId,
        venueId: venueId || "venue-1",
        name: "Main Stage",
        description: "Primary performance area",
        type: "production",
        capacity: 200,
        floor: "1",
        isActive: true,
        color: "#10B981",
        createdBy: userId,
        createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
      }];
      const filtered = venueId ? zones.filter((z) => z.venueId === venueId) : zones;
      return NextResponse.json({ zones: filtered, total: filtered.length }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to fetch zones" }, { status: 500 });
    }
  },
});

export const POST = createAuthenticatedEndpoint({
  org: "required",
  roles: ["manager"],
  input: CreateZoneSchema,
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ input, context }) => {
    try {
      const data = input;
      const orgId = context.org!.orgId;
      const userId = context.auth!.userId;
      if (data.orgId !== orgId) {
        return NextResponse.json({ error: "Organization ID mismatch" }, { status: 403 });
      }
      const newZone = {
        id: `zone-${Date.now()}`,
        ...data,
        isActive: true,
        type: data.type || "other",
        createdBy: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return NextResponse.json(newZone, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ error: "Invalid zone data" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to create zone" }, { status: 500 });
    }
  },
});
