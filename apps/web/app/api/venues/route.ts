// [P0][VENUES][API][D5] Venues list endpoint with Firestore
export const dynamic = "force-dynamic";

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateVenueSchema } from "@fresh-schedules/types";
import type { CreateVenueInput } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { getFirestore } from "firebase-admin/firestore";
import { badRequest, forbidden, ok, serverError } from "../_shared/validation";
import { FLAGS } from "../../../src/lib/features";

/**
 * GET /api/venues
 * List venues for an organization
 */
export const GET = createOrgEndpoint({
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request, input: _input, context, params: _params }) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgIdParam = searchParams.get("orgId");
      const orgId = orgIdParam || context.org?.orgId;

      if (!orgId) {
        return badRequest("orgId query parameter is required");
      }
      if (orgIdParam && context.org?.orgId && orgIdParam !== context.org.orgId) {
        return forbidden("orgId does not match organization context");
      }

      // D5: Fetch from Firestore if FIRESTORE_WRITES enabled
      if (FLAGS.FIRESTORE_WRITES) {
        const db = getFirestore();
        const snapshot = await db.collection(`orgs/${orgId}/venues`).orderBy("name").get();

        const venues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return ok({ venues, total: venues.length });
      }

      // Fallback: Mock data when Firestore disabled
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
  rateLimit: { maxRequests: 50, windowMs: 60_000 },
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      const validated = input as CreateVenueInput;
      const orgId = context.org?.orgId;
      if (!orgId) {
        return badRequest("Organization context is required");
      }
      if (validated.orgId !== orgId) {
        return forbidden("orgId does not match organization context");
      }

      const venue = {
        ...validated,
        orgId,
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // D5: Write to Firestore if enabled
      if (FLAGS.FIRESTORE_WRITES && orgId) {
        const db = getFirestore();
        const docRef = await db.collection(`orgs/${orgId}/venues`).add(venue);
        return NextResponse.json({ id: docRef.id, ...venue }, { status: 201 });
      }

      return NextResponse.json({ id: `venue-${Date.now()}`, ...venue }, { status: 201 });
    } catch {
      return serverError("Failed to create venue");
    }
  },
});
