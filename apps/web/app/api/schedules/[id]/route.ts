// [P0][SCHEDULE][API] Schedule detail endpoint

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { UpdateScheduleSchema } from "@fresh-schedules/types";

import { badRequest, ok, parseJson, serverError } from "../../_shared/validation";
import { adminDb } from "@/src/lib/firebase.server";

/**
 * GET /api/schedules/[id]
 * Fetch a schedule by ID from Firestore
 */
export const GET = createOrgEndpoint({
  handler: async ({ request: _request, input: _input, context, params }) => {
    try {
      const { id } = params;
      if (!id) {
        return badRequest("Schedule ID is required");
      }

      if (!adminDb) {
        return serverError("Database not initialized");
      }

      // Query Firestore for the schedule
      const docRef = adminDb.doc(`organizations/${context.org!.orgId}/schedules/${id}`);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return badRequest("Schedule not found", undefined, "NOT_FOUND");
      }

      const data = docSnap.data();
      return ok({ id: docSnap.id, ...data });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch schedule";
      return serverError(message);
    }
  },
});

/**
 * PATCH /api/schedules/[id]
 * Update a schedule in Firestore
 * Note: Requires 'manager' role for broader Series-A access
 */
export const PATCH = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ request, input: _input, context, params }) => {
    try {
      const { id } = params;
      const parsed = await parseJson(request, UpdateScheduleSchema);
      if (!parsed.success) {
        return badRequest("Validation failed", parsed.details);
      }

      if (!adminDb) {
        return serverError("Database not initialized");
      }

      const validated = parsed.data as Record<string, unknown>;
      const docRef = adminDb.doc(`organizations/${context.org!.orgId}/schedules/${id}`);

      // Update the document
      await docRef.update({
        ...validated,
        updatedBy: context.auth?.userId,
        updatedAt: new Date(),
      });

      const updated = await docRef.get();
      return ok({ id: updated.id, ...updated.data() });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return badRequest("Invalid schedule data");
      }
      const message = error instanceof Error ? error.message : "Failed to update schedule";
      return serverError(message);
    }
  },
});

/**
 * DELETE /api/schedules/[id]
 * Delete a schedule from Firestore
 * Note: Requires 'manager' role for broader Series-A access
 */
export const DELETE = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ request: _request, input: _input, context, params }) => {
    try {
      const { id } = params;
      if (!id) {
        return badRequest("Schedule ID is required");
      }

      if (!adminDb) {
        return serverError("Database not initialized");
      }

      const docRef = adminDb.doc(`organizations/${context.org!.orgId}/schedules/${id}`);
      await docRef.delete();

      return ok({ deleted: true, id });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete schedule";
      return serverError(message);
    }
  },
});
