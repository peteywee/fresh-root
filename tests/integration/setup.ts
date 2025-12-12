// [P0][TEST][TEST] Setup tests
// Tags: P0, TEST, TEST
/**
 * Integration Test Setup
 *
 * Runs before all integration tests.
 * Connects to Firebase emulators.
 *
 * REQUIREMENTS:
 *   firebase emulators:start --only auth,firestore,functions
 */

import * as admin from "firebase-admin";
import { beforeAll, afterAll, afterEach } from "vitest";

// =============================================================================
// EMULATOR CONFIGURATION
// =============================================================================

const EMULATOR_CONFIG = {
  firestore: process.env.FIRESTORE_EMULATOR_HOST || "localhost:8080",
  auth: process.env.FIREBASE_AUTH_EMULATOR_HOST || "localhost:9099",
  functions: process.env.FUNCTIONS_EMULATOR_HOST || "localhost:5001",
};

process.env.FIRESTORE_EMULATOR_HOST = EMULATOR_CONFIG.firestore;
process.env.FIREBASE_AUTH_EMULATOR_HOST = EMULATOR_CONFIG.auth;

// =============================================================================
// FIREBASE ADMIN SETUP
// =============================================================================

let app: admin.app.App;

beforeAll(async () => {
  app = admin.initializeApp({
    projectId: "fresh-schedules-test",
  });

  console.info("🔥 Firebase Admin initialized with emulators");
  console.info(`   Firestore: ${EMULATOR_CONFIG.firestore}`);
  console.info(`   Auth: ${EMULATOR_CONFIG.auth}`);
});

afterAll(async () => {
  await app.delete();
});

// =============================================================================
// TEST DATA CLEANUP
// =============================================================================

afterEach(async () => {
  const db = admin.firestore();

  const collections = ["users", "organizations", "memberships", "join_tokens"];

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    if (snapshot.docs.length > 0) {
      await batch.commit();
    }
  }
});

// =============================================================================
// TEST UTILITIES
// =============================================================================

export async function createTestUser(overrides: Partial<admin.auth.CreateRequest> = {}) {
  const auth = admin.auth();
  const userId = `test-user-${Date.now()}`;

  return auth.createUser({
    uid: userId,
    email: `${userId}@test.com`,
    password: "testpassword123",
    displayName: "Test User",
    ...overrides,
  });
}

export async function createTestOrg(orgId?: string) {
  const db = admin.firestore();
  const id = orgId || `test-org-${Date.now()}`;

  await db.doc(`organizations/${id}`).set({
    name: "Test Organization",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return id;
}

export async function createTestMembership(userId: string, orgId: string, role = "admin") {
  const db = admin.firestore();
  const membershipId = `membership-${Date.now()}`;

  await db.doc(`memberships/${membershipId}`).set({
    uid: userId,
    orgId,
    role,
    status: "active",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return membershipId;
}

export async function createTestJoinToken(
  orgId: string,
  options: {
    maxUses?: number;
    expiresInHours?: number;
    role?: string;
  } = {},
) {
  const db = admin.firestore();
  const tokenId = `token-${Date.now()}`;

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (options.expiresInHours || 24));

  await db.doc(`join_tokens/${tokenId}`).set({
    orgId,
    role: options.role || "staff",
    status: "active",
    maxUses: options.maxUses || 1,
    currentUses: 0,
    createdAt: admin.firestore.Timestamp.now(),
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    createdBy: "test-admin",
  });

  return tokenId;
}

export async function getFirestoreDoc(path: string) {
  const db = admin.firestore();
  const doc = await db.doc(path).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function countCollection(path: string) {
  const db = admin.firestore();
  const snapshot = await db.collection(path).count().get();
  return snapshot.data().count;
}

export { admin, EMULATOR_CONFIG };
