// [P0][SESSION][BOOTSTRAP][API] Bootstrap session endpoint

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
// [P0][SESSION][BOOTSTRAP][API] Bootstrap session endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { z } from "zod";
import { ok, serverError } from "../../_shared/validation";

const CreateSessionSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

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
        ...(input?.metadata || {}),
      };
      return ok(session);
    } catch {
      return serverError("Failed to create session");
    }
  },
});
// [P0][SESSION][BOOTSTRAP][API] Bootstrap session endpoint

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { z } from "zod";
import { ok, serverError } from "../../_shared/validation";
import { z } from "zod";

// Minimal permissive session payload schema for bootstrap route
const CreateSessionSchema = z.object({}).passthrough().optional();

const CreateSessionSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

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
<<<<<<< HEAD
        ...(input?.metadata || {}),
=======
        // input will be injected by the SDK factory into handler as `input`
>>>>>>> pr-128
      };
      // Note: CreateSessionSchema validates incoming payload via `input` param
      // If you need to access optional fields from the request body, use `input`.
      return ok(session);
    } catch {
      return serverError("Failed to create session");
    }
  },
});
