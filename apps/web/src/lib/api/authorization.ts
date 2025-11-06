//[P1][API][AUTH] Authorization and RBAC middleware (minimal)
// Tags: authorization, rbac, middleware, security

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export type OrgRole = "org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff";

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
    context: { params: Record<string, string> },
  ): Promise<NextResponse> => {
    const userId = request.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized - No user session" }, { status: 401 });

    const orgId = extractOrgId(request);
    if (!orgId) return NextResponse.json({ error: "Bad Request - No organization ID provided" }, { status: 400 });

    // NOTE: In a full implementation, verify membership in Firestore here.
    return handler(request, { ...context, userId, orgId });
  };
}

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
      context: { params: Record<string, string>; userId: string; orgId: string },
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
        return NextResponse.json({ error: `Forbidden - Requires ${requiredRole} role or higher` }, { status: 403 });
      }

      return handler(request, { ...context, roles });
    };
  };
}
