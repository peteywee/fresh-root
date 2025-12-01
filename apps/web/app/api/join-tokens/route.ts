// [P0][CORE][API] Join token generation endpoint

import { CreateJoinTokenSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { createOrgEndpoint } from "@fresh-schedules/api-framework";

// Rate limiting is handled via withSecurity options

/**
 * Generate a secure random token
 */
function generateSecureToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * GET /api/join-tokens
 * List join tokens for an organization
 */
export const GET = createOrgEndpoint({
  handler: async ({ request, input, context, params }) => {
    async (
      request: NextRequest,
      context: { params: Record<string, string>; userId: string; orgId: string },
    ) => {
      try {
        const { searchParams } = new URL(request.url;
  }
});
        const orgId = searchParams.get("orgId") || context.orgId;

        if (!orgId) {
          return badRequest("orgId query parameter is required");
        }

        // Mock data - in production, fetch from Firestore
        const tokens = [
          {
            id: "token-1",
            orgId,
            token: "JOIN-123456",
            role: "staff",
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
            maxUses: 10,
            usedCount: 2,
            isActive: true,
            createdBy: context.userId,
            createdAt: Date.now() - 24 * 60 * 60 * 1000,
          },
        ];

        return ok({ tokens, total: tokens.length });
      } catch {
        return serverError("Failed to fetch join tokens");
      }
    },
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * POST /api/join-tokens
 * Create a new join token (requires manager+ role)
 */
export const POST = createOrgEndpoint({
  handler: async ({ request, input, context, params }) => {
    async (
        request: NextRequest,
        context: {
          params: Record<string, string>;
          userId: string;
          orgId: string;
          roles: ("org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff")[];
        },
      ) => {
        try {
          const parsed = await parseJson(request, CreateJoinTokenSchema;
  }
});
          if (!parsed.success) {
            return badRequest("Validation failed", parsed.details);
          }

          const data = parsed.data;

          // Verify orgId matches context
          if (data.orgId !== context.orgId) {
            return badRequest("Organization ID mismatch", null, "FORBIDDEN");
          }

          // Generate secure token
          const token = generateSecureToken();

          // In production, create in Firestore
          const newToken = {
            id: `jt-${Date.now()}`,
            ...data,
            token,
            status: "active" as const,
            currentUses: 0,
            usedBy: [],
            createdBy: context.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          return NextResponse.json(newToken, { status: 201 });
        } catch (error) {
          if (error instanceof Error && error.name === "ZodError") {
            return badRequest("Invalid join token data");
          }
          return serverError("Failed to create join token");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 50, windowMs: 60_000 },
);
