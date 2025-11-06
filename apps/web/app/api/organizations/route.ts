// [P0][API][CODE] Route API route handler
// Tags: P0, API, CODE
import { NextRequest } from "next/server";
import { z } from "zod";

import { parseJson, badRequest, ok, serverError } from "../_shared/validation";

// Schema for creating an organization
const CreateOrgSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  industry: z.string().optional(),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]).optional(),
});

/**
 * GET /api/organizations
 * List organizations the current user belongs to
 */
export async function GET(_request: NextRequest) {
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
      },
      {
        id: "org-2",
        name: "Tech Startup",
        description: "Innovative solutions",
        role: "manager",
        createdAt: new Date().toISOString(),
        memberCount: 10,
      },
    ];

    return ok({ organizations });
  } catch {
    return serverError("Failed to fetch organizations");
  }
}

/**
 * POST /api/organizations
 * Create a new organization
 */
export async function POST(request: NextRequest) {
  try {
    const parsed = await parseJson(request, CreateOrgSchema);

    if (!parsed.success) {
      return badRequest("Validation failed", parsed.details);
    }

    // In production, create organization in database
    const newOrg = {
      id: `org-${Date.now()}`,
      ...parsed.data,
      role: "admin", // Creator is admin
      createdAt: new Date().toISOString(),
      memberCount: 1,
    };

    return ok(newOrg);
  } catch {
    return serverError("Failed to create organization");
  }
}
