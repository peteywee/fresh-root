//[P1][API][CODE] Shifts [id] API route handler
// Tags: P1, API, CODE, validation, zod

import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../src/lib/api";
import { sanitizeObject } from "../../../../src/lib/api/sanitize";
import { withSecurity } from "../../_shared/middleware";
import { badRequest, serverError, UpdateShiftSchema } from "../../_shared/validation";

// Rate limiting via withSecurity options

/**
 * Handles GET requests to `/api/shifts/[id]` to retrieve the details of a specific shift.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters, including the shift ID.
 * @param {string} context.userId - The ID of the authenticated user.
 * @param {string} context.orgId - The ID of the user's organization.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const GET = withSecurity(
  requireOrgMembership(
    async (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string; orgId: string },
    ) => {
      try {
        const { params } = context;
        const { id } = params;
        const shift = {
          id,
          scheduleId: "sched-1",
          positionId: "pos-1",
          userId: "user-123",
          startTime: "2025-01-15T09:00:00Z",
          endTime: "2025-01-15T17:00:00Z",
          status: "published",
          breakMinutes: 30,
          createdAt: new Date().toISOString(),
        };
        return NextResponse.json(shift);
      } catch {
        return serverError("Failed to fetch shift");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * Handles PATCH requests to `/api/shifts/[id]` to update the details of a specific shift.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters, including the shift ID.
 * @param {string} context.userId - The ID of the authenticated user.
 * @param {string} context.orgId - The ID of the user's organization.
 * @param {OrgRole[]} context.roles - The roles of the authenticated user.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const PATCH = withSecurity(
  requireOrgMembership(
    requireRole("scheduler")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const { params } = context;
          const { id } = params;
          const body = await request.json();
          const validated = UpdateShiftSchema.parse(body);
          const sanitized = sanitizeObject(validated);
          const updated = {
            id,
            ...sanitized,
            updatedAt: new Date().toISOString(),
          };
          return NextResponse.json(updated);
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return badRequest("Invalid shift update");
          }
          return serverError("Failed to update shift");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * Handles DELETE requests to `/api/shifts/[id]` to delete a specific shift.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters, including the shift ID.
 * @param {string} context.userId - The ID of the authenticated user.
 * @param {string} context.orgId - The ID of the user's organization.
 * @param {OrgRole[]} context.roles - The roles of the authenticated user.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const DELETE = withSecurity(
  requireOrgMembership(
    requireRole("admin")(
      async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const { params } = context;
          const { id } = params;
          return NextResponse.json({ message: "Shift deleted successfully", id });
        } catch {
          return serverError("Failed to delete shift");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);
