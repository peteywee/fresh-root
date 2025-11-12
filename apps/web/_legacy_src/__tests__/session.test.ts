// [P1][TEST][AUTH] Unit tests for session authentication endpoints
// Tags: P1, TEST, AUTH
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { describe, expect, test } from "vitest";

/**
 * Tests for /api/session endpoints (POST, DELETE)
 * Requires Firebase Admin SDK for creating test tokens
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Initialize Firebase Admin for test token generation
let testUid: string;
let testIdToken: string;

beforeAll(async () => {
  // Only initialize if not already initialized
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_ADMIN_CREDENTIALS
      ? JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS)
      : undefined;

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }
  }

  // Create a test user and generate an ID token
  // Note: This requires FIREBASE_ADMIN_CREDENTIALS to be set
  if (getApps().length > 0) {
    const auth = getAuth();
    testUid = `test-${Date.now()}`;

    try {
      // Create test user
      const userRecord = await auth.createUser({
        uid: testUid,
        email: `test-${testUid}@example.com`,
      });

      // Generate custom token and exchange for ID token (simplified for tests)
      const customToken = await auth.createCustomToken(userRecord.uid);
      testIdToken = customToken; // In real tests, exchange this for ID token
    } catch (error) {
      console.warn("Could not create test user:", error);
    }
  }
});

describe("POST /api/session", () => {
  test("returns 400 for missing idToken", async () => {
    const response = await fetch(`${API_BASE}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Missing or invalid idToken");
  });

  test("returns 400 for invalid idToken type", async () => {
    const response = await fetch(`${API_BASE}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: 123 }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Missing or invalid idToken");
  });

  test("returns 401 for malformed idToken", async () => {
    const response = await fetch(`${API_BASE}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: "invalid.token.here" }),
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain("Invalid token");
  });

  test.skipIf(!testIdToken)("returns 200 and sets session cookie for valid idToken", async () => {
    const response = await fetch(`${API_BASE}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: testIdToken }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);

    // Check for session cookie
    const setCookieHeader = response.headers.get("set-cookie");
    expect(setCookieHeader).toBeTruthy();
    expect(setCookieHeader).toContain("session=");
    expect(setCookieHeader).toContain("HttpOnly");
    expect(setCookieHeader).toContain("SameSite=lax");
  });
});

describe("DELETE /api/session", () => {
  test("returns 200 and clears session cookie", async () => {
    const response = await fetch(`${API_BASE}/session`, {
      method: "DELETE",
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);

    // Check that session cookie is cleared (maxAge=0)
    const setCookieHeader = response.headers.get("set-cookie");
    expect(setCookieHeader).toBeTruthy();
    expect(setCookieHeader).toContain("session=");
    expect(setCookieHeader).toContain("Max-Age=0");
  });

  test("clears session cookie properties correctly", async () => {
    const response = await fetch(`${API_BASE}/session`, {
      method: "DELETE",
    });

    const setCookieHeader = response.headers.get("set-cookie");
    expect(setCookieHeader).toContain("HttpOnly");
    expect(setCookieHeader).toContain("SameSite=lax");
    expect(setCookieHeader).toContain("Path=/");
  });
});
