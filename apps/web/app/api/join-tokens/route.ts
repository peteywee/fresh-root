// [P1][API][JOIN_TOKENS] Join tokens API route handler
// Tags: P1, API, JOIN_TOKENS, validation, zod

import { CreateJoinTokenSchema } from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { withSecurity } from "../_shared/middleware";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

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
export const GET = withSecurity(
  requireOrgMembership(
    requireRole("manager")(
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
          const { searchParams } = new URL(request.url);
          const orgId = searchParams.get("orgId") || context.orgId;
          const status = searchParams.get("status");

          if (!orgId) {
            return badRequest("orgId query parameter is required");
          }

          // Mock data - in production, fetch from Firestore
          const tokens = [
            {
              id: "jt-1",
              orgId,
              token: "abc123def456xyz789",
              defaultRoles: ["staff"],
              status: "active",
              maxUses: 10,
              currentUses: 3,
              usedBy: ["user1", "user2", "user3"],
              expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
              description: "General staff invitation",
              createdBy: context.userId,
              createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
              updatedAt: Date.now(),
            },
          ];

          const filtered = status ? tokens.filter((t) => t.status === status) : tokens;

          return ok({ tokens: filtered, total: filtered.length });
        } catch {
          return serverError("Failed to fetch join tokens");
        }
      },
    ),
  ),
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * POST /api/join-tokens
 * Create a new join token (requires admin+ role)
 */
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("admin")(
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
          const parsed = await parseJson(request, CreateJoinTokenSchema);
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
