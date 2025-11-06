//[P1][API][CODE] Organization Members API route handler
// Tags: P1, API, CODE, validation, zod, rbac

import { MembershipCreateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../../src/lib/api/authorization";
import { csrfProtection } from "../../../../../src/lib/api/csrf";
import { rateLimit, RateLimits } from "../../../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../../../src/lib/api/sanitize";
import { serverError } from "../../../_shared/validation";

/**
 * GET /api/organizations/[id]/members
 * List members of an organization
 */
export const GET = rateLimit(RateLimits.STANDARD)(
  requireOrgMembership(async (request: NextRequest, context) => {
    const { params } = context;
    try {
      const { id: orgId } = await params;

      // In production, fetch from Firestore filtered by orgId
      const members = [
        {
          id: "mem-1",
          orgId,
          uid: "user-123",
          roles: ["admin"],
          joinedAt: new Date().toISOString(),
          mfaVerified: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "mem-2",
          orgId,
          uid: "user-456",
          roles: ["manager"],
          joinedAt: new Date().toISOString(),
          mfaVerified: false,
          createdAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({ members });
    } catch {
      return serverError("Failed to fetch members");
    }
  }),
);

/**
 * POST /api/organizations/[id]/members
 * Add a member to an organization (admin+ only)
 */
export const POST = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    requireOrgMembership(
      requireRole("admin")(async (request: NextRequest, context) => {
        const { params } = context;
        try {
          const { id: orgId } = await params;

          const body = await request.json();
          const validated = MembershipCreateSchema.parse(body);
          const sanitized = sanitizeObject(validated);

          // In production:
          // 1. Verify requester has permission to add members
          // 2. Verify user being added exists
          // 3. Check if user is already a member
          // 4. Create membership in Firestore

          const newMember = {
            id: `mem-${Date.now()}`,
            orgId,
            ...sanitized,
            joinedAt: new Date().toISOString(),
            invitedBy: context.userId,
            createdAt: new Date().toISOString(),
          };

          return NextResponse.json(newMember, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return NextResponse.json({ error: "Invalid member data" }, { status: 400 });
          }
          return serverError("Failed to add member");
        }
      }),
    ),
  ),
);
