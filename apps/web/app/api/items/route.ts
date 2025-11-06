// [P1][API][CODE] Route API route handler
// Tags: P1, API, CODE
import { NextRequest } from "next/server";
import { z } from "zod";

import { requireSession, AuthenticatedRequest } from "../_shared/middleware";
import { parseJson, badRequest, ok, serverError } from "../_shared/validation";

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

export async function POST(req: NextRequest) {
  return requireSession(req as AuthenticatedRequest, async (authReq) => {
    try {
      const parsed = await parseJson(authReq, CreateItemInput);
      if (!parsed.success) {
        return badRequest("Validation failed", parsed.details);
      }
      const { name } = parsed.data;

      // Normally you'd write to Firestore here. We'll simulate a created item.
      const item = {
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
        createdBy: authReq.user?.uid, // Include authenticated user
      };
      return ok(item);
    } catch (e) {
      return serverError(e instanceof Error ? e.message : "Unexpected error");
    }
  });
}

// Optional: GET returns a static list (safe demo)
export async function GET(req: NextRequest) {
  return requireSession(req as AuthenticatedRequest, async (authReq) => {
    return ok([
      {
        id: "demo-1",
        name: "Sample",
        createdAt: 0,
        userId: authReq.user?.uid,
      },
    ]);
  });
}
