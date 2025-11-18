//[P1][API][CODE] Positions [id] API route handler
// Tags: P1, API, CODE, validation, zod

import { PositionSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../src/lib/api/authorization";
import { csrfProtection } from "../../../../src/lib/api/csrf";
import { rateLimit, RateLimits } from "../../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../../src/lib/api/sanitize";
import { serverError } from "../../_shared/validation";

/**
 * GET /api/positions/[id]
 * Get position details (requires staff+ role)
 */
export const GET = requireOrgMembership(async (request: NextRequest, context: { params: Record<string, string>; orgId?: string; userId?: string; roles?: string[] }) => {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, RateLimits.api);
  if (rateLimitResult) return rateLimitResult;

  const _params = await Promise.resolve(context.params);
  try {
    const { id } = _params as Record<string, string>;

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
}) as unknown as any;

/**
 * PATCH /api/positions/[id]
 * Update position details (requires manager+ role)
 */
export const PATCH = csrfProtection()( 
  requireOrgMembership(
    requireRole("manager")(async (request: NextRequest, context: { params: Record<string, string>; orgId?: string; userId?: string; roles?: string[] }) => {
      // Apply rate limiting
      const rateLimitResult = await rateLimit(request, RateLimits.api);
      if (rateLimitResult) return rateLimitResult;

      const _params = await Promise.resolve(context.params);
      try {
        const { id } = _params as Record<string, string>;
        const body = await request.json();
        const sanitized = sanitizeObject(body);

        // Validate with Zod
        const validationResult = PositionSchema.safeParse(sanitized);
        if (!validationResult.success) {
          return NextResponse.json(
            { error: "Invalid position data", details: validationResult.error.errors },
            { status: 400 },
          );
        }

        const data = validationResult.data;

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
    }) as unknown as any,
  ) as unknown as any,
);

/**
 * DELETE /api/positions/[id]
 * Delete a position (requires admin+ role, soft delete - set isActive to false)
 */
export const DELETE = csrfProtection()(
  requireOrgMembership(
    requireRole("admin")(async (request: NextRequest, context: { params: Record<string, string>; orgId?: string; userId?: string; roles?: string[] }) => {
      // Apply rate limiting
      const rateLimitResult = await rateLimit(request, RateLimits.api);
      if (rateLimitResult) return rateLimitResult;

      const _params = await Promise.resolve(context.params);
      try {
        const { id } = _params as Record<string, string>;

        // In production, soft delete by setting isActive = false after verifying orgId
        return NextResponse.json({
          message: "Position deleted successfully",
          id,
        });
      } catch {
        return serverError("Failed to delete position");
      }
    }) as unknown as any,
  ) as unknown as any,
);
