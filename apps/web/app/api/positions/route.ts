// [P0][CORE][API][D2] Positions list endpoint with Firestore
export const dynamic = "force-dynamic";

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreatePositionSchema } from "@fresh-schedules/types";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { badRequest, ok, serverError } from "../_shared/validation";
import { FLAGS } from "../../../src/lib/features";

/**
 * GET /api/positions
 * List positions for an organization
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
        },
      ];

      return ok({ positions, total: positions.length });
    } catch {
      return serverError("Failed to fetch positions");
    }
  },
});

/**
 * POST /api/positions
 * Create new position
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  input: CreatePositionSchema,
  handler: async ({ input, context, params: _params }: { input: Record<string, unknown>; context: any; params: any }) => {
    try {
      const validated = input as Record<string, unknown>;
      const position = {
        id: `pos-${Date.now()}`,
        orgId: context.org?.orgId,
        ...validated,
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
      };

      return NextResponse.json(position, { status: 201 });
    } catch {
      return serverError("Failed to create position");
    }
  },
});
