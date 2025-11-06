//[P1][API][CODE] Positions API route handler
// Tags: P1, API, CODE, validation, zod

import { PositionCreateSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api/authorization";
import { csrfProtection } from "../../../src/lib/api/csrf";
import { rateLimit, RateLimits } from "../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../src/lib/api/sanitize";
import { serverError } from "../_shared/validation";

/**
 * GET /api/positions
 * List positions in an organization
 */
export const GET = rateLimit(RateLimits.STANDARD)(
  requireOrgMembership(async (request, context) => {
    try {
      const { orgId } = context;

      // In production, fetch from Firestore filtered by orgId
      const positions = [
        {
          id: "pos-1",
          orgId,
          title: "Server",
          hourlyRate: 15.0,
          color: "#2196F3",
          createdAt: new Date().toISOString(),
        },
        {
          id: "pos-2",
          orgId,
          title: "Cook",
          hourlyRate: 18.0,
          color: "#4CAF50",
          createdAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({ positions });
    } catch {
      return serverError("Failed to fetch positions");
    }
  }),
);

/**
 * POST /api/positions
 * Create a new position (requires manager+ role)
 */
export const POST = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    requireOrgMembership(
      requireRole("manager")(async (request, context) => {
        try {
          const body = await request.json();
          const sanitized = sanitizeObject(body);

          // Validate with Zod
          const validationResult = PositionCreateSchema.safeParse(sanitized);
          if (!validationResult.success) {
            return NextResponse.json(
              { error: "Invalid position data", details: validationResult.error.errors },
              { status: 400 },
            );
          }

          const data = validationResult.data;
          const { userId, orgId } = context;

          // In production, create position in Firestore
          const newPosition = {
            id: `pos-${Date.now()}`,
            ...data,
            orgId,
            createdAt: new Date().toISOString(),
            createdBy: userId,
          };

          return NextResponse.json(newPosition, { status: 201 });
        } catch {
          return serverError("Failed to create position");
        }
      }),
    ),
  ),
);
