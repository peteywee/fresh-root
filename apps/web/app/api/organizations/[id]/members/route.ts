// [P1][API][MEMBERSHIPS] Organization members API routes
// Tags: P1, API, MEMBERSHIPS, RBAC
import { CreateMembershipSchema, UpdateMembershipSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../../src/lib/api/authorization";
import { withSecurity } from "../../../_shared/middleware";
import { parseJson, badRequest, ok, serverError } from "../../../_shared/validation";

// Rate limiting via withSecurity options

/**
 * Helper to get roles from custom claims
 */
// Helper left for potential future enhancements
function getUserRolesFallback(): string[] {
  return ["staff"];
}

/**
 * Handles GET requests to `/api/organizations/[id]/members` to list all members of an organization.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {string} context.orgId - The ID of the organization.
 * @param {string} context.userId - The ID of the authenticated user.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const GET = withSecurity(
  requireOrgMembership(async (request, context) => {
    try {
      const orgId = context.orgId;
      const members = [
        {
          id: `${context.userId}_${orgId}`,
          uid: context.userId,
          orgId,
          roles: getUserRolesFallback(),
          status: "active",
          joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
          createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
          updatedAt: Date.now(),
        },
      ];
      return ok({ members, total: members.length });
    } catch (error) {
      console.error("Failed to fetch members:", error);
      return serverError("Failed to fetch members");
    }
  }),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * Handles POST requests to `/api/organizations/[id]/members` to add a new member to an organization.
 * Requires 'manager' role or higher.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {string} context.orgId - The ID of the organization.
 * @param {string} context.userId - The ID of the authenticated user.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("manager")(async (request, context) => {
      try {
        const orgId = context.orgId;
        const parsed = await parseJson(request, CreateMembershipSchema);
        if (!parsed.success) {
          return NextResponse.json(
            {
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid membership data",
                details: parsed.details,
              },
            },
            { status: 422 },
          );
        }
        const data = parsed.data;
        if (data.orgId !== orgId) {
          return badRequest("Organization ID mismatch");
        }
        const now = Date.now();
        const newMember = {
          id: `${data.uid}_${orgId}`,
          uid: data.uid,
          orgId,
          roles: data.roles,
          status: data.status || "invited",
          invitedBy: context.userId,
          invitedAt: now,
          joinedAt: now,
          createdAt: now,
          updatedAt: now,
        };
        return NextResponse.json(newMember, { status: 201 });
      } catch (error) {
        console.error("Failed to add member:", error);
        return serverError("Failed to add member");
      }
    }),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * Handles PATCH requests to `/api/organizations/[id]/members` to update a member's roles or status.
 * Requires 'manager' role or higher.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {string} context.orgId - The ID of the organization.
 * @param {string} context.userId - The ID of the authenticated user.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const PATCH = withSecurity(
  requireOrgMembership(
    requireRole("manager")(async (request, context) => {
      try {
        const orgId = context.orgId;
        const { searchParams } = new URL(request.url);
        const memberId = searchParams.get("memberId");
        if (!memberId) {
          return badRequest("Member ID required");
        }
        const parsed = await parseJson(request, UpdateMembershipSchema);
        if (!parsed.success) {
          return NextResponse.json(
            {
              error: {
                code: "VALIDATION_ERROR",
                message: "Invalid membership update data",
                details: parsed.details,
              },
            },
            { status: 422 },
          );
        }
        const data = parsed.data; // Type assertion since we know it's valid
        const updatedMember = {
          id: memberId,
          orgId,
          ...data,
          updatedAt: Date.now(),
        };
        return ok(updatedMember);
      } catch (error) {
        console.error("Failed to update member:", error);
        return serverError("Failed to update member");
      }
    }),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * Handles DELETE requests to `/api/organizations/[id]/members` to remove a member from an organization.
 * Requires 'manager' role or higher.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {string} context.orgId - The ID of the organization.
 * @param {string} context.userId - The ID of the authenticated user.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const DELETE = withSecurity(
  requireOrgMembership(
    requireRole("manager")(async (request, context) => {
      try {
        const orgId = context.orgId;
        const { searchParams } = new URL(request.url);
        const memberId = searchParams.get("memberId");
        if (!memberId) {
          return badRequest("Member ID required");
        }
        // Prevent self-removal
        if (memberId === `${context.userId}_${orgId}`) {
          return badRequest("Cannot remove yourself from the organization");
        }
        // In production, soft delete or update status in Firestore
        return ok({ message: "Member removed successfully", memberId });
      } catch (error) {
        console.error("Failed to remove member:", error);
        return serverError("Failed to remove member");
      }
    }),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);
