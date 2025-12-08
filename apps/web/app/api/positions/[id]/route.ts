// [P0][CORE][API] Position management endpoint
export const dynamic = "force-dynamic";
import { createOrgEndpoint } from "@fresh-schedules/api-framework";

import { PositionSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { checkRateLimit, RateLimits } from "../../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../../src/lib/api/sanitize";
import { serverError } from "../../_shared/validation";

/**
 * GET /api/positions/[id]
 * Get position details (requires staff+ role)
 */
export const GET = createOrgEndpoint({
  handler: async ({ request, context, params }) => {
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

      // In production, fetch from Firestore and verify orgId matches
      const position = {
        id,
        orgId: context.org!.orgId,
        title: "Server",
        description: "Front of house server position",
        hourlyRate: 15.0,
        color: "#2196F3",
        isActive: true,
        createdAt: new Date().toISOString(),
        createdBy: "user-123",
      };

      return NextResponse.json(position);
    } catch {
      return serverError("Failed to fetch position");
    }
  },
});

/**
 * PATCH /api/positions/[id]
 * Update position details (requires manager+ role)
 */
export const PATCH = createOrgEndpoint({
  roles: ["manager"],
  handler: async ({ request, context, params }) => {
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
      const body = await request.json();
      const sanitized = sanitizeObject(body);

      // Validate with Zod
      const validationResult = PositionSchema.safeParse(sanitized);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Invalid position data", details: validationResult.error.issues },
          { status: 400 },
        );
      }

      const data = validationResult.data;

      // In production, update in Firestore after verifying orgId matches
      const updatedPosition = {
        id,
        orgId: context.org!.orgId,
        title: "Server",
        ...data,
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json(updatedPosition);
    } catch {
      return serverError("Failed to update position");
    }
  },
});

/**
 * DELETE /api/positions/[id]
 * Delete a position (requires admin+ role, soft delete - set isActive to false)
 */
export const DELETE = createOrgEndpoint({
  roles: ["admin"],
  handler: async ({ request, context, params }) => {
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

      // In production, soft delete by setting isActive = false after verifying orgId
      return NextResponse.json({
        message: "Position deleted successfully",
        id,
      });
    } catch {
      return serverError("Failed to delete position");
    }
  },
});
