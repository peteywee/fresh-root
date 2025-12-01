// [P0][CORE][API] Item management endpoint
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { parseJson, badRequest, serverError } from "../_shared/validation";

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

// Rate limiting via withSecurity options

export const POST = createAuthenticatedEndpoint({
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request, input, context, params }) => {
    try {
      const parsed = await parseJson(request, CreateItemInput);
      if (!parsed.success) {
        return badRequest("Validation failed", parsed.details);
      }
      const { name } = parsed.data;
      const item = {
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
        createdBy: context.userId,
      };
      return NextResponse.json(item, { status: 201 });
    } catch (err) {
      console.error("POST /api/items error:", err);
      return serverError("Unexpected error");
    }
  },
});

// Optional: GET returns a static list (safe demo)
export const GET = createAuthenticatedEndpoint({
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request, input, context, params }) => {
    return NextResponse.json([
      {
        id: "demo-1",
        name: "Sample",
        createdAt: 0,
        userId: context.userId,
      },
    ]);
  },
});
