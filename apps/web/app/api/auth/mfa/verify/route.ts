// [P0][AUTH][API] MFA verification endpoint
import * as speakeasy from "speakeasy";
import { z } from "zod";
import { NextResponse } from "next/server";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

import { getFirebaseAdminAuth } from "../../../../../lib/firebase-admin";

const verifySchema = z.object({
  secret: z.string().min(1, "Secret is required"),
  token: z.string().length(6, "Token must be 6 digits"),
});

export const POST = createAuthenticatedEndpoint({
  input: verifySchema,
  rateLimit: { maxRequests: 50, windowMs: 60_000 },
  handler: async ({ input, context }) => {
    try {
      const { secret, token } = input;
      const verified = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window: 2,
      });

      if (!verified) {
        console.warn("Invalid MFA verification code", { uid: context.auth?.userId });
        return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
      }

      const auth = getFirebaseAdminAuth();
      const uid = context.auth!.userId;
      await auth.setCustomUserClaims(uid, { mfa: true });

      console.warn("MFA enabled successfully", { uid });

      return NextResponse.json({ success: true, message: "MFA enabled successfully" }, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Invalid request", details: error.issues }, { status: 400 });
      }
      console.error("MFA verification failed", error);
      return NextResponse.json({ error: "Failed to verify MFA" }, { status: 500 });
    }
  },
});
