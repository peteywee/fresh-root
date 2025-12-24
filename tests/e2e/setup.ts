// [P0][TEST][SETUP] E2E Test Setup with Server Health Check
// Tags: P0, TEST, SETUP, E2E

import { TEST_USER, EMULATOR_CONFIG, isEmulatorRunning } from "./fixtures/auth";

export const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

export let serverAvailable = false;
export let authToken: string | null = null;
export let sessionCookie: string | null = null;

/**
 * Check if the server is available before running tests
 */
export async function checkServerHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${BASE_URL}/api/health`, {
      signal: controller.signal,
    });

    serverAvailable = response.ok;
    return serverAvailable;
  } catch {
    serverAvailable = false;
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Helper to make fetch requests with proper error handling
 */
export async function safeFetch(
  url: string,
  options?: RequestInit,
): Promise<{ response: Response | null; error: string | null }> {
  if (!serverAvailable) {
    return { response: null, error: "Server not available" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return { response, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { response: null, error: message };
  }
}

/**
 * Skip test if server is not available
 */
export function skipIfNoServer() {
  if (!serverAvailable) {
    console.warn("⚠️ Skipping test: Server not available at", BASE_URL);
    return true;
  }
  return false;
}

/**
 * Test result type for reporting
 */
export interface TestResult {
  endpoint: string;
  method: string;
  status: "pass" | "fail" | "skip";
  expectedStatus?: number | string;
  actualStatus?: number;
  error?: string;
}

/**
 * Collect test results for reporting
 */
export const testResults: TestResult[] = [];

export function recordResult(result: TestResult) {
  testResults.push(result);
}

/**
 * Global setup for E2E tests
 */
export async function setupE2E() {
  console.log(`\n🔍 Checking server at ${BASE_URL}...`);
  const available = await checkServerHealth();

  if (available) {
    console.log(`✅ Server is available at ${BASE_URL}\n`);
  } else {
    console.warn(`⚠️ Server is NOT available at ${BASE_URL}`);
    console.warn(`   E2E tests will be marked as skipped.\n`);
  }

  return available;
}

/**
 * Generate test report
 */
export function generateReport() {
  const passed = testResults.filter((r) => r.status === "pass").length;
  const failed = testResults.filter((r) => r.status === "fail").length;
  const skipped = testResults.filter((r) => r.status === "skip").length;

  console.log("\n📊 E2E Test Report");
  console.log("==================");
  console.log(`✅ Passed:  ${passed}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📝 Total:   ${testResults.length}`);

  if (failed > 0) {
    console.log("\n❌ Failed Tests:");
    testResults
      .filter((r) => r.status === "fail")
      .forEach((r) => {
        console.log(
          `  - ${r.method} ${r.endpoint}: Expected ${r.expectedStatus}, got ${r.actualStatus}`,
        );
        if (r.error) console.log(`    Error: ${r.error}`);
      });
  }

  return { passed, failed, skipped, total: testResults.length };
}

/**
 * Authenticate with Firebase Emulator and create session cookie
 * Returns the session cookie for use in subsequent requests
 */
export async function authenticateForTests(): Promise<string | null> {
  const emulatorRunning = await isEmulatorRunning();

  if (!emulatorRunning) {
    console.warn("⚠️ Firebase Emulator not running - auth tests will be skipped");
    return null;
  }

  try {
    // Step 1: Create test user or sign in via emulator REST API
    let idToken: string | null = null;

    const signUpUrl = `${EMULATOR_CONFIG.auth}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`;
    const signUpResponse = await fetch(signUpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
        returnSecureToken: true,
      }),
    });

    if (signUpResponse.ok) {
      const data = await signUpResponse.json();
      idToken = data.idToken;
      console.log("✅ Test user created");
    } else {
      // User may already exist, try signing in
      const signInUrl = `${EMULATOR_CONFIG.auth}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`;
      const signInResponse = await fetch(signInUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: TEST_USER.email,
          password: TEST_USER.password,
          returnSecureToken: true,
        }),
      });

      if (signInResponse.ok) {
        const data = await signInResponse.json();
        idToken = data.idToken;
        console.log("✅ Test user signed in");
      }
    }

    if (!idToken) {
      console.warn("⚠️ Failed to get idToken from Firebase Emulator");
      return null;
    }

    authToken = idToken;

    // Step 2: Exchange idToken for session cookie via POST /api/session
    const sessionResponse = await fetch(`${BASE_URL}/api/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!sessionResponse.ok) {
      console.warn(`⚠️ Failed to create session: ${sessionResponse.status}`);
      return null;
    }

    // Extract session cookie from Set-Cookie header
    const setCookie = sessionResponse.headers.get("set-cookie");
    if (setCookie) {
      const match = setCookie.match(/session=([^;]+)/);
      if (match) {
        sessionCookie = match[1];
        console.log("✅ Session cookie obtained");
        return sessionCookie;
      }
    }

    console.warn("⚠️ No session cookie in response");
    return null;
  } catch (error) {
    console.error("❌ Auth error:", error);
    return null;
  }
}

/**
 * Make authenticated fetch request using session cookie
 */
export async function authFetch(
  url: string,
  options?: RequestInit,
): Promise<{ response: Response | null; error: string | null }> {
  if (!serverAvailable) {
    return { response: null, error: "Server not available" };
  }

  if (!sessionCookie) {
    return { response: null, error: "Not authenticated (no session cookie)" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        Cookie: `session=${sessionCookie}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return { response, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { response: null, error: message };
  }
}

/**
 * Clear auth token and session cookie after tests
 */
export function clearAuthToken(): void {
  authToken = null;
  sessionCookie = null;
}
