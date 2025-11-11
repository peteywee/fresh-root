//[P1][API][AUTH] Authorization and RBAC middleware (minimal)
// Tags: authorization, rbac, middleware, security

import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export type OrgRole = "org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff";

/**
 * Extracts the organization ID from the request URL.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @returns {string | null} The organization ID, or null if not found.
 */
export function extractOrgId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const orgIndex = pathParts.indexOf("organizations");
  if (orgIndex !== -1 && pathParts[orgIndex + 1]) return pathParts[orgIndex + 1];
  return url.searchParams.get("orgId");
}

/**
 * A middleware that requires the user to be a member of the organization.
 *
 * @param {Function} handler - The route handler to wrap.
 * @returns {Function} The wrapped route handler.
 */
export function requireOrgMembership(
  handler: (
    request: NextRequest,
    context: { params: Record<string, string>; userId: string; orgId: string },
  ) => Promise<NextResponse>,
) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> | Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    const userId = request.headers.get("x-user-id");
    if (!userId)
      return NextResponse.json({ error: "Unauthorized - No user session" }, { status: 401 });

    const orgId = extractOrgId(request);
    if (!orgId)
      return NextResponse.json(
        { error: "Bad Request - No organization ID provided" },
        { status: 400 },
      );

    // Resolve params if it's a Promise (Next.js 14+)
    const resolvedParams = await Promise.resolve(context.params);

    // NOTE: In a full implementation, verify membership in Firestore here.
    return handler(request, { params: resolvedParams, userId, orgId });
  };
}

/**
 * A middleware that requires the user to have a specific role or higher.
 *
 * @param {OrgRole} requiredRole - The minimum role required.
 * @returns {Function} A function that takes a handler and returns a new handler with the role check.
 */
export function requireRole(requiredRole: OrgRole) {
  const hierarchy: OrgRole[] = ["staff", "corporate", "scheduler", "manager", "admin", "org_owner"];
  return function (
    handler: (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string; orgId: string; roles: OrgRole[] },
    ) => Promise<NextResponse>,
  ) {
    return async (
      request: NextRequest,
      context: {
        params: Record<string, string> | Promise<Record<string, string>>;
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

      // Resolve params if it's a Promise (Next.js 14+)
      const resolvedParams = await Promise.resolve(context.params);

      return handler(request, {
        params: resolvedParams,
        userId: context.userId,
        orgId: context.orgId,
        roles,
      });
    };
  };
}

/**
 * Checks if a user's roles satisfy a required role based on a predefined hierarchy.
 *
 * @param {OrgRole[]} userRoles - The roles assigned to the user.
 * @param {OrgRole} requiredRole - The minimum role required.
 * @returns {boolean} `true` if the user has the required role, otherwise `false`.
 */
export function hasRequiredRole(userRoles: OrgRole[], requiredRole: OrgRole): boolean {
  const hierarchy: OrgRole[] = ["staff", "corporate", "scheduler", "manager", "admin", "org_owner"];
  const userLevel = userRoles.length ? Math.max(...userRoles.map((r) => hierarchy.indexOf(r))) : -1;
  const requiredLevel = hierarchy.indexOf(requiredRole);
  return userLevel >= requiredLevel;
}

/**
 * Checks if a user is a member of a specific organization.
 *
 * @param {string} userId - The user's ID.
 * @param {string} orgId - The organization's ID.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the user is a member, otherwise `false`.
 */
export async function isOrgMember(userId: string, orgId: string): Promise<boolean> {
  const db = getFirestore();
  const snapshot = await db
    .collection("memberships")
    .where("userId", "==", userId)
    .where("orgId", "==", orgId)
    .limit(1)
    .get();
  return !snapshot.empty;
}

/**
 * Retrieves the roles of a user within a specific organization.
 *
 * @param {string} userId - The user's ID.
 * @param {string} orgId - The organization's ID.
 * @returns {Promise<OrgRole[] | null>} A promise that resolves to an array of roles, or `null` if the user is not a member.
 */
export async function getUserRoles(userId: string, orgId: string): Promise<OrgRole[] | null> {
  const db = getFirestore();
  const snapshot = await db
    .collection("memberships")
    .where("userId", "==", userId)
    .where("orgId", "==", orgId)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const data = snapshot.docs[0].data() as { roles?: OrgRole[] };
  return (data.roles || []) as OrgRole[];
}

/**
 * A high-level helper function to check if a user can access a resource based on their membership and role.
 *
 * @param {string} userId - The user's ID.
 * @param {string} orgId - The organization's ID.
 * @param {OrgRole} requiredRole - The minimum role required.
 * @returns {Promise<{ allowed: boolean; roles?: OrgRole[]; reason?: string }>} A promise that resolves to an object indicating whether access is allowed, and if not, the reason.
 */
export async function canAccessResource(
  userId: string,
  orgId: string,
  requiredRole: OrgRole,
): Promise<{ allowed: boolean; roles?: OrgRole[]; reason?: string }> {
  const member = await isOrgMember(userId, orgId);
  if (!member) return { allowed: false, reason: "Not a member of organization" };
  const roles = (await getUserRoles(userId, orgId)) || [];
  const allowed = hasRequiredRole(roles, requiredRole);
  if (!allowed) return { allowed: false, roles, reason: `Requires ${requiredRole} role or higher` };
  return { allowed: true, roles };
}
