// [P0][JOIN-TOKENS][API] Join tokens endpoint

import { randomBytes } from "node:crypto";
import { z } from "zod";
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateJoinTokenSchema } from "@fresh-schedules/types";

import { badRequest, forbidden, ok, serverError } from "../_shared/validation";

/**
 * GET /api/join-tokens
 * List join tokens for organization
 */
export const GET = createOrgEndpoint({
  roles: ["admin"],
  handler: async ({ request: _request, input: _input, context, params: _params }) => {
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
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof CreateJoinTokenSchema>;
      const orgId = context.org?.orgId;
      if (!orgId) {
        return badRequest("Organization context is required");
      }
      if (typedInput.orgId !== orgId) {
        return forbidden("orgId does not match organization context");
      }
      const token = {
        id: `token-${Date.now()}`,
        orgId,
        token: randomBytes(24).toString("hex"),
        createdBy: context.auth?.userId,
        createdAt: Date.now(),
        expiresAt: typedInput.expiresAt ?? Date.now() + 604800000,
      };
      return ok(token);
    } catch {
      return serverError("Failed to create join token");
    }
  },
});
