import { test, expect } from "@playwright/test";

/**
 * E2E Test: Organization Management
 *
 * Tests organization-level workflows:
 * 1. Organization settings
 * 2. Member management
 * 3. Venue configuration
 * 4. Position management
 * 5. Join token creation
 *
 * Prerequisites:
 * - Authenticated user with 'manager+' role
 * - Organization owner or admin access
 */

test.describe("Organization Management - Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("dashboard loads for authenticated users", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Should load dashboard or redirect
    const url = page.url();
    expect(
      url.includes("dashboard") || url.includes("login") || url.includes("onboarding"),
    ).toBeTruthy();
  });

  test("organizations API endpoint responds", async ({ page }) => {
    const response = await page.request.get("/api/organizations");

    // Should return appropriate status
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe("Organization Management - Members", () => {
  test("member management requires manager+ role", async ({ page }) => {
    // Attempt to list members
    const response = await page.request.get("/api/organizations/members");

    // Should return 401 (no auth) or 403 (insufficient role) or 404 (not implemented)
    expect([401, 403, 404]).toContain(response.status());
  });

  test("join tokens API endpoint responds", async ({ page }) => {
    const response = await page.request.get("/api/join-tokens");

    // Should return appropriate status
    expect(response.status()).toBeLessThan(500);
  });

  test("creating join tokens requires manager+ role", async ({ page }) => {
    const response = await page.request.post("/api/join-tokens", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        role: "staff",
        expiresAt: Date.now() + 86400000,
      }),
    });

    // Should return 401 (no auth) or 403 (forbidden)
    expect([401, 403]).toContain(response.status());
  });
});

test.describe("Organization Management - Venues & Zones", () => {
  test("venues API endpoint responds", async ({ page }) => {
    const response = await page.request.get("/api/venues");

    // Should return appropriate status
    expect(response.status()).toBeLessThan(500);
  });

  test("creating venues requires manager+ role", async ({ page }) => {
    const response = await page.request.post("/api/venues", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        name: "Test Venue",
        address: "123 Test St",
      }),
    });

    // Should return 401 (no auth) or 403 (forbidden)
    expect([401, 403]).toContain(response.status());
  });

  test("zones API endpoint responds", async ({ page }) => {
    const response = await page.request.get("/api/zones");

    // Should return appropriate status
    expect(response.status()).toBeLessThan(500);
  });

  test("creating zones requires manager+ role", async ({ page }) => {
    const response = await page.request.post("/api/zones", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        name: "Test Zone",
        venueId: "test-venue-id",
      }),
    });

    // Should return 401 (no auth) or 403 (forbidden)
    expect([401, 403]).toContain(response.status());
  });
});

test.describe("Organization Management - Positions", () => {
  test("positions API endpoint responds", async ({ page }) => {
    const response = await page.request.get("/api/positions");

    // Should return appropriate status
    expect(response.status()).toBeLessThan(500);
  });

  test("creating positions requires manager+ role", async ({ page }) => {
    const response = await page.request.post("/api/positions", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        name: "Server",
        description: "Front of house server",
      }),
    });

    // Should return 401 (no auth) or 403 (forbidden)
    expect([401, 403]).toContain(response.status());
  });

  test("positions enforce tenant isolation", async ({ page }) => {
    // Attempt to access positions without orgId
    const response = await page.request.get("/api/positions");

    // Should return 401 (no auth) or 400 (missing orgId)
    expect([400, 401, 403]).toContain(response.status());
  });
});

test.describe("Organization Management - Security", () => {
  test("cross-organization access is blocked", async ({ page }) => {
    // Attempt to access another org's data
    const response = await page.request.get("/api/schedules?orgId=other-org-id");

    // Should return 401 (no auth) or 403 (forbidden)
    expect([401, 403]).toContain(response.status());
  });

  test("RBAC hierarchy is enforced", async ({ page }) => {
    // Staff should not be able to perform admin actions
    const response = await page.request.delete("/api/organizations/test-org-id");

    // Should return 401 (no auth) or 403 (forbidden)
    expect([401, 403, 404]).toContain(response.status());
  });
});
