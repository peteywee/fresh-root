// [P2][D4][SHIFTS][DETAIL][API] Shift detail endpoint with Firestore persistence
// Tags: P2, D4, API, SHIFTS, FIRESTORE
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { UpdateShiftSchema, type Shift } from "@fresh-schedules/types";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { serverError } from "../../_shared/validation";

/**
 * GET /api/shifts/[id]
 * Get shift details from Firestore
 */
export const GET = createOrgEndpoint({
  handler: async ({ request: _request, input: _input, context, params }) => {
    try {
      const { id } = params;
      const orgId = context.org!.orgId;

      // Fetch from Firestore
      const db = getFirestore();
      const shiftRef = db.collection('orgs').doc(orgId).collection('shifts').doc(id);
      const snap = await shiftRef.get();

      if (!snap.exists) {
        return NextResponse.json(
          { error: "Shift not found" },
          { status: 404 },
        );
      }

      const shift = snap.data() as Shift;

      // Verify the shift belongs to this org
      if (shift.orgId !== orgId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 },
        );
      }

      return NextResponse.json(shift, { status: 200 });
    } catch (error) {
      console.error("Error fetching shift:", error);
      return serverError("Failed to fetch shift");
    }
  },
});

/**
 * PATCH /api/shifts/[id]
 * Update shift in Firestore (requires manager+ role)
 */
export const PATCH = createOrgEndpoint({
  roles: ["manager"],
  input: UpdateShiftSchema,
  handler: async ({ request: _request, input, context, params }) => {
    try {
      const { id } = params;
      const orgId = context.org!.orgId;

      // Fetch current document to verify orgId and apply partial updates
      const db = getFirestore();
      const shiftRef = db.collection('orgs').doc(orgId).collection('shifts').doc(id);
      const snap = await shiftRef.get();

      if (!snap.exists) {
        return NextResponse.json(
          { error: "Shift not found" },
          { status: 404 },
        );
      }

      const current = snap.data() as Shift;

      // Verify org ownership
      if (current.orgId !== orgId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 },
        );
      }

      // Build update object with timestamp
      const updateData: Partial<Shift> & { updatedAt: number } = {
        ...(input as Partial<Shift>),
        updatedAt: Date.now(),
      };

      // Update in Firestore
      await shiftRef.update(updateData);

      // Return updated shift
      const updatedShift: Shift = {
        ...current,
        ...updateData,
      } as Shift;

      return NextResponse.json(updatedShift, { status: 200 });
    } catch (error) {
      console.error("Error updating shift:", error);
      return serverError("Failed to update shift");
    }
  },
});

/**
 * DELETE /api/shifts/[id]
 * Soft delete a shift (requires manager+ role, sets status to cancelled)
 */
export const DELETE = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ request: _request, input: _input, context, params }) => {
    try {
      const { id } = params;
      const orgId = context.org!.orgId;

      // Fetch current document
      const db = getFirestore();
      const shiftRef = db.collection('orgs').doc(orgId).collection('shifts').doc(id);
      const snap = await shiftRef.get();

      if (!snap.exists) {
        return NextResponse.json(
          { error: "Shift not found" },
          { status: 404 },
        );
      }

      const current = snap.data() as Shift;

      // Verify org ownership
      if (current.orgId !== orgId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 },
        );
      }

      // Soft delete: set status to cancelled
      await shiftRef.update({
        status: "cancelled",
        updatedAt: Date.now(),
      });

      return NextResponse.json({
        message: "Shift deleted successfully",
        id,
      }, { status: 200 });
    } catch (error) {
      console.error("Error deleting shift:", error);
      return serverError("Failed to delete shift");
    }
  },
});
