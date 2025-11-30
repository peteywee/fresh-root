// [P0][APP][CODE] Onboarding
// Tags: P0, APP, CODE
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth, UserRecord } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { HttpsError, onCall } from "firebase-functions/v2/https";

/**
 * Ensure Firebase Admin is initialized exactly once.
 */
if (!getApps().length) {
  initializeApp();
}

const db: Firestore = getFirestore();
const auth = getAuth();

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

interface JoinOrganizationRequest {
  tokenId: string;
  email: string;
  password: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
  };
}

interface JoinToken {
  orgId: string;
  maxUses: number;
  uses: number;
  expiresAt?: FirebaseFirestore.Timestamp;
  role?: string;
  disabled?: boolean;
}

/**
 * Shape of a membership document – adjust fields to match your schema.
 */
interface Membership {
  orgId: string;
  userId: string;
  role: string;
  createdAt: FirebaseFirestore.Timestamp;
  createdBy: string | null;
  source: "join_token";
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Validate a join token document and convert it to a typed object.
 */
function validateJoinToken(tokenSnapshot: FirebaseFirestore.DocumentSnapshot): JoinToken {
  if (!tokenSnapshot.exists) {
    throw new HttpsError("invalid-argument", "Invitation token not found.");
  }

  const data = tokenSnapshot.data() as Partial<JoinToken>;
  if (!data.orgId || typeof data.orgId !== "string") {
    throw new HttpsError(
      "failed-precondition",
      "Invitation token is misconfigured: missing orgId.",
    );
  }

  if (data.disabled) {
    throw new HttpsError("failed-precondition", "This invitation token has been disabled.");
  }

  const maxUses = typeof data.maxUses === "number" ? data.maxUses : 1;
  const uses = typeof data.uses === "number" ? data.uses : 0;

  if (maxUses <= 0) {
    throw new HttpsError(
      "failed-precondition",
      "Invitation token is misconfigured: maxUses must be positive.",
    );
  }

  if (uses >= maxUses) {
    throw new HttpsError(
      "failed-precondition",
      "This invitation token has already been fully used.",
    );
  }

  if (data.expiresAt && data.expiresAt.toMillis() < Date.now()) {
    throw new HttpsError("failed-precondition", "This invitation token has expired.");
  }

  return {
    orgId: data.orgId,
    maxUses,
    uses,
    expiresAt: data.expiresAt,
    role: data.role ?? "member",
    disabled: !!data.disabled,
  };
}

/* -------------------------------------------------------------------------- */
/* Cloud Function: joinOrganization                                           */
/* -------------------------------------------------------------------------- */

/**
 * Callable function that:
 * 1. Validates a join token
 * 2. Creates an Auth user
 * 3. Within a Firestore transaction:
 *    - Re-validates & consumes the token
 *    - Creates a membership document
 *
 * If anything after user creation fails, we roll back by deleting the Auth user.
 */
export const joinOrganization = onCall<JoinOrganizationRequest>(
  {
    cors: true,
    enforceAppCheck: false, // set to true when you are ready to enforce App Check
  },
  async (request) => {
    const { tokenId, email, password, profile } = request.data ?? {};

    if (!tokenId || typeof tokenId !== "string") {
      throw new HttpsError("invalid-argument", "tokenId is required.");
    }
    if (!email || typeof email !== "string") {
      throw new HttpsError("invalid-argument", "email is required.");
    }
    if (!password || typeof password !== "string") {
      throw new HttpsError("invalid-argument", "password is required.");
    }

    logger.info("joinOrganization called", {
      tokenId,
      email,
    });

    let createdUser: UserRecord | null = null;

    try {
      /* --------------------------- Step 1: Read token --------------------------- */
      const tokenRef = db.collection("join_tokens").doc(tokenId);
      const tokenSnapshot = await tokenRef.get();
      const tokenData = validateJoinToken(tokenSnapshot);

      /* ------------------------ Step 2: Create Auth user ------------------------ */
      createdUser = await auth.createUser({
        email,
        password,
        displayName:
          (profile?.displayName ??
            [profile?.firstName, profile?.lastName].filter(Boolean).join(" ")) ||
          undefined,
      });

      logger.info("Auth user created for joinOrganization", {
        uid: createdUser.uid,
        email: createdUser.email,
        tokenId,
      });

      /* ---------------- Step 3: Firestore transaction (atomic) ----------------- */
      await db.runTransaction(async (tx) => {
        // Re-load token within transaction to avoid race conditions
        const freshTokenSnap = await tx.get(tokenRef);
        const freshToken = validateJoinToken(freshTokenSnap);

        const membershipRef = db.collection("memberships").doc();

        const membership: Membership = {
          orgId: freshToken.orgId,
          userId: createdUser!.uid,
          role: freshToken.role ?? "member",
          createdAt: FirebaseFirestore.Timestamp.now(),
          createdBy: request.auth?.uid ?? null,
          source: "join_token",
        };

        // Consume one use of the token
        tx.update(tokenRef, {
          uses: freshToken.uses + 1,
          updatedAt: FirebaseFirestore.Timestamp.now(),
        });

        // Create membership
        tx.set(membershipRef, membership);
      });

      logger.info("joinOrganization transaction committed", {
        uid: createdUser.uid,
        tokenId,
      });

      return {
        success: true,
        uid: createdUser.uid,
        email: createdUser.email,
      };
    } catch (err: unknown) {
      logger.error("joinOrganization failed, attempting rollback", {
        error: (err as Error).message,
        tokenId,
        uid: createdUser?.uid ?? null,
      });

      // Compensating transaction: if we created an Auth user but failed later,
      // delete the user so we do not end up with a "zombie user".
      if (createdUser) {
        try {
          await auth.deleteUser(createdUser.uid);
          logger.warn("Rollback: deleted Auth user after join failure", {
            uid: createdUser.uid,
            email: createdUser.email,
          });
        } catch (rollbackError: unknown) {
          logger.error("CRITICAL: failed to rollback Auth user", {
            uid: createdUser.uid,
            email: createdUser.email,
            error: (rollbackError as Error).message,
          });
        }
      }

      // Normalize error to client
      if (err instanceof HttpsError) {
        throw err;
      }

      throw new HttpsError("internal", "Join failed unexpectedly. Please try again.");
    }
  },
);
