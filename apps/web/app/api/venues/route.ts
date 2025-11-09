// [P1][API][VENUES] Venues API route handler
// Tags: P1, API, VENUES, validation, zod

import { CreateVenueSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { withSecurity } from "../_shared/middleware";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

// Rate limiting is handled via withSecurity options

/**
 * Handles GET requests to `/api/venues` to list venues for an organization.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters.
 * @param {string} context.userId - The ID of the authenticated user.
 * @param {string} context.orgId - The ID of the user's organization.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const GET = withSecurity(
  requireOrgMembership(
    async (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string; orgId: string },
    ) => {
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
            createdBy: context.userId,
            createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          },
        ];

        return ok({ venues, total: venues.length });
      } catch {
        return serverError("Failed to fetch venues");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * Handles POST requests to `/api/venues` to create a new venue.
 * Requires 'manager' role or higher.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters.
 * @param {string} context.userId - The ID of the authenticated user.
 * @param {string} context.orgId - The ID of the user's organization.
 * @param {OrgRole[]} context.roles - The roles of the authenticated user.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("manager")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
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
            createdBy: context.userId,
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
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);
