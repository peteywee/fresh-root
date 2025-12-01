// [P0][SESSION][API] Session management endpoint
import { z } from "zod";
import { NextResponse } from "next/server";
import { createPublicEndpoint } from "@fresh-schedules/api-framework";

import { getFirebaseAdminAuth } from "../../../lib/firebase-admin";

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
  handler: async ({ input }) => {
    try {
      const { idToken } = input;

      const auth = getFirebaseAdminAuth();
      // Verify the idToken and create a session cookie (5 days default)
      const expiresIn = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

      // Set secure HttpOnly session cookie
      const response = NextResponse.json({ ok: true }, { status: 200 });
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
      return NextResponse.json({ error: "Invalid token or internal error" }, { status: 401 });
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
    const response = NextResponse.json({ ok: true }, { status: 200 });
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
