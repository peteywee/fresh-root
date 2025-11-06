// [P0][API][CODE] Organizations [id] API route handler
// Tags: P0, API, CODE, validation, zod
import { OrganizationUpdateSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../../src/lib/api/authorization";
import { csrfProtection } from "../../../../src/lib/api/csrf";
import { rateLimit, RateLimits } from "../../../../src/lib/api/rate-limit";
import { sanitizeObject } from "../../../../src/lib/api/sanitize";
import { serverError } from "../../_shared/validation";

/**
 * GET /api/organizations/[id]
 * Get organization details
 */
export const GET = rateLimit(RateLimits.STANDARD)(
  requireOrgMembership(async (request: NextRequest, context) => {
    try {
      const { orgId } = context;

      // In production, fetch from database and check permissions
      const organization = {
        id: orgId,
        name: "Acme Corp",
        description: "A great company",
        industry: "Technology",
        size: "51-200",
        createdAt: new Date().toISOString(),
        settings: {
          allowPublicSchedules: false,
          requireShiftApproval: true,
          defaultShiftDuration: 8,
        },
        memberCount: 25,
      };

      return NextResponse.json(organization);
    } catch {
      return serverError("Failed to fetch organization");
    }
  }),
);

/**
 * PATCH /api/organizations/[id]
 * Update organization details (admin only)
 */
export const PATCH = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    requireOrgMembership(
      requireRole("admin")(async (request: NextRequest, context) => {
        try {
          const { orgId } = context;

          // Parse and validate request body
          const body = await request.json();
          const parseResult = OrganizationUpdateSchema.safeParse(body);

          if (!parseResult.success) {
            return NextResponse.json(
              { error: "Validation failed", details: parseResult.error.format() },
              { status: 422 },
            );
          }

          // Sanitize user input
          const sanitized = sanitizeObject(parseResult.data, {
            urlFields: ["website"],
          });

          // In production, update in database after checking permissions
          const updatedOrg = {
            id: orgId,
            name: "Acme Corp",
            ...sanitized,
            updatedAt: new Date().toISOString(),
          };

          return NextResponse.json(updatedOrg);
        } catch {
          return serverError("Failed to update organization");
        }
      }),
    ),
  ),
);

/**
 * DELETE /api/organizations/[id]
 * Delete an organization (org_owner only)
 */
export const DELETE = rateLimit(RateLimits.WRITE)(
  csrfProtection()(
    requireOrgMembership(
      requireRole("org_owner")(async (_request: NextRequest, context) => {
        try {
          const { orgId } = context;

          // In production, check if user is owner and delete from database
          return NextResponse.json({ message: "Organization deleted successfully", id: orgId });
        } catch {
          return serverError("Failed to delete organization");
        }
      }),
    ),
  ),
);
