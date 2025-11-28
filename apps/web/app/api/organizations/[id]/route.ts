// [P0][API][ORGANIZATIONS] Organizations detail API route handler
// Tags: P0, API, ORGANIZATIONS, validation, zod
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { withSecurity } from "../../_shared/middleware";
import { parseJson, badRequest, serverError } from "../../_shared/validation";

// Schema for updating organization
const UpdateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  industry: z.string().optional(),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]).optional(),
  settings: z
    .object({
      allowPublicSchedules: z.boolean().optional(),
      requireShiftApproval: z.boolean().optional(),
      defaultShiftDuration: z.number().positive().optional(),
    })
    .optional(),
});

// Rate limiting via withSecurity

/**
 * GET /api/organizations/[id]
 * Get organization details
 */
export const GET = withSecurity(
  async (_request: NextRequest, context: { params: Record<string, string>; userId: string }) => {
    try {
      const { id } = context.params;
      // In production, fetch from database and check permissions
      const organization = {
        id,
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
    } catch (_error) {
      return serverError("Failed to fetch organization");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * PATCH /api/organizations/[id]
 * Update organization details
 */
export const PATCH = withSecurity(
  async (request: NextRequest, context: { params: Record<string, string>; userId: string }) => {
    try {
      const { id } = context.params;
      const parsed = await parseJson(request, UpdateOrgSchema);
      if (!parsed.success) {
        return badRequest("Validation failed", parsed.details);
      }
      // In production, update in database after checking permissions
      const updatedOrg = {
        id,
        name: "Acme Corp",
        ...parsed.data,
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json(updatedOrg);
    } catch (_error) {
      return serverError("Failed to update organization");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * DELETE /api/organizations/[id]
 * Delete an organization (admin only)
 */
export const DELETE = withSecurity(
  async (_request: NextRequest, context: { params: Record<string, string>; userId: string }) => {
    try {
      const { id } = context.params;
      // In production, check if user is admin and delete from database
      return NextResponse.json({ message: "Organization deleted successfully", id });
    } catch {
      return serverError("Failed to delete organization");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);
