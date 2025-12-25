// [P2][D2][POSITIONS][DETAIL][API] Position detail endpoint with Firestore persistence
// Tags: P2, D2, API, POSITIONS, FIRESTORE
export const dynamic = "force-dynamic";
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { type Position } from "@fresh-schedules/types";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";

// Inline update schema (mirrors packages/types UpdatePositionSchema)
const UpdatePositionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: z.string().optional(),
  skillLevel: z.string().optional(),
  hourlyRate: z.number().nonnegative().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  isActive: z.boolean().optional(),
  requiredCertifications: z.array(z.string()).optional(),
});

import { checkRateLimit, RateLimits } from "../../../../src/lib/api/rate-limit.server";
import { sanitizeObject } from "../../../../src/lib/api/sanitize";
import { serverError } from "../../_shared/validation";

/**
 * GET /api/positions/[id]
 * Get position details from Firestore (requires staff+ role)
 */
export const GET = createOrgEndpoint({
  handler: async ({ request, input: _input, context, params }) => {
    // Apply rate limiting
    const rateLimitResult = await checkRateLimit(request, RateLimits.api);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }

    try {
      const { id } = params;
      const orgId = context.org!.orgId;

      // Fetch from Firestore
      const db = getFirestore();
      const positionRef = db.collection("orgs").doc(orgId).collection("positions").doc(id);
      const snap = await positionRef.get();

      if (!snap.exists) {
        return NextResponse.json({ error: "Position not found" }, { status: 404 });
      }

      const position = snap.data() as Position;

      // Verify the position belongs to this org
      if (position.orgId !== orgId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      return NextResponse.json(position, { status: 200 });
    } catch (error) {
      console.error("Error fetching position:", error);
      return serverError("Failed to fetch position");
    }
  },
});

/**
 * PATCH /api/positions/[id]
 * Update position details in Firestore (requires manager+ role)
 */
export const PATCH = createOrgEndpoint({
  roles: ["manager"],
  input: UpdatePositionSchema,
  handler: async ({ request, input, context, params }) => {
    // Apply rate limiting
    const rateLimitResult = await checkRateLimit(request, RateLimits.api);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }

    try {
      const { id } = params;
      const orgId = context.org!.orgId;

      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof UpdatePositionSchema>;
      const sanitized = sanitizeObject(typedInput as Record<string, unknown>);

      // Validate with Zod
      const validationResult = UpdatePositionSchema.safeParse(sanitized);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Invalid position data", details: validationResult.error.issues },
          { status: 400 },
        );
      }

      // Fetch current document to verify orgId and apply partial updates
      const db = getFirestore();
      const positionRef = db.collection("orgs").doc(orgId).collection("positions").doc(id);
      const snap = await positionRef.get();

      if (!snap.exists) {
        return NextResponse.json({ error: "Position not found" }, { status: 404 });
      }

      const current = snap.data() as Position;

      // Verify org ownership
      if (current.orgId !== orgId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Build update object with timestamp
      const updateData = {
        ...sanitized,
        updatedAt: Date.now(),
      };

      // Update in Firestore
      await positionRef.update(updateData);

      // Return updated position
      const updatedPosition: Position = {
        ...current,
        ...updateData,
      } as Position;

      return NextResponse.json(updatedPosition, { status: 200 });
    } catch (error) {
      console.error("Error updating position:", error);
      return serverError("Failed to update position");
    }
  },
});

/**
 * DELETE /api/positions/[id]
 * Soft delete a position (requires admin+ role, sets isActive to false)
 */
export const DELETE = createOrgEndpoint({
  roles: ["admin"],
  handler: async ({ request, input: _input, context, params }) => {
    // Apply rate limiting
    const rateLimitResult = await checkRateLimit(request, RateLimits.api);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }

    try {
      const { id } = params;
      const orgId = context.org!.orgId;

      // Fetch current document
      const db = getFirestore();
      const positionRef = db.collection("orgs").doc(orgId).collection("positions").doc(id);
      const snap = await positionRef.get();

      if (!snap.exists) {
        return NextResponse.json({ error: "Position not found" }, { status: 404 });
      }

      const current = snap.data() as Position;

      // Verify org ownership
      if (current.orgId !== orgId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Soft delete: set isActive to false
      await positionRef.update({
        isActive: false,
        updatedAt: Date.now(),
      });

      return NextResponse.json(
        {
          message: "Position deleted successfully",
          id,
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("Error deleting position:", error);
      return serverError("Failed to delete position");
    }
  },
});
