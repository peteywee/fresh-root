// [P1][HELPERS][ONBOARDING] User Onboarding Helpers
// Tags: P1, HELPERS, ONBOARDING, FIREBASE
/**
 * @fileoverview
 * Helpers for managing canonical user onboarding state (users/{uid}.onboarding).
 * markOnboardingComplete is called after all successful onboarding flows to mark completion.
 */
import { Firestore } from "firebase-admin/firestore";

export type OnboardingIntent = "create_org" | "create_corporate" | "join_existing";

export async function markOnboardingComplete(params: {
  adminDb: import("firebase-admin/firestore").Firestore | undefined;
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
    await (adminDb as Firestore)
      .collection("users")
      .doc(uid)
      .set(
        {
          onboarding: {
            status: "complete",
            stage: "network_created",
            intent,
            primaryNetworkId: networkId,
            primaryOrgId: orgId,
            primaryVenueId: venueId,
            completedAt: now,
            lastUpdatedAt: now,
          },
        },
        { merge: true },
      );
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
