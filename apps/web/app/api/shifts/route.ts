//[P1][API][CODE] Shifts API route handler
// Tags: P1, API, CODE, validation, zod

import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { sanitizeObject } from "../../../src/lib/api/sanitize";
import { withSecurity } from "../_shared/middleware";
import { badRequest, serverError, CreateShiftSchema } from "../_shared/validation";

// Rate limiting is handled via withSecurity options

/**
 * Handles GET requests to `/api/shifts` to list shifts, optionally filtered by schedule.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters.
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
        const { searchParams } = new URL(request.url);
        const scheduleId = searchParams.get("scheduleId");
        const orgId = searchParams.get("orgId") || context.orgId;
        if (!orgId) {
          return badRequest("orgId query parameter is required");
        }
        const shifts = [
          {
            id: "shift-1",
            scheduleId: scheduleId ?? "sched-1",
            positionId: "pos-1",
            userId: "user-123",
            startTime: "2025-01-15T09:00:00Z",
            endTime: "2025-01-15T17:00:00Z",
            status: "published",
            breakMinutes: 30,
            createdAt: new Date().toISOString(),
          },
        ];
        return NextResponse.json({ shifts, orgId });
      } catch {
        return serverError("Failed to fetch shifts");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * Handles POST requests to `/api/shifts` to create a new shift.
 * Requires 'scheduler' role or higher.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters.
 * @param {string} context.userId - The ID of the authenticated user.
 * @param {string} context.orgId - The ID of the user's organization.
 * @param {OrgRole[]} context.roles - The roles of the authenticated user.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const POST = withSecurity(
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
          const { searchParams } = new URL(request.url);
          const scheduleIdFromQuery = searchParams.get("scheduleId");
          const body = await request.json();
          const validated = CreateShiftSchema.parse(body);
          const sanitized = sanitizeObject(validated);
          const scheduleId = scheduleIdFromQuery || validated.scheduleId;
          if (!scheduleId) {
            return badRequest("scheduleId is required in query or body");
          }
          const newShift = {
            id: `shift-${Date.now()}`,
            status: "draft" as const,
            createdAt: new Date().toISOString(),
            createdBy: context.userId,
            ...sanitized,
          };
          return NextResponse.json(newShift, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return badRequest("Invalid shift data");
          }
          return serverError("Failed to create shift");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);
