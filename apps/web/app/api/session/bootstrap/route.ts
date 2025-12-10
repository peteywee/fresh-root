// [P0][SESSION][BOOTSTRAP][API] Bootstrap session endpoint
// Tags: P0, SESSION, BOOTSTRAP, API, SDK_FACTORY

import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
<<<<<<< HEAD
import { SessionBootstrapSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";
=======
import { ok, serverError } from "../../_shared/validation";
import { CreateSessionSchema } from "@fresh-schedules/types";
>>>>>>> origin/dev

/**
 * GET /api/session/bootstrap
 * Bootstrap authenticated session (no input validation needed for GET)
 */
export const GET = createAuthenticatedEndpoint({
  handler: async ({ context }) => {
    try {
      const session = {
        userId: context.auth?.userId,
        email: context.auth?.email,
        emailVerified: context.auth?.emailVerified,
        authenticated: true,
        bootstrapAt: Date.now(),
      };
      return NextResponse.json(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to bootstrap session";
      console.error("Session bootstrap failed", {
        error: message,
        userId: context.auth?.userId,
      });
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message } },
        { status: 500 }
      );
    }
  },
});

/**
 * POST /api/session/bootstrap
 * Create new session
 */
export const POST = createAuthenticatedEndpoint({
<<<<<<< HEAD
  input: SessionBootstrapSchema,
  handler: async ({ input, context }) => {
    try {
      const session = {
        userId: context.auth?.userId,
        email: context.auth?.email,
        idToken: input.idToken,
        redirectUrl: input.redirectUrl,
        orgId: input.orgId,
        createdAt: Date.now(),
=======
  input: CreateSessionSchema,
  handler: async ({ input, context }) => {
    try {
      const session = {
        userId: input?.userId || context.auth?.userId,
        email: input?.email || context.auth?.email,
        createdAt: Date.now(),
        ...(input?.metadata ? { metadata: input.metadata } : {}),
>>>>>>> origin/dev
      };
      return NextResponse.json(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create session";
      console.error("Session creation failed", {
        error: message,
        userId: context.auth?.userId,
      });
      return NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message } },
        { status: 500 }
      );
    }
  },
});
