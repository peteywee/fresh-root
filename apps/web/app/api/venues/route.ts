// [P0][VENUES][API][D5] Venues list endpoint with Firestore
export const dynamic = "force-dynamic";

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateVenueSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { getFirestore } from "firebase-admin/firestore";
import { badRequest, ok, serverError } from "../_shared/validation";
import { FLAGS } from "../../../src/lib/features";

/**
 * GET /api/venues
 * List venues for an organization
 */
export const GET = createOrgEndpoint({
  handler: async ({ request, input: _input, context, params: _params }) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get("orgId") || context.org?.orgId;

      if (!orgId) {
        return badRequest("orgId query parameter is required");
      }

      // Mock data - in production, fetch from Firestore
      const venues = [
        {
          id: "venue-1",
          orgId,
          name: "Main Venue",
          address: "123 Main St",
          city: "Seattle",
          state: "WA",
          zipCode: "98101",
          isActive: true,
        },
      ];

      return ok({ venues, total: venues.length });
    } catch {
      return serverError("Failed to fetch venues");
    }
  },
});

/**
 * POST /api/venues
 * Create new venue
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  input: CreateVenueSchema,
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      const validated = input as Record<string, unknown>;

      const venue = {
        id: `venue-${Date.now()}`,
        orgId: context.org?.orgId,
        ...(validated || {}),
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
      };

      return NextResponse.json(venue, { status: 201 });
    } catch {
      return serverError("Failed to create venue");
    }
  },
});
