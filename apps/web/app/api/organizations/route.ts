// [P0][API][CODE] Route API route handler
// Tags: P0, API, CODE
import { CreateOrganizationSchema } from "@fresh-schedules/types";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { withSecurity } from "../_shared/middleware";
import { parseJson, serverError } from "../_shared/validation";

// Rate limiting via withSecurity

/**
 * GET /api/organizations
 * List organizations the current user belongs to
 */
export const GET = withSecurity(
  async (request: NextRequest, context: { params: Record<string, string>; userId?: string }) => {
    try {
      // In production, fetch from database based on authenticated user
      const organizations = [
        {
          id: "org-1",
          name: "Acme Corp",
          description: "A great company",
          role: "admin",
          createdAt: new Date().toISOString(),
          memberCount: 25,
          ownerId: context.userId,
        },
        {
          id: "org-2",
          name: "Tech Startup",
          description: "Innovative solutions",
          role: "manager",
          createdAt: new Date().toISOString(),
          memberCount: 10,
          ownerId: context.userId,
        },
      ];
      return NextResponse.json({ organizations, userId: context.userId });
    } catch {
      return serverError("Failed to fetch organizations");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * POST /api/organizations
 * Create a new organization
 */
export const POST = withSecurity(
  async (request: NextRequest, context: { params: Record<string, string>; userId?: string }) => {
    try {
      const parsed = await parseJson(request, CreateOrganizationSchema);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid organization data",
              details: parsed.details,
            },
          },
          { status: 422 },
        );
      }
      // In production, create organization in database
      const data = parsed.data;
      const newOrg = {
        id: `org-${Date.now()}`,
        ...data,
        role: "admin", // Creator is admin
        ownerId: context.userId,
        createdAt: new Date().toISOString(),
        memberCount: 1,
      };
      return NextResponse.json(newOrg, { status: 201 });
    } catch {
      return serverError("Failed to create organization");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);
