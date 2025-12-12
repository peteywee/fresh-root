//[P1][API][AUTH] Authorization and RBAC middleware (improved with typed queries)
// Tags: authorization, rbac, middleware, security

import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { queryWithType } from "@/src/lib/firebase/typed-wrappers";

export type OrgRole = "org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff";

/**
 * Membership document from Firestore
 */
export interface MembershipDoc {
  id: string;
  userId: string;
  orgId: string;
  roles: OrgRole[];
  joinedAt: number;
  status: "active" | "inactive";
  [key: string]: unknown;
}

export function extractOrgId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const orgIndex = pathParts.indexOf("organizations");
  if (orgIndex !== -1 && pathParts[orgIndex + 1]) return pathParts[orgIndex + 1];
  return url.searchParams.get("orgId");
}

export function requireOrgMembership(
  handler: (
    request: NextRequest,
    context: { params: Record<string, string>; userId: string; orgId: string },
  ) => Promise<NextResponse>,
) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    // Resolve params if it's a Promise (Next.js 14+)
    const params = await context.params;

    const userId = request.headers.get("x-user-id");
    if (!userId)
      return NextResponse.json({ error: "Unauthorized - No user session" }, { status: 401 });

    const orgId = extractOrgId(request);
    if (!orgId)
      return NextResponse.json(
        { error: "Bad Request - No organization ID provided" },
        { status: 400 },
      );

    // NOTE: In a full implementation, verify membership in Firestore here.
    return handler(request, { params, userId, orgId });
  };
}

export function requireRole(requiredRole: OrgRole) {
  const hierarchy: OrgRole[] = ["staff", "corporate", "scheduler", "manager", "admin", "org_owner"];
  return function (
    handler: (
      request: NextRequest,
      context: {
        params: Record<string, string>;
        userId: string;
        orgId: string;
        roles: OrgRole[];
      },
    ) => Promise<NextResponse>,
  ) {
    return async (
      request: NextRequest,
      context: {
        params: Record<string, string>;
        userId: string;
        orgId: string;
      },
    ): Promise<NextResponse> => {
      // Minimal: read roles from header for now (e.g., "x-roles: admin,manager")
      const rolesHeader = request.headers.get("x-roles") || "";
      const roles = rolesHeader
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean) as OrgRole[];

      const userLevel = roles.length ? Math.max(...roles.map((r) => hierarchy.indexOf(r))) : -1;
      const requiredLevel = hierarchy.indexOf(requiredRole);
      if (userLevel < requiredLevel) {
        return NextResponse.json(
          { error: `Forbidden - Requires ${requiredRole} role or higher` },
          { status: 403 },
        );
      }

      return handler(request, {
        ...context,
        roles,
      });
    };
  };
}

/**
 * Pure helper: determine if any of the user's roles satisfies the required role by hierarchy
 */
export function hasRequiredRole(userRoles: OrgRole[], requiredRole: OrgRole): boolean {
  const hierarchy: OrgRole[] = ["staff", "corporate", "scheduler", "manager", "admin", "org_owner"];
  const userLevel = userRoles.length ? Math.max(...userRoles.map((r) => hierarchy.indexOf(r))) : -1;
  const requiredLevel = hierarchy.indexOf(requiredRole);
  return userLevel >= requiredLevel;
}

/**
 * Data access: check if a membership document exists for the user in the org
 * Uses typed query wrapper for type safety
 */
export async function isOrgMember(userId: string, orgId: string): Promise<boolean> {
  try {
    const db = getFirestore();
    const membershipsRef = db.collection("memberships");

    // Use typed query to fetch with proper type safety
    const result = await queryWithType<MembershipDoc>(
      db,
      membershipsRef.where("userId", "==", userId).where("orgId", "==", orgId).limit(1),
    );

    return result.success && result.data.length > 0;
  } catch (error) {
    console.error("Error checking org membership:", error);
    return false;
  }
}

/**
 * Data access: retrieve user roles from the membership document
 * Uses typed query wrapper for type safety
 */
export async function getUserRoles(userId: string, orgId: string): Promise<OrgRole[] | null> {
  try {
    const db = getFirestore();
    const membershipsRef = db.collection("memberships");

    // Use typed query to fetch with proper type safety
    const result = await queryWithType<MembershipDoc>(
      db,
      membershipsRef.where("userId", "==", userId).where("orgId", "==", orgId).limit(1),
    );

    if (!result.success || result.data.length === 0) return null;

    const membership = result.data[0];
    return membership.roles || [];
  } catch (error) {
    console.error("Error retrieving user roles:", error);
    return null;
  }
}

/**
 * High-level helper: check access combining membership and role requirement
 * Uses typed data access functions for type safety throughout
 */
export async function canAccessResource(
  userId: string,
  orgId: string,
  requiredRole: OrgRole,
): Promise<{ allowed: boolean; roles?: OrgRole[]; reason?: string }> {
  try {
    const member = await isOrgMember(userId, orgId);
    if (!member) return { allowed: false, reason: "Not a member of organization" };

    const roles = (await getUserRoles(userId, orgId)) || [];
    const allowed = hasRequiredRole(roles, requiredRole);

    if (!allowed) {
      return { allowed: false, roles, reason: `Requires ${requiredRole} role or higher` };
    }

    return { allowed: true, roles };
  } catch (error) {
    console.error("Error checking resource access:", error);
    return { allowed: false, reason: "Internal error checking permissions" };
  }
}
