// [P0][SESSION][API] Session management endpoint
import { NextRequest } from "next/server";
import { z } from "zod";

import { getFirebaseAdminAuth } from "../../../lib/firebase-admin";
import { withSecurity } from "../_shared/middleware";
import { parseJson, badRequest, serverError, ok } from "../_shared/validation";

// Schema for session creation
const CreateSessionSchema = z.object({
  idToken: z.string().min(1, "idToken is required"),
});

/**
 * POST /api/session
 * Create a session cookie from a Firebase ID token
 */
export const POST = withSecurity(async (req: NextRequest) => {
  try {
    const parsed = await parseJson(req, CreateSessionSchema);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.details);
    }

    const { idToken } = parsed.data;

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
    // Return a generic message to avoid leaking internal error details
    return serverError("Invalid token or internal error", undefined, "UNAUTHORIZED");
  }
});

/**
 * DELETE /api/session
 * Clear the session cookie (logout)
 */
export const DELETE = withSecurity(async () => {
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
});
