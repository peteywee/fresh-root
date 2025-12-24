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
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request, input: _input, context, params: _params }) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get("orgId") || context.org?.orgId;

      if (!orgId) {
        return badRequest("orgId query parameter is required");
      }

      // D2: Fetch from Firestore if FIRESTORE_WRITES enabled
      if (FLAGS.FIRESTORE_WRITES) {
        const db = getFirestore();
        const snapshot = await db.collection(`orgs/${orgId}/positions`).orderBy("name").get();

        const positions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return ok({ positions, total: positions.length });
      }

      // Fallback: Mock data when Firestore disabled
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
  rateLimit: { maxRequests: 50, windowMs: 60_000 },
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      const validated = input as Record<string, unknown>;
      const orgId = context.org?.orgId;

      const position = {
        orgId,
        ...validated,
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // D2: Write to Firestore if enabled
      if (FLAGS.FIRESTORE_WRITES && orgId) {
        const db = getFirestore();
        const docRef = await db.collection(`orgs/${orgId}/positions`).add(position);
        return NextResponse.json({ id: docRef.id, ...position }, { status: 201 });
      }

      return NextResponse.json({ id: `pos-${Date.now()}`, ...position }, { status: 201 });
    } catch {
      return serverError("Failed to create position");
    }
  },
});
