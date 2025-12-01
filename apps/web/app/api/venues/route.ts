// [P0][CORE][API] Venues list endpoint

import { CreateVenueSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

// Rate limiting is handled via withSecurity options

/**
 * GET /api/venues
 * List venues for an organization
 */
export const GET = createOrgEndpoint({
  handler: async ({ request, context, params }) => {
      try {
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get("orgId") || context.orgId;

        if (!orgId) {
          return badRequest("orgId query parameter is required");
        }

        // Mock data - in production, fetch from Firestore
        const venues = [
          {
            id: "venue-1",
            orgId,
            name: "Main Convention Center",
            description: "Primary event venue",
            type: "indoor",
            address: {
              street: "123 Event Plaza",
              city: "San Francisco",
              state: "CA",
              zipCode: "94102",
              country: "US",
            },
            coordinates: {
              lat: 37.7749,
              lng: -122.4194,
            },
            capacity: 500,
            isActive: true,
            timezone: "America/Los_Angeles",
            contactPhone: "+1-555-0100",
            contactEmail: "venue@example.com",
            createdBy: context.auth?.userId,
            createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          },
        ];

        return ok({ venues, total: venues.length });
      } catch {
        return serverError("Failed to fetch venues");
      }
    },
  },
  rateLimit: { maxRequests: 100, windowMs: 60000 },
});

/**
 * POST /api/venues
 * Create a new venue (requires manager+ role)
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ request, context, params }) => {
        try {
          const parsed = await parseJson(request, CreateVenueSchema);
          if (!parsed.success) {
            return badRequest("Validation failed", parsed.details);
          }

          const data = parsed.data;

          // Verify orgId matches context
          if (data.orgId !== context.orgId) {
            return badRequest("Organization ID mismatch", null, "FORBIDDEN");
          }

          // In production, create in Firestore
          const newVenue = {
            id: `venue-${Date.now()}`,
            ...data,
            isActive: true,
            timezone: data.timezone || "America/New_York",
            createdBy: context.auth?.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          return NextResponse.json(newVenue, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return badRequest("Invalid venue data");
          }
          return serverError("Failed to create venue");
        }
      },
  },
  rateLimit: { maxRequests: 100, windowMs: 60000 },
});
