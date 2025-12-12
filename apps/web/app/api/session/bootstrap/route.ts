// [P0][SESSION][BOOTSTRAP][API] Bootstrap session endpoint
// Tags: P0, SESSION, BOOTSTRAP, API, SDK_FACTORY

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { z } from "zod";
import { NextResponse } from "next/server";

// Session bootstrap schema
const SessionBootstrapSchema = z.object({
  preferences: z.record(z.string(), z.unknown()).optional(),
  deviceInfo: z.object({
    userAgent: z.string().optional(),
    platform: z.string().optional(),
  }).optional(),
});

type SessionBootstrap = z.infer<typeof SessionBootstrapSchema>;

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
      return NextResponse.json({ error: { code: "INTERNAL_ERROR", message } }, { status: 500 });
    }
  },
});

/**
 * POST /api/session/bootstrap
 * Create new session with preferences
 */
export const POST = createAuthenticatedEndpoint({
  input: SessionBootstrapSchema,
  handler: async ({ input, context }: { input: SessionBootstrap; context: any }) => {
    try {
      const session = {
        userId: context.auth?.userId,
        email: context.auth?.email,
        createdAt: Date.now(),
        preferences: input.preferences,
        deviceInfo: input.deviceInfo,
      };
      return NextResponse.json(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create session";
      console.error("Session creation failed", {
        error: message,
        userId: context.auth?.userId,
      });
      return NextResponse.json({ error: { code: "INTERNAL_ERROR", message } }, { status: 500 });
    }
  },
});
