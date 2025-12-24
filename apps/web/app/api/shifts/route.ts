// [P0][SHIFTS][API][D4] Shifts list endpoint with Firestore
export const dynamic = "force-dynamic";

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateShiftSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { getFirestore } from "firebase-admin/firestore";
import { badRequest, ok, serverError } from "../_shared/validation";
import { FLAGS } from "../../../src/lib/features";

/**
 * GET /api/shifts
 * List shifts for an organization
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

      // D4: Fetch from Firestore if FIRESTORE_WRITES enabled
      if (FLAGS.FIRESTORE_WRITES) {
        const db = getFirestore();
        const snapshot = await db
          .collection(`orgs/${orgId}/shifts`)
          .orderBy("createdAt", "desc")
          .get();

        const shifts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return ok({ shifts, total: shifts.length });
      }

      // Fallback: Mock data when Firestore disabled
      const shifts = [
        {
          id: "shift-1",
          orgId,
          name: "Morning Shift",
          startTime: 8 * 60,
          endTime: 16 * 60,
          isActive: true,
        },
      ];

      return ok({ shifts, total: shifts.length });
    } catch {
      return serverError("Failed to fetch shifts");
    }
  },
});

/**
 * POST /api/shifts
 * Create new shift
 */
export const POST = createOrgEndpoint({
  roles: ["manager"],
  input: CreateShiftSchema,
  rateLimit: { maxRequests: 50, windowMs: 60_000 },
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      const validated = input as Record<string, unknown>;
      const orgId = context.org?.orgId;

      const shift = {
        orgId,
        ...(validated || {}),
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // D4: Write to Firestore if enabled
      if (FLAGS.FIRESTORE_WRITES && orgId) {
        const db = getFirestore();
        const docRef = await db.collection(`orgs/${orgId}/shifts`).add(shift);
        return NextResponse.json({ id: docRef.id, ...shift }, { status: 201 });
      }

      return NextResponse.json({ id: `shift-${Date.now()}`, ...shift }, { status: 201 });
    } catch {
      return serverError("Failed to create shift");
    }
  },
});
