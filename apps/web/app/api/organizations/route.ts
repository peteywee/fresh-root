// [P0][ORGS][API] Organizations list endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { CreateOrganizationSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { badRequest, ok, serverError } from "../_shared/validation";

// Rate limiting via factory options

/**
 * GET /api/organizations
 * List organizations the current user belongs to
 */
export const GET = createAuthenticatedEndpoint({
  rateLimit: { maxRequests: 100, windowMs: 60000 },
  handler: async ({ request, context }) => {
    try {
      const { _searchParams } = new URL(request.url);
      const userId = context.auth?.userId;

      if (!userId) {
        return badRequest("userId is required");
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
});

/**
 * POST /api/organizations
 * Create a new organization
 */
export const POST = createAuthenticatedEndpoint({
  rateLimit: { maxRequests: 50, windowMs: 60000 },
  input: CreateOrganizationSchema,
  handler: async ({ input, context }) => {
    try {
      const data = input as Record<string, unknown>;
      const created = {
        id: `org-${Date.now()}`,
        name: data.name,
        slug: data.slug,
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
      };
      return NextResponse.json(created, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return badRequest("Invalid organization data");
      }
      return serverError("Failed to create organization");
    }
  },
});
