// [P1][API][POSITIONS] Positions API route handler
// [P1][API][POSITIONS] Positions API route handler
// [P1][API][POSITIONS] Positions API route handler
// [P1][API][POSITIONS] Positions API route handler
// Tags: P1, API, POSITIONS, validation, zod

import { CreatePositionSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { withSecurity } from "../_shared/middleware";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

// Rate limiting is handled via withSecurity options

/**
 * GET /api/positions
 * List positions for an organization
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
        const positions = [
          {
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
            createdBy: context.userId,
            createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          },
        ];

        return ok({ positions, total: positions.length });
      } catch {
        return serverError("Failed to fetch positions");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * POST /api/positions
 * Create a new position (requires manager+ role)
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
          const parsed = await parseJson(request, CreatePositionSchema);
          if (!parsed.success) {
            return badRequest("Validation failed", parsed.details);
          }

          const data = parsed.data;

          // Verify orgId matches context
          if (data.orgId !== context.orgId) {
            return badRequest("Organization ID mismatch", null, "FORBIDDEN");
          }

          // In production, create in Firestore
          const newPosition = {
            id: `pos-${Date.now()}`,
            ...data,
            isActive: true,
            requiredCertifications: data.requiredCertifications || [],
            createdBy: context.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          return NextResponse.json(newPosition, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return badRequest("Invalid position data");
          }
          return serverError("Failed to create position");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);
