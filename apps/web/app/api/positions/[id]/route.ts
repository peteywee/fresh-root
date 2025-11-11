//[P1][API][CODE] Positions [id] API route handler
// Tags: P1, API, CODE, validation, zod

import { PositionUpdateSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../src/lib/api/authorization";
import { csrfProtection } from "../../../../src/lib/api/csrf";
import { rateLimit, RateLimits } from "../../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../../src/lib/api/sanitize";
import { serverError } from "../../_shared/validation";

/**
 * Handles GET requests to `/api/positions/[id]` to retrieve the details of a specific position.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters, including the position ID.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const GET = requireOrgMembership(async (request, context) => {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, RateLimits.api);
  if (rateLimitResult) return rateLimitResult;

  const { params } = context;
  try {
    const { id } = params;

    // In production, fetch from Firestore and verify orgId matches
    const position = {
      id,
      orgId: context.orgId,
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
});

/**
 * Handles PATCH requests to `/api/positions/[id]` to update the details of a specific position.
 * Requires 'manager' role or higher.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters, including the position ID.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const PATCH = csrfProtection()(
  requireOrgMembership(
    requireRole("manager")(async (request, context) => {
      // Apply rate limiting
      const rateLimitResult = await rateLimit(request, RateLimits.api);
      if (rateLimitResult) return rateLimitResult;

      const { params } = context;
      try {
        const { id } = params;
        const body = await request.json();
        const sanitized = sanitizeObject(body);

        // Validate with Zod
        const validationResult = PositionUpdateSchema.safeParse(sanitized);
        if (!validationResult.success) {
          return NextResponse.json(
            { error: "Invalid position data", details: validationResult.error.errors },
            { status: 400 },
          );
        }

        const data: any = validationResult.data;

        // In production, update in Firestore after verifying orgId matches
        const updatedPosition = {
          id,
          orgId: context.orgId,
          title: "Server",
          ...data,
          updatedAt: new Date().toISOString(),
        };

        return NextResponse.json(updatedPosition);
      } catch {
        return serverError("Failed to update position");
      }
    }),
  ),
);

/**
 * Handles DELETE requests to `/api/positions/[id]` to delete a specific position.
 * This is a soft delete, setting the `isActive` flag to `false`.
 * Requires 'admin' role or higher.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters, including the position ID.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const DELETE = csrfProtection()(
  requireOrgMembership(
    requireRole("admin")(async (request, context) => {
      // Apply rate limiting
      const rateLimitResult = await rateLimit(request, RateLimits.api);
      if (rateLimitResult) return rateLimitResult;

      const { params } = context;
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
    }),
  ),
);
