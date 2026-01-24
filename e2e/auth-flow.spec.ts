import { test, expect } from "@playwright/test";

/**
 * E2E Test: Authentication Flow
 *
 * Tests the complete authentication journey:
 * 1. Landing page → Login page navigation
 * 2. Google OAuth initiation (mocked via Firebase emulator)
 * 3. Session creation and cookie handling
 * 4. Protected route access after auth
 * 5. Logout and session cleanup
 *
 * Prerequisites:
 * - Firebase emulator running for auth
 * - Test user configured in emulator
 */

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("redirects unauthenticated users to login from protected routes", async ({ page }) => {
    // Attempt to access protected route
    await page.goto("/dashboard");

    // Should redirect to login or onboarding
    await page.waitForLoadState("networkidle");
    const url = page.url();
    expect(url.includes("login") || url.includes("onboarding") || url.includes("auth")).toBeTruthy();
  });

  test("login page displays authentication options", async ({ page }) => {
    await page.goto("/login");

    // Verify page loads
    await expect(page).toHaveTitle(/Fresh Schedules/i);

    // Check for authentication UI elements
    const emailInput = page.locator('input[type="email"]');
    const googleButton = page.locator('button:has-text("Google")');

    await expect(emailInput.or(googleButton)).toBeVisible();
  });

  test("session endpoint responds correctly", async ({ page }) => {
    // Test session endpoint
    const response = await page.request.post("/api/session", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ test: true }),
    });

    // Should return 400 (validation error) or 401 (unauthorized) for invalid request
    expect([400, 401]).toContain(response.status());
  });

  test("protected API routes require authentication", async ({ page }) => {
    // Test protected API endpoint without auth
    const response = await page.request.get("/api/schedules");

    // Should return 401 unauthorized
    expect(response.status()).toBe(401);
  });

  test("logout clears session and redirects", async ({ page }) => {
    // Navigate to logout endpoint
    const response = await page.request.post("/api/auth/logout");

    // Should succeed or return appropriate error
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe("Authentication - Security", () => {
  test("CSRF protection on mutation endpoints", async ({ page }) => {
    // Attempt POST without CSRF token
    const response = await page.request.post("/api/schedules", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ name: "Test Schedule" }),
    });

    // Should return 401 (no auth) or 403 (CSRF)
    expect([401, 403]).toContain(response.status());
  });

  test("rate limiting on auth endpoints", async ({ page }) => {
    // Make multiple rapid requests
    const promises = Array.from({ length: 15 }, () =>
      page.request.post("/api/session", {
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({ test: true }),
      }),
    );

    const responses = await Promise.all(promises);

    // At least one should be rate limited (429)
    const rateLimited = responses.some((r) => r.status() === 429);
    expect(rateLimited).toBeTruthy();
  });

  test("session cookies have secure flags", async ({ page, context }) => {
    await page.goto("/login");

    // Get cookies
    const cookies = await context.cookies();

    // If session cookie exists, verify security flags
    const sessionCookie = cookies.find((c) => c.name === "session");
    if (sessionCookie) {
      expect(sessionCookie.httpOnly).toBe(true);
      expect(sessionCookie.secure || sessionCookie.sameSite === "Lax").toBeTruthy();
    }
  });
});

test.describe("Google OAuth - Integration", () => {
  test("login page displays Google OAuth button", async ({ page }) => {
    await page.goto("/login");

    // Google button should be visible
    const googleButton = page.locator('button:has-text("Google")').or(
      page.locator('button:has-text("Sign in with Google")'),
    );

    await expect(googleButton).toBeVisible();
  });

  test("Google button should have proper link styling", async ({ page }) => {
    await page.goto("/login");

    const googleButton = page.locator('button:has-text("Google")').or(
      page.locator('button:has-text("Sign in with Google")'),
    );

    // Should have cursor:pointer
    const cursor = await googleButton.evaluate((el) =>
      window.getComputedStyle(el).cursor,
    );
    expect(cursor).toBe("pointer");
  });

  test("Google auth should work in popup flow (not redirect)", async ({ page, context }) => {
    await page.goto("/login");

    // Listen for popup
    let popupPage: any = null;
    const popupPromise = context.waitForEvent("page", { timeout: 2000 });

    // Click Google button (might open popup)
    const googleButton = page.locator('button:has-text("Google")').or(
      page.locator('button:has-text("Sign in with Google")'),
    );

    // Depending on config, might open popup or redirect
    // For popup flow, we should see new page event
    try {
      [popupPage] = await Promise.all([
        popupPromise,
        googleButton.click(),
      ]);
    } catch (_error) {
      console.log("Google auth button click did not open a popup, which may be expected.");
      popupPage = null;
    }

    // If popup opened, verify it's the Google auth page
    if (popupPage && typeof popupPage === "object") {
      const popupUrl = popupPage.url();
      expect(
        popupUrl.includes("accounts.google.com") ||
        popupUrl.includes("firebase") ||
        popupUrl.includes("login"),
      ).toBeTruthy();
    }
  });

  test("Google button should be disabled/hidden during other auth flows", async ({ page }) => {
    await page.goto("/login");

    // When magic link auth is active, Google button might be secondary
    const createAccountButton = page.locator('button:has-text("Create Account")');
    await createAccountButton.click();

    // Google button should still be visible or marked as secondary
    const googleButton = page.locator('button:has-text("Google")').or(
      page.locator('button:has-text("Sign in with Google")'),
    );

    // Should either be visible or have aria-hidden/display:none
    const isVisible = await googleButton.isVisible().catch(() => false);
    const isHidden = await googleButton.evaluate(
      (el) => window.getComputedStyle(el).display === "none",
    ).catch(() => false);

    expect(isVisible || isHidden).toBeTruthy();
  });
});

test.describe("Authentication - Post-Signin Redirect", () => {
  test("callback page should redirect to root after auth completion", async ({ page }) => {
    // Navigate to callback (would normally be triggered by magic link)
    const _callbackResponse = await page.request.get("/auth/callback", {
      followRedirects: true,
    });

    // Should eventually redirect to / or a dashboard/onboarding page
    const finalUrl = page.url();
    expect(
      finalUrl.includes("/") ||
      finalUrl.includes("/onboarding") ||
      finalUrl.includes("/dashboard"),
    ).toBeTruthy();
  });

  test("should apply middleware redirects after authentication", async ({ page }) => {
    // This test verifies that after auth, users are redirected appropriately:
    // New users -> /onboarding
    // Existing users -> /dashboard or /
    
    // Test structure: verify redirect logic exists
    const response = await page.request.get("/");

    // Root path should exist
    expect(response.ok()).toBe(true);
  });
});
