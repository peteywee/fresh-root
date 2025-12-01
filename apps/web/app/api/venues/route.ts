// [P0][CORE][API] Venues list endpoint
import { CreateVenueSchema } from "@fresh-schedules/types";
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
      const venues = [{
        id: "venue-1",
        orgId,
        name: "Main Convention Center",
        description: "Primary event venue",
        type: "indoor",
        address: { street: "123 Event Plaza", city: "San Francisco", state: "CA", zipCode: "94102", country: "US" },
        coordinates: { lat: 37.7749, lng: -122.4194 },
        capacity: 500,
        isActive: true,
        timezone: "America/Los_Angeles",
        contactPhone: "+1-555-0100",
        contactEmail: "venue@example.com",
        createdBy: userId,
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
      }];
      return NextResponse.json({ venues, total: venues.length }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 });
    }
  },
});

export const POST = createAuthenticatedEndpoint({
  org: "required",
  roles: ["manager"],
  input: CreateVenueSchema,
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ input, context }) => {
    try {
      const data = input;
      const orgId = context.org!.orgId;
      const userId = context.auth!.userId;
      if (data.orgId !== orgId) {
        return NextResponse.json({ error: "Organization ID mismatch" }, { status: 403 });
      }
      const newVenue = {
        id: `venue-${Date.now()}`,
        ...data,
        isActive: true,
        timezone: data.timezone || "America/New_York",
        createdBy: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return NextResponse.json(newVenue, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ error: "Invalid venue data" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to create venue" }, { status: 500 });
    }
  },
});
