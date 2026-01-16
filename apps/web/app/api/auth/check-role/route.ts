// [P0][AUTH][API] Server-side role check endpoint
// Tags: P0, AUTH, API, SECURITY

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";

/**
 * Check user role server-side
 *
 * This endpoint verifies user roles using Firebase custom claims
 * rather than exposing admin email lists in client-side code.
 *
 * Security:
 * - Requires authentication
 * - Role data comes from server-side token verification
 * - No sensitive data exposed to client
 */
export const GET = createAuthenticatedEndpoint({
  handler: async ({ request: _request, input: _input, context, params: _params }) => {
    // Get user claims from verified token (set by Firebase Admin)
    const claims = context.auth?.customClaims || {};

    // Determine role from claims
    // Claims should be set via Firebase Admin SDK when user is granted admin access
    const isAdmin = claims.admin === true || claims.role === "admin";
    const isSuperAdmin = claims.superAdmin === true || claims.role === "super_admin";

    // Determine redirect path based on role
    let redirectPath = "/";

    if (isSuperAdmin || isAdmin) {
      redirectPath = "/dashboard";
    }

    return NextResponse.json({
      isAdmin,
      isSuperAdmin,
      redirectPath,
      // Don't expose the full claims object - only role info
    });
  },
});
