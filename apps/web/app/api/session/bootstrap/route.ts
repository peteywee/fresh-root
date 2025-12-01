// [P0][SESSION][API] Session bootstrap endpoint
import { Firestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for bootstrap request (accept any payload)
const BootstrapSchema = z.object({}).passthrough().optional();

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";
import { ensureUserProfile } from "@/src/lib/userProfile";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

async function bootstrapSessionHandlerImpl(
  req: AuthenticatedRequest & {
    user?: { uid: string; customClaims?: Record<string, unknown> };
  },
  injectedAdminDb?: Firestore,
) {
  // Validate request body
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const result = BootstrapSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "validation_error", issues: result.error.issues },
      { status: 422 },
    );
  }

  const uid = req.user?.uid;
  const claims = (req.user?.customClaims || {}) as Record<string, unknown>;

  if (!uid) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const adminDb = injectedAdminDb;

  try {
    // 1) Ensure user profile exists and has at least baseline data
    await ensureUserProfile({
      adminDb,
      uid,
      claims,
    });

    if (!adminDb) {
      // Stub mode: return a simple session stub
      return NextResponse.json(
        {
          ok: true,
          uid,
          emailVerified: Boolean(claims.email_verified || claims.emailVerified),
          user: {
            id: uid,
            profile: {
              email: (claims.email as string | undefined) || null,
              displayName:
                (claims.displayName as string | undefined) ||
                (claims.name as string | undefined) ||
                null,
            },
            onboarding: {
              status: "not_started",
              stage: "profile",
            },
          },
          isStub: true,
        },
        { status: 200 },
      );
    }

    // 2) Re-read full user doc from Firestore as source of truth
    const usersRef = adminDb.collection("users").doc(uid);
    const snap = await usersRef.get();

    if (!snap.exists) {
      // This should not happen after ensureUserProfile, but handle defensively
      return NextResponse.json(
        {
          error: "user_doc_missing",
        },
        { status: 500 },
      );
    }

    const data = snap.data() as {
      profile?: unknown;
      onboarding?: unknown;
      [key: string]: unknown;
    };

    return NextResponse.json(
      {
        ok: true,
        uid,
        emailVerified: Boolean(claims.email_verified || claims.emailVerified),
        user: {
          id: uid,
          profile: data.profile || null,
          onboarding: data.onboarding || null,
        },
        // You can expose feature flags or role hints here later if needed
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("session/bootstrap failed", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export const GET = createAuthenticatedEndpoint({
  handler: async ({ request, input, context, params }) => {
    async (req: AuthenticatedRequest) => bootstrapSessionHandlerImpl(req, importedAdminDb),
  { requireAuth: true };
  }
});

export const POST = createAuthenticatedEndpoint({
  handler: async ({ request, input, context, params }) => {
    async (req: AuthenticatedRequest) => bootstrapSessionHandlerImpl(req, importedAdminDb),
  { requireAuth: true };
  }
});
