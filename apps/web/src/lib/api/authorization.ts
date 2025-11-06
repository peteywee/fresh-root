//[P1][API][AUTH] Authorization and RBAC middleware
// Tags: authorization, rbac, middleware, security

import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import type { OrgRole } from "@workspace/types";

/**
 * Authorization error with status code
 */
export class AuthorizationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 403,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Extract organization ID from request URL or body
 */
export function extractOrgId(request: NextRequest): string | null {
  // Try URL params first (e.g., /api/organizations/[id])
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const orgIndex = pathParts.indexOf("organizations");
  if (orgIndex !== -1 && pathParts[orgIndex + 1]) {
    return pathParts[orgIndex + 1];
  }

  // Try query params
  const orgIdParam = url.searchParams.get("orgId");
  if (orgIdParam) return orgIdParam;

  return null;
}

/**
 * Check if user is a member of the organization
 */
export async function isOrgMember(userId: string, orgId: string): Promise<boolean> {
  const db = getFirestore();

  const membershipSnap = await db
    .collection("memberships")
    .where("userId", "==", userId)
    .where("orgId", "==", orgId)
    .limit(1)
    .get();

  return !membershipSnap.empty;
}

/**
 * Get user's roles in organization
 */
export async function getUserRoles(userId: string, orgId: string): Promise<OrgRole[] | null> {
  const db = getFirestore();

  const membershipSnap = await db
    .collection("memberships")
    .where("userId", "==", userId)
    .where("orgId", "==", orgId)
    .limit(1)
    .get();

  if (membershipSnap.empty) return null;

  const membership = membershipSnap.docs[0].data();
  return membership.roles as OrgRole[];
}

/**
 * Check if user has required role
 * Role hierarchy: org_owner > admin > manager > scheduler > staff
 */
export function hasRequiredRole(userRoles: OrgRole[], requiredRole: OrgRole): boolean {
  const hierarchy: OrgRole[] = ["staff", "scheduler", "manager", "admin", "org_owner"];
  const userLevel = Math.max(...userRoles.map((role) => hierarchy.indexOf(role)));
  const requiredLevel = hierarchy.indexOf(requiredRole);

  return userLevel >= requiredLevel;
}

/**
 * Middleware: Require user to be a member of the organization
 * Usage: wrap your handler with this middleware
 */
export function requireOrgMembership(
  handler: (
    request: NextRequest,
    context: { params: Record<string, string>; userId: string; orgId: string },
  ) => Promise<NextResponse>,
) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> },
  ): Promise<NextResponse> => {
    // Extract user ID from session (should be set by requireSession middleware)
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - No user session" }, { status: 401 });
    }

    // Extract organization ID
    const orgId = extractOrgId(request);
    if (!orgId) {
      return NextResponse.json(
        { error: "Bad Request - No organization ID provided" },
        { status: 400 },
      );
    }

    // Check membership
    const isMember = await isOrgMember(userId, orgId);
    if (!isMember) {
      return NextResponse.json(
        {
          error: "Forbidden - You are not a member of this organization",
          orgId,
        },
        { status: 403 },
      );
    }

    // Pass userId and orgId to handler
    return handler(request, { ...context, userId, orgId });
  };
}

/**
 * Middleware: Require user to have a specific role or higher
 * Must be used AFTER requireOrgMembership
 */
export function requireRole(requiredRole: OrgRole) {
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
      context: { params: Record<string, string>; userId: string; orgId: string },
    ): Promise<NextResponse> => {
      const { userId, orgId } = context;

      // Get user's roles
      const userRoles = await getUserRoles(userId, orgId);
      if (!userRoles) {
        return NextResponse.json(
          { error: "Forbidden - No roles found in organization" },
          { status: 403 },
        );
      }

      // Check if user has required role
      if (!hasRequiredRole(userRoles, requiredRole)) {
        return NextResponse.json(
          {
            error: `Forbidden - Requires ${requiredRole} role or higher`,
            requiredRole,
            userRoles,
          },
          { status: 403 },
        );
      }

      // Pass roles to handler
      return handler(request, { ...context, roles: userRoles });
    };
  };
}

/**
 * Middleware: Require user to be owner of a resource
 * For resources that have a userId field
 */
export function requireOwnership(
  getResourceUserId: (
    request: NextRequest,
    context: { params: Record<string, string> },
  ) => Promise<string | null>,
) {
  return function (
    handler: (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string },
    ) => Promise<NextResponse>,
  ) {
    return async (
      request: NextRequest,
      context: { params: Record<string, string> },
    ): Promise<NextResponse> => {
      const userId = request.headers.get("x-user-id");
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized - No user session" }, { status: 401 });
      }

      const resourceUserId = await getResourceUserId(request, context);
      if (!resourceUserId) {
        return NextResponse.json({ error: "Not Found - Resource not found" }, { status: 404 });
      }

      if (userId !== resourceUserId) {
        return NextResponse.json(
          { error: "Forbidden - You do not own this resource" },
          { status: 403 },
        );
      }

      return handler(request, { ...context, userId });
    };
  };
}

/**
 * Helper: Check if user can access a resource in an organization
 * Combines membership and role checks
 */
export async function canAccessResource(
  userId: string,
  orgId: string,
  requiredRole: OrgRole = "staff",
): Promise<{ allowed: boolean; roles?: OrgRole[]; reason?: string }> {
  const isMember = await isOrgMember(userId, orgId);
  if (!isMember) {
    return { allowed: false, reason: "Not a member of organization" };
  }

  const userRoles = await getUserRoles(userId, orgId);
  if (!userRoles) {
    return { allowed: false, reason: "No roles found" };
  }

  if (!hasRequiredRole(userRoles, requiredRole)) {
    return {
      allowed: false,
      roles: userRoles,
      reason: `Requires ${requiredRole} role or higher`,
    };
  }

  return { allowed: true, roles: userRoles };
}
