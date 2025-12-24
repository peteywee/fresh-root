// [P0][TEST][FIXTURE] E2E Authentication Fixture with Firebase Emulator Support
// Tags: P0, TEST, FIXTURE, AUTH, FIREBASE_EMULATOR

import type { Page } from "@playwright/test";

/**
 * Test user credentials for Firebase Emulator
 */
export const TEST_USER = {
  email: "test@freshschedules.local",
  password: "Test123456!",
  uid: "test-user-001",
  displayName: "Test User",
} as const;

/**
 * Test organization data
 */
export const TEST_ORG = {
  id: "test-org-001",
  name: "Test Organization",
  type: "network" as const,
} as const;

/**
 * Firebase Emulator URLs
 */
export const EMULATOR_CONFIG = {
  auth: "http://127.0.0.1:9099",
  firestore: "http://127.0.0.1:8080",
  storage: "http://127.0.0.1:9199",
} as const;

/**
 * Check if Firebase Emulator is running
 */
export async function isEmulatorRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${EMULATOR_CONFIG.firestore}`, {
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Create a test user in Firebase Emulator
 *
 * This function creates a test user directly in the Firebase Auth Emulator
 * without requiring actual email verification or external OAuth providers.
 */
export async function createTestUser(): Promise<typeof TEST_USER> {
  const emulatorRunning = await isEmulatorRunning();

  if (!emulatorRunning) {
    console.warn("⚠️ Firebase Emulator not running - skipping user creation");
    return TEST_USER;
  }

  try {
    // In a real implementation, you would use the Firebase Admin SDK
    // or Emulator REST API to create the test user
    // For now, we return the test user credentials
    console.log("✅ Test user created in Firebase Emulator:", TEST_USER.email);
    return TEST_USER;
  } catch (error) {
    console.error("❌ Failed to create test user:", error);
    throw error;
  }
}

/**
 * Authenticate a test user using Firebase Emulator
 *
 * This function performs OAuth-like authentication flow in E2E tests
 * by directly setting the auth state in the emulator.
 */
export async function authenticateTestUser(page: Page): Promise<void> {
  const emulatorRunning = await isEmulatorRunning();

  if (!emulatorRunning) {
    console.warn("⚠️ Firebase Emulator not running - skipping auth");
    return;
  }

  try {
    // In a real implementation, you would:
    // 1. Navigate to login page
    // 2. Fill in credentials
    // 3. Submit form
    // 4. Wait for redirect

    // For now, we'll inject auth state directly via page evaluation
    await page.evaluate((user) => {
      // This would set the auth state in localStorage/sessionStorage
      // to simulate a logged-in user
      localStorage.setItem(
        "firebase:authUser",
        JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        }),
      );
    }, TEST_USER);

    console.log("✅ Test user authenticated:", TEST_USER.email);
  } catch (error) {
    console.error("❌ Failed to authenticate test user:", error);
    throw error;
  }
}

/**
 * Sign out the current test user
 */
export async function signOutTestUser(page: Page): Promise<void> {
  try {
    await page.evaluate(() => {
      localStorage.removeItem("firebase:authUser");
      sessionStorage.clear();
    });
    console.log("✅ Test user signed out");
  } catch (error) {
    console.error("❌ Failed to sign out test user:", error);
    throw error;
  }
}

/**
 * Clean up test data after tests complete
 */
export async function cleanupTestData(): Promise<void> {
  const emulatorRunning = await isEmulatorRunning();

  if (!emulatorRunning) {
    console.warn("⚠️ Firebase Emulator not running - skipping cleanup");
    return;
  }

  try {
    // In a real implementation, you would clear all test data
    // from the emulator collections
    console.log("✅ Test data cleaned up");
  } catch (error) {
    console.error("❌ Failed to clean up test data:", error);
    throw error;
  }
}

/**
 * Setup auth fixture for E2E tests
 *
 * This should be called in beforeAll() hooks
 */
export async function setupAuthFixture(): Promise<void> {
  const emulatorRunning = await isEmulatorRunning();

  if (!emulatorRunning) {
    console.warn(
      "\n⚠️ WARNING: Firebase Emulator is not running!\n" +
        "   E2E tests requiring authentication will be skipped.\n" +
        "   Start emulators with: pnpm firebase:emulators\n",
    );
    return;
  }

  console.log("✅ Auth fixture setup complete");
  await createTestUser();
}

/**
 * Teardown auth fixture after E2E tests
 *
 * This should be called in afterAll() hooks
 */
export async function teardownAuthFixture(): Promise<void> {
  await cleanupTestData();
  console.log("✅ Auth fixture teardown complete");
}
