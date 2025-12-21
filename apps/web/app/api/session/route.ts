// [P0][SESSION][API] Session management endpoint
import { createPublicEndpoint } from "@fresh-schedules/api-framework";
import { z } from "zod";

import { getFirebaseAdminAuth } from "../../../lib/firebase-admin";
import { serverError, ok, unauthorized } from "../_shared/validation";

function isFirebaseAuthFailure(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  if (!("code" in error)) return false;
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" && code.startsWith("auth/");
}

// Schema for session creation
const CreateSessionSchema = z.object({
  idToken: z.string().min(1, "idToken is required"),
});

/**
 * POST /api/session
 * Create a session cookie from a Firebase ID token
 */
export const POST = createPublicEndpoint({
  input: CreateSessionSchema,
  handler: async ({ request: _request, input, context: _context, params: _params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof CreateSessionSchema>;
      const { idToken } = typedInput;

      const auth = getFirebaseAdminAuth();
      // Verify the idToken and create a session cookie (5 days default)
      const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

      // Set secure HttpOnly session cookie
      const response = ok({ ok: true });
      response.cookies.set("session", sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: expiresIn / 1000, // maxAge in seconds
      });

      return response;
    } catch (error) {
      console.error("Session creation error:", error);
      // If Firebase says the token is invalid/expired/etc, that is a 401.
      if (isFirebaseAuthFailure(error)) {
        return unauthorized("Invalid token");
      }

      // Otherwise, treat as internal.
      return serverError("Internal Server Error");
    }
  },
});

/**
 * DELETE /api/session
 * Clear the session cookie (logout)
 */
export const DELETE = createPublicEndpoint({
  handler: async () => {
    // Clear session cookie
    const response = ok({ ok: true });
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  },
});
