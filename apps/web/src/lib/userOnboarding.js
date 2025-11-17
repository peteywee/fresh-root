export async function markOnboardingComplete(params) {
    const { adminDb, uid, intent, networkId, orgId = null, venueId = null } = params;
    if (!adminDb)
        return; // preserve stub/test behavior
    const now = Date.now();
    try {
        await adminDb
            .collection("users")
            .doc(uid)
            .set({
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
        }, { merge: true });
    }
    catch (_e) {
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
