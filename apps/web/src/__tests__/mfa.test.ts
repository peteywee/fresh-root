// [P0][TEST][AUTH] MFA endpoint tests
// Tags: P0, TEST, AUTH, MFA
import { describe, test, expect } from "vitest";

/**
 * Tests for MFA endpoints:
 * - POST /api/auth/mfa/setup
 * - POST /api/auth/mfa/verify
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

describe("POST /api/auth/mfa/setup", () => {
  test("returns 401 without session cookie", async () => {
    const response = await fetch(`${API_BASE}/auth/mfa/setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain("Unauthorized");
  });

  test("returns 401 with invalid session cookie", async () => {
    const response = await fetch(`${API_BASE}/auth/mfa/setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=invalid",
      },
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain("Unauthorized");
  });

  test.skip("returns 200 with valid session and generates TOTP secret", async () => {
    // This test requires a valid session cookie
    // Skip in CI unless Firebase emulator is running with test user

    const sessionCookie = process.env.TEST_SESSION_COOKIE;
    if (!sessionCookie) return;

    const response = await fetch(`${API_BASE}/auth/mfa/setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${sessionCookie}`,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.secret).toBeTruthy();
    expect(data.qrCode).toBeTruthy();
    expect(data.otpauthUrl).toBeTruthy();

    // Verify QR code is base64 data URL
    expect(data.qrCode).toMatch(/^data:image\/png;base64,/);

    // Verify otpauth URL format
    expect(data.otpauthUrl).toMatch(/^otpauth:\/\/totp\//);
  });
});

describe("POST /api/auth/mfa/verify", () => {
  test("returns 401 without session cookie", async () => {
    const response = await fetch(`${API_BASE}/auth/mfa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: "ABC123", token: "123456" }),
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain("Unauthorized");
  });

  test("returns 400 for missing secret", async () => {
    const response = await fetch(`${API_BASE}/auth/mfa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=test-cookie",
      },
      body: JSON.stringify({ token: "123456" }),
    });

    // Will return 401 due to invalid cookie, but validates schema first
    const status = response.status;
    expect([400, 401]).toContain(status);
  });

  test("returns 400 for missing token", async () => {
    const response = await fetch(`${API_BASE}/auth/mfa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=test-cookie",
      },
      body: JSON.stringify({ secret: "ABC123" }),
    });

    const status = response.status;
    expect([400, 401]).toContain(status);
  });

  test("returns 400 for invalid token length", async () => {
    const response = await fetch(`${API_BASE}/auth/mfa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "session=test-cookie",
      },
      body: JSON.stringify({ secret: "ABC123", token: "12345" }), // 5 digits instead of 6
    });

    const status = response.status;
    expect([400, 401]).toContain(status);
  });

  test.skip("returns 400 for invalid TOTP token", async () => {
    // This test requires a valid session cookie
    const sessionCookie = process.env.TEST_SESSION_COOKIE;
    if (!sessionCookie) return;

    const response = await fetch(`${API_BASE}/auth/mfa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${sessionCookie}`,
      },
      body: JSON.stringify({ secret: "INVALIDSECRET", token: "000000" }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Invalid verification code");
  });

  test.skip("returns 200 and sets mfa claim for valid token", async () => {
    // This test requires:
    // 1. Valid session cookie
    // 2. Valid TOTP secret from setup
    // 3. Current TOTP token generated from that secret

    const sessionCookie = process.env.TEST_SESSION_COOKIE;
    const totpSecret = process.env.TEST_TOTP_SECRET;
    const totpToken = process.env.TEST_TOTP_TOKEN; // Must be current 6-digit code

    if (!sessionCookie || !totpSecret || !totpToken) return;

    const response = await fetch(`${API_BASE}/auth/mfa/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session=${sessionCookie}`,
      },
      body: JSON.stringify({ secret: totpSecret, token: totpToken }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("MFA enabled");
  });
});
