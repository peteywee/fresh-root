// [P0][SESSION][API] Session bootstrap endpoint
import { Firestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

const BootstrapSchema = z.object({}).passthrough().optional();

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";
import { ensureUserProfile } from "@/src/lib/userProfile";

async function bootstrapSessionHandlerImpl(
  uid: string,
  claims: Record<string, unknown>,
  injectedAdminDb?: Firestore,
) {
  const adminDb = injectedAdminDb;

  try {
    await ensureUserProfile({ adminDb, uid, claims });

    if (!adminDb) {
      return NextResponse.json({
        ok: true,
        uid,
        emailVerified: Boolean(claims.email_verified || claims.emailVerified),
        user: {
          id: uid,
          profile: {
            email: (claims.email as string | undefined) || null,
            displayName: (claims.displayName as string | undefined) || (claims.name as string | undefined) || null,
          },
          onboarding: { status: "not_started", stage: "profile" },
        },
        isStub: true,
      }, { status: 200 });
    }

    const usersRef = adminDb.collection("users").doc(uid);
    const snap = await usersRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "user_doc_missing" }, { status: 500 });
    }

    const data = snap.data() as { profile?: unknown; onboarding?: unknown; [key: string]: unknown };

    return NextResponse.json({
      ok: true,
      uid,
      emailVerified: Boolean(claims.email_verified || claims.emailVerified),
      user: { id: uid, profile: data.profile || null, onboarding: data.onboarding || null },
    }, { status: 200 });
  } catch (err) {
    console.error("session/bootstrap failed", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export const GET = createAuthenticatedEndpoint({
  input: BootstrapSchema,
  handler: async ({ context }) => {
    const uid = context.auth!.userId;
    const claims = { email: context.auth?.email, email_verified: context.auth?.emailVerified };
    return bootstrapSessionHandlerImpl(uid, claims, importedAdminDb);
  },
});

export const POST = createAuthenticatedEndpoint({
  input: BootstrapSchema,
  handler: async ({ context }) => {
    const uid = context.auth!.userId;
    const claims = { email: context.auth?.email, email_verified: context.auth?.emailVerified };
    return bootstrapSessionHandlerImpl(uid, claims, importedAdminDb);
  },
});
