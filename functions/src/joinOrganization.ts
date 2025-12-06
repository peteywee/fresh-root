// [P0][APP][CODE] JoinOrganization
// Tags: P0, APP, CODE
/**
 * joinOrganization Cloud Function
 *
 * CRITICAL FIX: Handles the atomic join flow that was previously
 * split across client and multiple API calls.
 *
 * GUARANTEES:
 * 1. ATOMICITY: All database operations in a single transaction
 * 2. COMPENSATING TRANSACTIONS: If DB fails after Auth creation, we clean up
 * 3. IDEMPOTENCY: Same token/user returns same result
 * 4. SECURITY: Token validation happens server-side
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

// Avoid initializing Firestore/auth at module-evaluation time so tests can
function getDb() {
  return getFirestore();
}

function getAuth() {
  return admin.auth();
}

// =============================================================================
// TYPES & VALIDATION
// =============================================================================

const JoinRequestSchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(1, "Display name is required"),
});

interface JoinToken {
  orgId: string;
  role: string;
  status: "active" | "used" | "expired" | "revoked";
  createdAt: admin.firestore.Timestamp;
  expiresAt: admin.firestore.Timestamp;
  maxUses: number;
  currentUses: number;
  createdBy: string;
}

interface JoinResult {
  success: boolean;
  userId: string;
  orgId: string;
  membershipId: string;
  customToken: string;
}

// =============================================================================
// ERROR CLASS
// =============================================================================

class JoinError extends Error {
  constructor(
    message: string,
    public code: string,
    public httpStatus: number = 400,
  ) {
    super(message);
    this.name = "JoinError";
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function validateToken(
  tokenId: string,
  dbClient?: any,
): Promise<{ ref: admin.firestore.DocumentReference<JoinToken>; data: JoinToken }> {
  const db = dbClient ?? getDb();

  // Typed converter so we can treat tokenRef as DocumentReference<JoinToken>
  const tokenConverter: admin.firestore.FirestoreDataConverter<JoinToken> = {
    toFirestore: (data: JoinToken) => ({
      orgId: data.orgId,
      role: data.role,
      status: data.status,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt,
      maxUses: data.maxUses,
      currentUses: data.currentUses,
      createdBy: data.createdBy,
    }),
    fromFirestore: (snapshot: FirebaseFirestore.QueryDocumentSnapshot) => {
      return snapshot.data() as JoinToken;
    },
  };

  const tokenRef = db.collection("join_tokens").withConverter(tokenConverter).doc(tokenId);
  const tokenDoc = await tokenRef.get();

  if (!tokenDoc.exists) {
    throw new JoinError("Invalid or expired join token", "TOKEN_NOT_FOUND", 404);
  }

  const tokenData = tokenDoc.data() as JoinToken;

  if (tokenData.status !== "active") {
    throw new JoinError(`Token is ${tokenData.status}`, "TOKEN_INVALID", 400);
  }

  if (tokenData.expiresAt.toDate() < new Date()) {
    throw new JoinError("Token has expired", "TOKEN_EXPIRED", 400);
  }

  if (tokenData.currentUses >= tokenData.maxUses) {
    throw new JoinError("Token has reached maximum uses", "TOKEN_EXHAUSTED", 400);
  }

  return { ref: tokenRef, data: tokenData };
}

async function checkExistingMembership(userId: string, orgId: string, dbClient?: any): Promise<string | null> {
  const db = dbClient ?? getDb();
  const existing = await db
    .collectionGroup("memberships")
    .where("uid", "==", userId)
    .where("orgId", "==", orgId)
    .limit(1)
    .get();

  if (!existing.empty) {
    return existing.docs[0].id;
  }
  return null;
}

async function getOrCreateAuthUser(
  email: string,
  password: string,
  displayName: string,
  authClient?: any,
): Promise<{ user: admin.auth.UserRecord; isNew: boolean }> {
  try {
    const existingUser = await (authClient ?? getAuth()).getUserByEmail(email);
    return { user: existingUser, isNew: false };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string };
    if (firebaseError.code === "auth/user-not-found") {
      const newUser = await (authClient ?? getAuth()).createUser({
        email,
        password,
        displayName,
        emailVerified: false,
      });
      return { user: newUser, isNew: true };
    }
    throw error;
  }
}

async function deleteAuthUser(uid: string, authClient?: any): Promise<void> {
  try {
    await (authClient ?? getAuth()).deleteUser(uid);
    functions.logger.info(`[COMPENSATE] Deleted auth user ${uid}`);
  } catch (error) {
    functions.logger.error(`[COMPENSATE] Failed to delete auth user ${uid}:`, error);
  }
}

// =============================================================================
// MAIN FUNCTION
// =============================================================================

// Extract handler for unit/integration testing
export async function joinOrganizationHandler(
  request: any,
  deps?: { db?: any; auth?: any },
): Promise<JoinResult> {
  const dbClient = deps?.db ?? getDb();
  const authClient = deps?.auth ?? getAuth();
  let createdAuthUser: admin.auth.UserRecord | null = null;
  let isNewUser = false;

  try {
    // Validate input
    const validation = JoinRequestSchema.safeParse(request.data);
    if (!validation.success) {
      throw new JoinError(
        validation.error.issues.map((e) => e.message).join(", "),
        "VALIDATION_ERROR",
        400,
      );
    }

    const { token, email, password, displayName } = validation.data;

    functions.logger.info(`[JOIN] Starting join flow for ${email}`);

    // Validate token
    const { ref: tokenRef, data: tokenData } = await validateToken(token, dbClient);
    const { orgId, role } = tokenData;

    // Create/Get Auth user
    const { user, isNew } = await getOrCreateAuthUser(email, password, displayName, authClient);
    createdAuthUser = user;
    isNewUser = isNew;

    // Check idempotency
    const existingMembership = await checkExistingMembership(user.uid, orgId, dbClient);
    if (existingMembership) {
      functions.logger.info(`[JOIN] User already member, returning existing`);
      const customToken = await authClient.createCustomToken(user.uid);
      return {
        success: true,
        userId: user.uid,
        orgId,
        membershipId: existingMembership,
        customToken,
      };
    }

  // ATOMIC TRANSACTION
  // Define document shapes for type-safety within the transaction
  interface MembershipDoc {
    uid: string;
    orgId: string;
    role: string;
    status: "active" | "inactive" | "pending";
    joinedVia: "token" | string;
    joinToken?: string;
    email?: string | null;
    displayName?: string | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }

  interface UserProfileDoc {
    uid: string;
    email?: string | null;
    displayName?: string | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    onboardingComplete: boolean;
  }

  const membershipId: string = await dbClient.runTransaction(async (transaction: FirebaseFirestore.Transaction): Promise<string> => {
    const tokenSnapshot: FirebaseFirestore.DocumentSnapshot<JoinToken> = await transaction.get(tokenRef);
    if (!tokenSnapshot.exists) {
      throw new JoinError("Token no longer exists", "TOKEN_NOT_FOUND", 404);
    }

    const currentTokenData: JoinToken = tokenSnapshot.data() as JoinToken;
    if (currentTokenData.currentUses >= currentTokenData.maxUses) {
      throw new JoinError("Token exhausted", "TOKEN_EXHAUSTED", 400);
    }

    const membershipRef: FirebaseFirestore.DocumentReference<MembershipDoc> =
      dbClient.collection("memberships").doc();
    const now: Timestamp = Timestamp.now();

    transaction.set(membershipRef, {
      uid: user.uid,
      orgId,
      role,
      status: "active",
      joinedVia: "token",
      joinToken: token,
      email: user.email,
      displayName: user.displayName,
      createdAt: now,
      updatedAt: now,
    } as MembershipDoc);

    const inc: FirebaseFirestore.FieldValue = FieldValue.increment(1) as unknown as FirebaseFirestore.FieldValue;
    transaction.update(tokenRef, {
      currentUses: inc,
      lastUsedAt: now,
      ...(currentTokenData.currentUses + 1 >= currentTokenData.maxUses ? { status: "used" } : {}),
    });

    if (isNewUser) {
      const profileRef: FirebaseFirestore.DocumentReference<UserProfileDoc> =
        dbClient.collection("users").doc(user.uid);
      transaction.set(
        profileRef,
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: now,
          updatedAt: now,
          onboardingComplete: false,
        } as UserProfileDoc,
        { merge: true },
      );
    }

    return membershipRef.id;
  });

    const customToken = await authClient.createCustomToken(user.uid);

    functions.logger.info(`[JOIN] Success: User ${user.uid} joined org ${orgId}`);

    return {
      success: true,
      userId: user.uid,
      orgId,
      membershipId,
      customToken,
    };
  } catch (error) {
    // COMPENSATING TRANSACTION
    if (isNewUser && createdAuthUser) {
      functions.logger.warn(`[JOIN] Transaction failed, executing compensating action`);
      await deleteAuthUser(createdAuthUser.uid, deps?.auth);
    }

    if (error instanceof JoinError) {
      throw new functions.https.HttpsError("failed-precondition", error.message, {
        code: error.code,
      });
    }

    functions.logger.error("[JOIN] Unexpected error:", error);
    throw new functions.https.HttpsError("internal", "An unexpected error occurred", {
      code: "INTERNAL_ERROR",
    });
  }
}

// Export the Cloud Function using the handler, this keeps runtime the same
export const joinOrganization = functions.https.onCall(async (request) => {
  return await joinOrganizationHandler(request);
});
