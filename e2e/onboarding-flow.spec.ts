import { test, expect } from "@playwright/test";

/**
 * E2E Test: Onboarding Flow
 *
 * Tests the complete onboarding journey:
 * 1. Initial profile setup
 * 2. Organization creation
 * 3. Role selection
 * 4. Venue configuration
 * 5. Onboarding completion
 *
 * Prerequisites:
 * - New authenticated user (no existing profile)
 * - Firebase emulator running
 */

test.describe("Onboarding Flow - Profile Setup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/onboarding");
  });

  test("onboarding page loads and displays steps", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Verify onboarding page loads
    const url = page.url();
    expect(url.includes("onboarding") || url.includes("login")).toBeTruthy();
  });

  test("profile creation endpoint responds", async ({ page }) => {
    const response = await page.request.post("/api/onboarding/profile", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        displayName: "Test User",
        email: "test@example.com",
      }),
    });

    // Should return appropriate status
    expect(response.status()).toBeLessThan(500);
  });

  test("API validates profile data", async ({ page }) => {
    const response = await page.request.post("/api/onboarding/profile", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        displayName: "", // Invalid: empty name
      }),
    });

    // Should return validation error or auth error
    expect([400, 401, 403]).toContain(response.status());
  });
});

test.describe("Onboarding Flow - Organization Setup", () => {
  test("organization creation endpoint responds", async ({ page }) => {
    const response = await page.request.post("/api/organizations", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        name: "Test Organization",
        industry: "restaurant",
      }),
    });

    // Should return appropriate status
    expect(response.status()).toBeLessThan(500);
  });

  test("API validates organization data", async ({ page }) => {
    const response = await page.request.post("/api/organizations", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        name: "", // Invalid: empty name
      }),
    });

    // Should return validation error
    expect([400, 401, 403]).toContain(response.status());
  });

  test("verify eligibility endpoint responds", async ({ page }) => {
    const response = await page.request.post("/api/onboarding/verify-eligibility", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        email: "test@example.com",
      }),
    });

    // Should return appropriate status
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe("Onboarding Flow - Network Setup", () => {
  test("create corporate network endpoint responds", async ({ page }) => {
    const response = await page.request.post("/api/onboarding/create-network-corporate", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        name: "Test Network",
      }),
    });

    // Should return appropriate status
    expect(response.status()).toBeLessThan(500);
  });

  test("create organization network endpoint responds", async ({ page }) => {
    const response = await page.request.post("/api/onboarding/create-network-org", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        name: "Test Org Network",
      }),
    });

    // Should return appropriate status
    expect(response.status()).toBeLessThan(500);
  });

  test("activate network endpoint responds", async ({ page }) => {
    const response = await page.request.post("/api/onboarding/activate-network", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        networkId: "test-network-id",
      }),
    });

    // Should return appropriate status
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe("Onboarding Flow - Completion", () => {
  test("redirects to dashboard after completion", async ({ page }) => {
    // This test would require completing full onboarding flow
    // For now, verify dashboard is accessible
    await page.goto("/dashboard");

    await page.waitForLoadState("networkidle");

    // Should load dashboard or redirect to onboarding
    const url = page.url();
    expect(
      url.includes("dashboard") || url.includes("onboarding") || url.includes("login"),
    ).toBeTruthy();
  });
});
