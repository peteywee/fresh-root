// [P1][API][CODE] Route API route handler
// Tags: P1, API, CODE
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { withSecurity } from "../_shared/middleware";
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

/**
 * Handles POST requests to `/api/items` to create a new item.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters.
 * @param {string} context.userId - The ID of the authenticated user.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const POST = withSecurity(
  async (request: NextRequest, context: { params: Record<string, string>; userId: string }) => {
    try {
      const parsed = await parseJson(request, CreateItemInput);
      if (!parsed.success) {
        return badRequest("Validation failed", parsed.details);
      }
      const { name } = parsed.data;
      // Normally you'd write to Firestore here. We'll simulate a created item.
      const item = {
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
        createdBy: context.userId,
      };
      return NextResponse.json(item, { status: 201 });
    } catch (err) {
      // Log the error for debugging; return a generic message to the client
      console.error("POST /api/items error:", err);
      return serverError("Unexpected error");
    }
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);

/**
 * Handles GET requests to `/api/items` to retrieve a list of items.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {object} context - The context object from the router.
 * @param {Record<string, string>} context.params - The route parameters.
 * @param {string} context.userId - The ID of the authenticated user.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export const GET = withSecurity(
  async (request: NextRequest, context: { params: Record<string, string>; userId: string }) => {
    return NextResponse.json([
      {
        id: "demo-1",
        name: "Sample",
        createdAt: 0,
        userId: context.userId,
      },
    ]);
  },
  { requireAuth: true, maxRequests: 100, windowMs: 60_000 },
);
