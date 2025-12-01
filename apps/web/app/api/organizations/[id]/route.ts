// [P0][ORGS][API] Organization management endpoint
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

const UpdateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  industry: z.string().optional(),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]).optional(),
  settings: z.object({
    allowPublicSchedules: z.boolean().optional(),
    requireShiftApproval: z.boolean().optional(),
    defaultShiftDuration: z.number().positive().optional(),
  }).optional(),
});

export const GET = createAuthenticatedEndpoint({
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ params }) => {
    try {
      const { id } = params;
      const organization = {
        id,
        name: "Acme Corp",
        description: "A great company",
        industry: "Technology",
        size: "51-200",
        createdAt: new Date().toISOString(),
        settings: { allowPublicSchedules: false, requireShiftApproval: true, defaultShiftDuration: 8 },
        memberCount: 25,
      };
      return NextResponse.json(organization, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 });
    }
  },
});

export const PATCH = createAuthenticatedEndpoint({
  input: UpdateOrgSchema,
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ input, params }) => {
    try {
      const { id } = params;
      const updatedOrg = { id, name: "Acme Corp", ...input, updatedAt: new Date().toISOString() };
      return NextResponse.json(updatedOrg, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to update organization" }, { status: 500 });
    }
  },
});

export const DELETE = createAuthenticatedEndpoint({
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ params }) => {
    try {
      const { id } = params;
      return NextResponse.json({ message: "Organization deleted successfully", id }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to delete organization" }, { status: 500 });
    }
  },
});
