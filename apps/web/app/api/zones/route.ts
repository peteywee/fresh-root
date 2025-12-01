// [P0][ZONES][API] Zones list endpoint
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { CreateZoneSchema } from "@fresh-schedules/types";

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { badRequest, ok, serverError } from "../_shared/validation";

/**
 * GET /api/zones
 * List zones for a venue
 */
export const GET = createOrgEndpoint({
  handler: async ({ request, context, params }) => {
    try {
      const { searchParams } = new URL(request.url);
      const venueId = searchParams.get("venueId");

      if (!venueId) {
        return badRequest("venueId query parameter is required");
      }

      // Mock data - in production, fetch from Firestore
      const zones = [
        {
          id: "zone-1",
          venueId,
          orgId: context.org?.orgId,
          name: "Front of House",
          description: "Customer-facing area",
          isActive: true,
        },
      ];

      return ok({ zones, total: zones.length });
    } catch {
      return serverError("Failed to fetch zones");
    }
  },
});

/**
 * POST /api/zones
 * Create new zone
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ request, context, params }) => {
    try {
      const body = await request.json();
      const validated = CreateZoneSchema.parse(body);
      
      const zone = {
        id: `zone-${Date.now()}`,
        orgId: context.org?.orgId,
        ...validated,
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
      };

      return NextResponse.json(zone, { status: 201 });
    } catch {
      return serverError("Failed to create zone");
    }
  },
});
