// [P1][HELPERS][ONBOARDING] User Onboarding Helpers
// Tags: P1, HELPERS, ONBOARDING, FIREBASE
/**
 * @fileoverview
 * Helpers for managing canonical user onboarding state (users/{uid}.onboarding).
 * markOnboardingComplete is called after all successful onboarding flows to mark completion.
 */
import type { Firestore } from "firebase-admin/firestore";
import { setDocWithType } from "@/lib/firebase/typed-wrappers";

export type OnboardingIntent = "create_org" | "create_corporate" | "join_existing";

export interface OnboardingState {
  status: "complete" | "in_progress" | "not_started";
  stage: string;
  intent: OnboardingIntent | null;
  primaryNetworkId: string | null;
  primaryOrgId: string | null;
  primaryVenueId: string | null;
  completedAt: number | null;
  lastUpdatedAt: number;
}

export interface UserOnboardingDoc {
  [key: string]: unknown;
  onboarding: OnboardingState;
}

export async function markOnboardingComplete(params: {
  adminDb: Firestore | undefined;
  uid: string;
  intent: OnboardingIntent;
  networkId: string;
  orgId?: string | null;
  venueId?: string | null;
}): Promise<void> {
  const { adminDb, uid, intent, networkId, orgId = null, venueId = null } = params;

  if (!adminDb) return; // preserve stub/test behavior

  const now = Date.now();

  try {
    const ref = adminDb.collection("users").doc(uid);
    const updateData = {
      onboarding: {
        status: "complete" as const,
        stage: "network_created",
        intent,
        primaryNetworkId: networkId,
        primaryOrgId: orgId ?? null,
        primaryVenueId: venueId ?? null,
        completedAt: now,
        lastUpdatedAt: now,
      },
    };

    await setDocWithType<UserOnboardingDoc>(adminDb, ref, updateData, { merge: true });
  } catch (_e) {
    // Don't surface errors to callers; keep original endpoint semantics.
    // Optionally log via a logger if available in the future.
    console.debug("[userOnboarding] Failed to mark onboarding complete", {
      uid,
      intent,
      networkId,
      orgId,
      venueId,
      error: _e,
    });
  }
}
