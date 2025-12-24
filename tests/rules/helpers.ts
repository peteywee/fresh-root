// [P0][TEST][RULES] Firestore rules test helpers
// Tags: P0, TEST, RULES, FIRESTORE, HARNESS
import fs from "node:fs";
import path from "node:path";

import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";

const PROJECT_ID = "fresh-schedules-test";

/**
 * Custom claims for authenticated test contexts.
 * Mirrors the token structure expected by firestore.rules.
 */
export type AuthToken = {
  orgId?: string;
  roles?: string[];
};

/**
 * Creates a RulesTestEnvironment loading firestore.rules from the project root.
 * Use with firebase emulators (port 8080 per firebase.json).
 */
export async function createRulesTestEnv(): Promise<RulesTestEnvironment> {
  const rulesPath = path.resolve(process.cwd(), "firestore.rules");
  const rules = fs.readFileSync(rulesPath, "utf8");

  return initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: "127.0.0.1",
      port: 8080,
    },
  });
}

/**
 * Returns an authenticated Firestore context for the given uid and claims.
 * @param env - The RulesTestEnvironment instance
 * @param uid - User ID to authenticate as
 * @param claims - Custom token claims (orgId, roles)
 */
export function ctxUser(env: RulesTestEnvironment, uid: string, claims: AuthToken = {}) {
  return env.authenticatedContext(uid, claims as Record<string, unknown>);
}

/**
 * Returns an unauthenticated Firestore context.
 * @param env - The RulesTestEnvironment instance
 */
export function ctxUnauth(env: RulesTestEnvironment) {
  return env.unauthenticatedContext();
}

/**
 * Legacy alias for ctxUnauth - kept for backward compatibility.
 */
export const ctxAnon = ctxUnauth;

/**
 * Seeds data with security rules disabled for test setup.
 * @param env - The RulesTestEnvironment instance
 * @param callback - Async function that receives the Firestore instance
 */
export async function seed(
  env: RulesTestEnvironment,
  callback: (db: FirebaseFirestore.Firestore) => Promise<void>,
): Promise<void> {
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await callback(db as unknown as FirebaseFirestore.Firestore);
  });
}

/**
 * Cleans up the test environment, clearing Firestore data and releasing resources.
 * Call in afterAll() or afterEach() hooks.
 * @param env - The RulesTestEnvironment instance
 */
export async function cleanup(env: RulesTestEnvironment): Promise<void> {
  await env.clearFirestore();
  await env.cleanup();
}

/**
 * Generates a membership document ID in the format expected by firestore.rules.
 * @param uid - User ID
 * @param orgId - Organization ID
 */
export function membershipId(uid: string, orgId: string): string {
  return `${uid}_${orgId}`;
}
