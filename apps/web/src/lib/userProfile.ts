// [P0][APP][CODE] UserProfile
// Tags: P0, APP, CODE
/**
 * [P1][APP][USER] User profile bootstrap + helpers
 * Tags: user, profile, onboarding, session
 *
 * Overview:
 * - Ensures a users/{uid} profile document exists on first sign-in
 * - Populates basic identity + initial onboarding state
 * - Safe to call on every session bootstrap (idempotent)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Firestore } from "firebase-admin/firestore";

export type AuthUserClaims = {
  email?: string;
  name?: string;
  displayName?: string;
  picture?: string;
  selfDeclaredRole?: string;
  role?: string;
  [key: string]: unknown;
};

export async function ensureUserProfile(args: {
  adminDb: Firestore | any;
  uid: string;
  claims: AuthUserClaims;
}): Promise<void> {
  const { adminDb, uid, claims } = args;

  if (!adminDb) {
    // Stub mode, nothing to persist
    console.log("[userProfile] stub ensureUserProfile", { uid, claims });
    return;
  }

  const usersRef = adminDb.collection("users").doc(uid);
  const snap = await usersRef.get();
  const now = Date.now();

  const baseProfile = {
    email: (claims.email as string | undefined) || null,
    displayName:
      (claims.displayName as string | undefined) || (claims.name as string | undefined) || null,
    avatarUrl: (claims.picture as string | undefined) || null,
    selfDeclaredRole:
      (claims.selfDeclaredRole as string | undefined) ||
      (claims.role as string | undefined) ||
      null,
  };

  if (!snap.exists) {
    // First-time sign-in → create full user doc with initial onboarding state
    await usersRef.set({
      id: uid,
      createdAt: now,
      updatedAt: now,
      profile: baseProfile,
      onboarding: {
        status: "not_started",
        stage: "profile",
        intent: null,
        primaryNetworkId: null,
        primaryOrgId: null,
        primaryVenueId: null,
        completedAt: null,
        lastUpdatedAt: now,
      },
    });
    return;
  }

  // If the doc exists, we still may want to backfill missing profile fields
  const existing = snap.data() as any;

  const profile = {
    ...(existing.profile || {}),
    ...baseProfile,
  };

  await usersRef.set(
    {
      profile,
      updatedAt: now,
      onboarding: existing.onboarding || {
        status: "not_started",
        stage: "profile",
        intent: null,
        primaryNetworkId: null,
        primaryOrgId: null,
        primaryVenueId: null,
        completedAt: null,
        lastUpdatedAt: now,
      },
    },
    { merge: true },
  );
}
