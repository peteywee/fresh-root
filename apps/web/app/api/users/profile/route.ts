// [P2][D8][USERS][PROFILE][API] User profile endpoint with Firestore persistence
// Tags: P2, D8, API, USERS, PROFILE, FIRESTORE

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { getFirestore } from "firebase-admin/firestore";
import { ok, serverError } from "../../_shared/validation";

/**
 * User profile interface (extends auth context)
 */
interface UserProfile {
  userId: string;
  email?: string;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  role?: string;
  orgId?: string;
  createdAt?: number;
  updatedAt?: number;
  customClaims?: Record<string, unknown>;
}

/**
 * GET /api/users/profile
 * Get authenticated user profile from Firestore (scoped to organization)
 */
export const GET = createAuthenticatedEndpoint({
  org: "optional",
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000,
  },
  handler: async ({ request: _request, input: _input, context, params: _params }) => {
    try {
      const userId = context.auth!.userId;
      const orgId = context.org?.orgId;

      // Build base profile from auth context
      const baseProfile: UserProfile = {
        userId,
        email: context.auth?.email,
        emailVerified: context.auth?.emailVerified || false,
        customClaims: context.auth?.customClaims,
      };

      // If org context exists, fetch extended profile from Firestore
      if (orgId) {
        const db = getFirestore();
        const profileRef = db
          .collection('organizations')
          .doc(orgId)
          .collection('members')
          .doc(userId);

        const snap = await profileRef.get();

        if (snap.exists) {
          const firestoreData = snap.data() as Partial<UserProfile>;
          return ok({
            ...baseProfile,
            ...firestoreData,
            orgId,
          });
        }
      }

      // Return base profile if no Firestore data
      return ok(baseProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      return serverError("Failed to fetch profile");
    }
  },
});
