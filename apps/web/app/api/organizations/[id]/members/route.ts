// [P1][API][MEMBERSHIPS] Organization members API routes
// Tags: P1, API, MEMBERSHIPS, RBAC
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireSession, AuthenticatedRequest, require2FAForManagers } from "../../../_shared/middleware";
import { parseJson, badRequest, ok, serverError } from "../../../_shared/validation";

// Define schemas inline for now - can be moved to shared types later
const CreateMembershipSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
  orgId: z.string().min(1, "Organization ID is required"),
  roles: z.array(z.enum(["org_owner", "admin", "manager", "scheduler", "staff"])).min(1),
  status: z.enum(["active", "suspended", "invited", "removed"]).optional().default("invited"),
  invitedBy: z.string().optional(),
});

const UpdateMembershipSchema = z.object({
  roles: z.array(z.enum(["org_owner", "admin", "manager", "scheduler", "staff"])).min(1).optional(),
  status: z.enum(["active", "suspended", "invited", "removed"]).optional(),
});

/**
 * Helper to get orgId from custom claims
 */
function getUserOrgId(user: AuthenticatedRequest["user"]): string | undefined {
  return user?.customClaims?.orgId as string | undefined;
}

/**
 * Helper to get roles from custom claims
 */
function getUserRoles(user: AuthenticatedRequest["user"]): string[] {
  const roles = user?.customClaims?.roles;
  return Array.isArray(roles) ? roles : ["staff"];
}

/**
 * GET /api/organizations/[id]/members
 * List all members of an organization
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return requireSession(request as AuthenticatedRequest, async (authReq) => {
    try {
      const { id: orgId } = await params;
      const userOrgId = getUserOrgId(authReq.user);

      // Verify user has access to this org
      if (userOrgId !== orgId) {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Access denied to this organization" } },
          { status: 403 }
        );
      }

      // In production, fetch from Firestore memberships collection
      // Query: where('orgId', '==', orgId)
      const members = [
        {
          id: `${authReq.user?.uid}_${orgId}`,
          uid: authReq.user?.uid,
          orgId,
          roles: getUserRoles(authReq.user),
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
  });
}

/**
 * POST /api/organizations/[id]/members
 * Add a new member to an organization (managers only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return require2FAForManagers(request as AuthenticatedRequest, async (authReq) => {
    try {
      const { id: orgId } = await params;
      const userOrgId = getUserOrgId(authReq.user);

      // Verify user has access to this org
      if (userOrgId !== orgId) {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Access denied to this organization" } },
          { status: 403 }
        );
      }

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
          { status: 422 }
        );
      }

      const data = parsed.data;

      // Ensure orgId matches
      if (data.orgId !== orgId) {
        return badRequest("Organization ID mismatch");
      }

      // In production, create membership in Firestore
      // Document ID: `${data.uid}_${orgId}`
      const now = Date.now();
      const newMember = {
        id: `${data.uid}_${orgId}`,
        uid: data.uid,
        orgId,
        roles: data.roles,
        status: data.status || "invited",
        invitedBy: authReq.user?.uid,
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
  });
}

/**
 * PATCH /api/organizations/[id]/members/[memberId]
 * Update a member's roles or status (managers only)
 * 
 * Note: This should be implemented as a separate route at:
 * /api/organizations/[id]/members/[memberId]/route.ts
 * 
 * For now, we can handle basic updates here via query param
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return require2FAForManagers(request as AuthenticatedRequest, async (authReq) => {
    try {
      const { id: orgId } = await params;
      const { searchParams } = new URL(request.url);
      const memberId = searchParams.get("memberId");
      const userOrgId = getUserOrgId(authReq.user);

      if (!memberId) {
        return badRequest("Member ID required");
      }

      // Verify user has access to this org
      if (userOrgId !== orgId) {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Access denied to this organization" } },
          { status: 403 }
        );
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
          { status: 422 }
        );
      }

      // In production, update membership in Firestore
      const data = parsed.data;
      const updatedMember = {
        id: memberId,
        orgId,
        ...(data && typeof data === "object" ? data : {}),
        updatedAt: Date.now(),
      };

      return ok(updatedMember);
    } catch (error) {
      console.error("Failed to update member:", error);
      return serverError("Failed to update member");
    }
  });
}

/**
 * DELETE /api/organizations/[id]/members/[memberId]
 * Remove a member from an organization (managers only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return require2FAForManagers(request as AuthenticatedRequest, async (authReq) => {
    try {
      const { id: orgId } = await params;
      const { searchParams } = new URL(request.url);
      const memberId = searchParams.get("memberId");
      const userOrgId = getUserOrgId(authReq.user);

      if (!memberId) {
        return badRequest("Member ID required");
      }

      // Verify user has access to this org
      if (userOrgId !== orgId) {
        return NextResponse.json(
          { error: { code: "FORBIDDEN", message: "Access denied to this organization" } },
          { status: 403 }
        );
      }

      // Prevent self-removal
      if (memberId === `${authReq.user?.uid}_${orgId}`) {
        return badRequest("Cannot remove yourself from the organization");
      }

      // In production, soft delete or update status in Firestore
      // Consider setting status to 'removed' rather than hard delete for audit trail

      return ok({ message: "Member removed successfully", memberId });
    } catch (error) {
      console.error("Failed to remove member:", error);
      return serverError("Failed to remove member");
    }
  });
}
