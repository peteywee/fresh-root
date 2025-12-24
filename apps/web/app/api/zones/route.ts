// [P0][ZONES][API][D6] Zones list endpoint with Firestore
export const dynamic = "force-dynamic";

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateZoneSchema } from "@fresh-schedules/types";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { badRequest, ok, serverError } from "../_shared/validation";
import { FLAGS } from "../../../src/lib/features";

/**
 * GET /api/zones
 * List zones for a venue
 */
export const GET = createOrgEndpoint({
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request, input: _input, context, params: _params }) => {
    try {
      const { searchParams } = new URL(request.url);
      const venueId = searchParams.get("venueId");
      const orgId = context.org?.orgId;

      if (!venueId) {
        return badRequest("venueId query parameter is required");
      }

      // D6: Fetch from Firestore if FIRESTORE_WRITES enabled
      if (FLAGS.FIRESTORE_WRITES && orgId) {
        const db = getFirestore();
        const snapshot = await db
          .collection(`orgs/${orgId}/zones`)
          .where("venueId", "==", venueId)
          .orderBy("name")
          .get();

        const zones = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return ok({ zones, total: zones.length });
      }

      // Fallback: Mock data when Firestore disabled
      const zones = [
        {
          id: "zone-1",
          venueId,
          orgId,
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
  input: CreateZoneSchema,
  rateLimit: { maxRequests: 50, windowMs: 60_000 },
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      const validated = input as Record<string, unknown>;
      const orgId = context.org?.orgId;

      const zone = {
        orgId,
        ...validated,
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // D6: Write to Firestore if enabled
      if (FLAGS.FIRESTORE_WRITES && orgId) {
        const db = getFirestore();
        const docRef = await db.collection(`orgs/${orgId}/zones`).add(zone);
        return NextResponse.json({ id: docRef.id, ...zone }, { status: 201 });
      }

      return NextResponse.json({ id: `zone-${Date.now()}`, ...zone }, { status: 201 });
    } catch {
      return serverError("Failed to create zone");
    }
  },
});
