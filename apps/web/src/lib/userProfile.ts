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
import { z } from "zod";

import { getDocWithType, setDocWithType } from "./firebase/typed-wrappers";

export type AuthUserClaims = {
  email?: string;
  name?: string;
  displayName?: string;
  picture?: string;
  selfDeclaredRole?: string;
  role?: string;
  [key: string]: unknown;
};

const UserProfileSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  profile: z.object({
    email: z.string().nullable(),
    displayName: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    selfDeclaredRole: z.string().nullable(),
  }),
  onboarding: z.object({
    status: z.string(),
    stage: z.string(),
    intent: z.any().nullable(),
    primaryNetworkId: z.string().nullable(),
    primaryOrgId: z.string().nullable(),
    primaryVenueId: z.string().nullable(),
    completedAt: z.any().nullable(),
    lastUpdatedAt: z.number(),
  }),
});

export type UserProfileDoc = z.infer<typeof UserProfileSchema>;

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

  const ref = adminDb.collection("users").doc(uid);
  const now = Date.now();

  const baseProfile = {
    email: claims.email || null,
    displayName: claims.displayName || claims.name || null,
    avatarUrl: claims.picture || null,
    selfDeclaredRole: claims.selfDeclaredRole || claims.role || null,
  };

  const existing = await getDocWithType<UserProfileDoc>(adminDb, ref);

  if (!existing) {
    // First-time sign-in → create full user doc with initial onboarding state
    const newProfile: UserProfileDoc = {
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
    };

    await setDocWithType<UserProfileDoc>(adminDb, ref, newProfile);
    return;
  }

  // If the doc exists, we still may want to backfill missing profile fields
  const profile = {
    ...(existing.profile || {}),
    ...baseProfile,
  };

  await setDocWithType<UserProfileDoc>(
    adminDb,
    ref,
    {
      id: uid,
      profile,
      updatedAt: now,
      createdAt: existing.createdAt || now,
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
