// [P0][AUTH][SESSION] Route API route handler
// Tags: P0, AUTH, SESSION
import { NextResponse } from "next/server";
import { Firestore } from "firebase-admin/firestore";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";

export async function bootstrapSessionHandler(
  req: AuthenticatedRequest & { user?: { uid: string; customClaims?: Record<string, unknown> } },
  injectedAdminDb?: Firestore,
) {
  const uid = req.user?.uid;
  if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  if (!injectedAdminDb) {
    // No admin DB available (dev/test). Return a minimal shell the frontend can use.
    return NextResponse.json(
      {
        uid,
        emailVerified: Boolean(
          req.user?.customClaims?.email_verified || req.user?.customClaims?.emailVerified,
        ),
        onboarding: { status: "not_started", stage: "profile" },
        profile: {},
      },
      { status: 200 },
    );
  }

  try {
    const userSnap = await injectedAdminDb.collection("users").doc(uid).get();
    const data = userSnap.exists ? (userSnap.data() as Record<string, unknown>) : null;

    const onboarding = data?.onboarding ?? { status: "not_started", stage: "profile" };
    const profile = data?.profile ?? {};

    // Expose only safe profile fields
    const safeProfile = {
      fullName: (profile as Record<string, unknown>)?.fullName ?? null,
      preferredName: (profile as Record<string, unknown>)?.preferredName ?? null,
      timeZone: (profile as Record<string, unknown>)?.timeZone ?? null,
      selfDeclaredRole: (profile as Record<string, unknown>)?.selfDeclaredRole ?? null,
    };

    return NextResponse.json(
      {
        uid,
        emailVerified: Boolean(
          req.user?.customClaims?.email_verified || req.user?.customClaims?.emailVerified,
        ),
        onboarding,
        profile: safeProfile,
      },
      { status: 200 },
    );
  } catch (_e) {
    // On error, return a minimal shell so the frontend can decide routing.
    return NextResponse.json(
      {
        uid,
        emailVerified: Boolean(
          req.user?.customClaims?.email_verified || req.user?.customClaims?.emailVerified,
        ),
        onboarding: { status: "not_started", stage: "profile" },
        profile: {},
      },
      { status: 200 },
    );
  }
}

export const GET = withSecurity(
  async (req: AuthenticatedRequest) => bootstrapSessionHandler(req, importedAdminDb),
  { requireAuth: true },
);
