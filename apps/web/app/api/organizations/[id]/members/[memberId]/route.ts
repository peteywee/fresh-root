//[P1][API][CODE] Organization Member [memberId] API route handler
// Tags: P1, API, CODE, validation, zod, rbac

import { MembershipUpdateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../../../src/lib/api/authorization";
import { csrfProtection } from "../../../../../../src/lib/api/csrf";
import { rateLimit, RateLimits } from "../../../../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../../../../src/lib/api/sanitize";
import { serverError } from "../../../../_shared/validation";

/**
 * Handles GET requests to `/api/organizations/[id]/members/[memberId]` to retrieve the details of a specific member.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters, including the organization and member IDs.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const GET = rateLimit(RateLimits.STANDARD)(
  requireOrgMembership(async (request: NextRequest, context) => {
    const { params } = context;
    try {
      const { id: orgId, memberId } = await params;
      // In production, fetch from Firestore and check permissions
      const member = {
        id: memberId,
        orgId,
        uid: "user-123",
        roles: ["admin"],
        joinedAt: new Date().toISOString(),
        mfaVerified: true,
        createdAt: new Date().toISOString(),
      };
      return NextResponse.json(member);
    } catch {
      return serverError("Failed to fetch member");
    }
  }),
);

/**
 * Handles PATCH requests to `/api/organizations/[id]/members/[memberId]` to update a member's roles or settings.
 * Requires 'admin' role or higher.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters, including the organization and member IDs.
 * @param {string} context.userId - The ID of the authenticated user.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const PATCH = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    requireOrgMembership(
      requireRole("admin")(async (request: NextRequest, context) => {
        const { params, userId } = context;
        try {
          const { id: orgId, memberId } = await params;

          const body = await request.json();
          const validated = MembershipUpdateSchema.parse(body);
          const sanitized = sanitizeObject(validated);

          // In production: permission checks, update Firestore
          const updatedMember = {
            id: memberId,
            orgId,
            uid: "user-123",
            ...sanitized,
            updatedAt: new Date().toISOString(),
            updatedBy: userId,
          };
          return NextResponse.json(updatedMember);
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json({ error: "Invalid member data" }, { status: 400 });
          }
          return serverError("Failed to update member");
        }
      }),
    ),
  ),
);
// ...existing code...

/**
 * Handles DELETE requests to `/api/organizations/[id]/members/[memberId]` to remove a member from an organization.
 * Requires 'admin' role or higher.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters, including the organization and member IDs.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const DELETE = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    requireOrgMembership(
      requireRole("admin")(async (request: NextRequest, context) => {
        const { params } = context;
        try {
          const { id: orgId, memberId } = params;
          // In production: permission checks, delete from Firestore
          return NextResponse.json({
            message: "Member removed successfully",
            orgId,
            memberId,
          });
        } catch {
          return serverError("Failed to remove member");
        }
      }),
    ),
  ),
);
