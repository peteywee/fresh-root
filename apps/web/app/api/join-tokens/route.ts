// [P0][JOIN-TOKENS][API] Join tokens endpoint

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError } from "../_shared/validation";
import { CreateJoinTokenSchema } from "@fresh-schedules/types";

/**
 * GET /api/join-tokens
 * List join tokens for organization
 */
export const GET = createOrgEndpoint({
  roles: ["admin"],
  handler: async ({ context, _params }) => {
    try {
      const tokens = [
        {
          id: "token-1",
          orgId: context.org?.orgId,
          token: "abc123def456",
          createdBy: context.auth?.userId,
          createdAt: Date.now(),
          expiresAt: Date.now() + 604800000,
        },
      ];
      return ok({ tokens, total: tokens.length });
    } catch {
      return serverError("Failed to fetch join tokens");
    }
  },
});

/**
 * POST /api/join-tokens
 * Create new join token
 */
export const POST = createOrgEndpoint({
  roles: ["admin"],
  input: CreateJoinTokenSchema,
  handler: async ({ input, context }) => {
    try {
      const token = {
        id: `token-${Date.now()}`,
        orgId: context.org?.orgId,
        token: Math.random().toString(36).substring(2, 15),
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
        expiresAt: input.expiresAt ?? Date.now() + 604800000,
      };
      return ok(token);
    } catch {
      return serverError("Failed to create join token");
    }
  },
});
