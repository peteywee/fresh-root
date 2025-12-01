// [P0][ORGS][API] Organizations list endpoint
import { CreateOrganizationSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

export const GET = createAuthenticatedEndpoint({
  org: "optional",
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request, context }) => {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get("userId") || context.auth?.userId;
      if (!userId) {
        return NextResponse.json({ error: "userId query parameter is required" }, { status: 400 });
      }
      const organizations = [{
        id: "org-1",
        name: "Acme Corp",
        slug: "acme-corp",
        role: "admin",
        memberCount: 15,
        logoUrl: null,
        createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
      }];
      return NextResponse.json({ organizations, total: organizations.length }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
    }
  },
});

export const POST = createAuthenticatedEndpoint({
  input: CreateOrganizationSchema,
  rateLimit: { maxRequests: 50, windowMs: 60_000 },
  handler: async ({ input, context }) => {
    try {
      const data = input;
      const newOrg = {
        id: `org-${Date.now()}`,
        ...data,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        role: "admin" as const,
        ownerId: context.auth!.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        memberCount: 1,
      };
      return NextResponse.json(newOrg, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ error: "Invalid organization data" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
    }
  },
});
