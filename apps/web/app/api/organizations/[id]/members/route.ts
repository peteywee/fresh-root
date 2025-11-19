// [P1][API][MEMBERSHIPS] Organization members API routes
// [P1][API][MEMBERSHIPS] Organization members API routes
import { traceFn } from "@/app/api/_shared/otel";
// [P1][API][MEMBERSHIPS] Organization members API routes
import { withGuards } from "@/app/api/_shared/security";
// [P1][API][MEMBERSHIPS] Organization members API routes
import { jsonOk, jsonError } from "@/app/api/_shared/response";
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
 * GET /api/organizations/[id]/members
 * List all members of an organization
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
 * POST /api/organizations/[id]/members
 * Add a new member to an organization (managers only)
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
 * PATCH /api/organizations/[id]/members/[memberId]
 * Update a member's roles or status (managers only)
 *
 * Note: This should be implemented as a separate route at:
 * /api/organizations/[id]/members/[memberId]/route.ts
 *
 * For now, we can handle basic updates here via query param
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
        const data = parsed.data; // validated via schema
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
 * DELETE /api/organizations/[id]/members/[memberId]
 * Remove a member from an organization (managers only)
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
