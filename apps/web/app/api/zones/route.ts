// [P0][CORE][API] Zones list endpoint

import { CreateZoneSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

// Rate limiting is handled via withSecurity options

/**
 * GET /api/zones
 * List zones for an organization or venue
 */
export const GET = createOrgEndpoint({
  handler: async ({ request, context, params }) => {
      try {
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get("orgId") || context.orgId;
        const venueId = searchParams.get("venueId");

        if (!orgId) {
          return badRequest("orgId query parameter is required");
        }

        // Mock data - in production, fetch from Firestore
        const zones = [
          {
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
            createdBy: context.auth?.userId,
            createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          },
        ];

        const filtered = venueId ? zones.filter((z) => z.venueId === venueId) : zones;

        return ok({ zones: filtered, total: filtered.length });
      } catch {
        return serverError("Failed to fetch zones");
      }
  },
  rateLimit: { maxRequests: 100, windowMs: 60000 },
});

/**
 * POST /api/zones
 * Create a new zone (requires manager+ role)
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ request, context, params }) => {
        try {
          const parsed = await parseJson(request, CreateZoneSchema);
          if (!parsed.success) {
            return badRequest("Validation failed", parsed.details);
          }

          const data = parsed.data;

          // Verify orgId matches context
          if (data.orgId !== context.orgId) {
            return badRequest("Organization ID mismatch", null, "FORBIDDEN");
          }

          // In production, create in Firestore
          const newZone = {
            id: `zone-${Date.now()}`,
            ...data,
            isActive: true,
            type: data.type || "other",
            createdBy: context.auth?.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          return NextResponse.json(newZone, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return badRequest("Invalid zone data");
          }
          return serverError("Failed to create zone");
        }
  },
  rateLimit: { maxRequests: 100, windowMs: 60000 },
});
