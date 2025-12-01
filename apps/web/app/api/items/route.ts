// [P0][CORE][API] Item management endpoint
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

/**
 * A simple example endpoint to demonstrate:
 * - Zod validation
 * - Standard error shape
 * - Returning JSON
 * - Session authentication
 */
const CreateItemInput = z.object({
  name: z.string().min(1, "name is required"),
});

export const POST = createAuthenticatedEndpoint({
  input: CreateItemInput,
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ input, context }) => {
    try {
      const { name } = input;
      const item = {
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
        createdBy: context.auth?.userId,
      };
      return NextResponse.json(item, { status: 201 });
    } catch (err) {
      console.error("POST /api/items error:", err);
      return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
  },
});

export const GET = createAuthenticatedEndpoint({
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ context }) => {
    return NextResponse.json([
      {
        id: "demo-1",
        name: "Sample",
        createdAt: 0,
        userId: context.auth?.userId,
      },
    ], { status: 200 });
  },
});
