// [P0][CORE][API] Join token generation endpoint
import { CreateJoinTokenSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

function generateSecureToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export const GET = createAuthenticatedEndpoint({
  org: "required",
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request, context }) => {
    try {
      const { searchParams } = new URL(request.url);
      const orgId = searchParams.get("orgId") || context.org!.orgId;
      const userId = context.auth!.userId;
      if (!orgId) {
        return NextResponse.json({ error: "orgId query parameter is required" }, { status: 400 });
      }
      const tokens = [{
        id: "token-1",
        orgId,
        token: "JOIN-123456",
        role: "staff",
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxUses: 10,
        usedCount: 2,
        isActive: true,
        createdBy: userId,
        createdAt: Date.now() - 24 * 60 * 60 * 1000,
      }];
      return NextResponse.json({ tokens, total: tokens.length }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Failed to fetch join tokens" }, { status: 500 });
    }
  },
});

export const POST = createAuthenticatedEndpoint({
  org: "required",
  roles: ["manager"],
  input: CreateJoinTokenSchema,
  rateLimit: { maxRequests: 50, windowMs: 60_000 },
  handler: async ({ input, context }) => {
    try {
      const data = input;
      const orgId = context.org!.orgId;
      const userId = context.auth!.userId;
      if (data.orgId !== orgId) {
        return NextResponse.json({ error: "Organization ID mismatch" }, { status: 403 });
      }
      const token = generateSecureToken();
      const newToken = {
        id: `jt-${Date.now()}`,
        ...data,
        token,
        status: "active" as const,
        currentUses: 0,
        usedBy: [],
        createdBy: userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return NextResponse.json(newToken, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        return NextResponse.json({ error: "Invalid join token data" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to create join token" }, { status: 500 });
    }
  },
});
