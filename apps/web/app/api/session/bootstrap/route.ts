// [P0][SESSION][BOOTSTRAP][API] Bootstrap session endpoint

import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { ok, serverError } from "../../_shared/validation";
import { CreateSessionSchema } from "@fresh-schedules/types";

/**
 * GET /api/session/bootstrap
 * Bootstrap authenticated session
 */
export const GET = createAuthenticatedEndpoint({
  handler: async ({ context }) => {
    try {
      const session = {
        userId: context.auth?.userId,
        email: context.auth?.email,
        emailVerified: context.auth?.emailVerified,
        authenticated: true,
      };
      return ok(session);
    } catch {
      return serverError("Failed to bootstrap session");
    }
  },
});

/**
 * POST /api/session/bootstrap
 * Create new session
 */
export const POST = createAuthenticatedEndpoint({
  input: CreateSessionSchema,
  handler: async ({ input, context }) => {
    try {
      const session = {
        userId: input?.userId || context.auth?.userId,
        email: input?.email || context.auth?.email,
        createdAt: Date.now(),
        ...(input?.metadata ? { metadata: input.metadata } : {}),
      };
      return ok(session);
    } catch {
      return serverError("Failed to create session");
    }
  },
});
