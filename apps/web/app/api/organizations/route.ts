// [P0][ORGS][API] Organizations list endpoint

import { CreateOrganizationSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership } from "../../../src/lib/api";
import { withSecurity } from "../_shared/middleware";
import { badRequest, ok, parseJson, serverError } from "../_shared/validation";

// Rate limiting via withSecurity

/**
 * GET /api/organizations
 * List organizations the current user belongs to
 */
export const GET = withSecurity(
  requireOrgMembership(
    async (request: NextRequest, context: { params: Record<string, string>; userId: string }) => {
      try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId") || context.userId;

        if (!userId) {
          return badRequest("userId query parameter is required");
        }

        // Mock data - in production, fetch from Firestore scoped by user
        const organizations = [
          {
            id: "org-1",
            name: "Acme Corp",
            slug: "acme-corp",
            role: "admin",
            memberCount: 15,
            logoUrl: null,
            createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
            updatedAt: Date.now(),
          },
        ];

        return ok({ organizations, total: organizations.length });
      } catch {
        return serverError("Failed to fetch organizations");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * POST /api/organizations
 * Create a new organization
 */
export const POST = withSecurity(
  async (request: NextRequest, context: { params: Record<string, string>; userId: string }) => {
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

      const data = parsed.data;
      const newOrg = {
        id: `org-${Date.now()}`,
        ...data,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        role: "admin" as const,
        ownerId: context.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        memberCount: 1,
      };

      return NextResponse.json(newOrg, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return badRequest("Invalid organization data");
      }
      return serverError("Failed to create organization");
    }
  },
  { requireAuth: true, maxRequests: 50, windowMs: 60_000 },
);
