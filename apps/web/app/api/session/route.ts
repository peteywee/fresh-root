// [P0][AUTH][SESSION] Route API route handler
// Tags: P0, AUTH, SESSION
import { NextRequest, NextResponse } from "next/server";

import { getFirebaseAdminAuth } from "../../../lib/firebase-admin";

// Session endpoint: verify idToken with Firebase Admin and set secure session cookie
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing or invalid idToken" }, { status: 400 });
    }

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
    return NextResponse.json({ error: "Invalid token or internal error" }, { status: 401 });
  }
}

export async function DELETE() {
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
}
