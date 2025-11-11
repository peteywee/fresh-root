// [P0][TEST][TEST] Onboarding Full Flow Spec tests
// Tags: P0, TEST, TEST
/**
 * [P1][TEST][E2E] Onboarding Happy-Path E2E Test
 * Tags: e2e, onboarding, playwright, test
 *
 * Overview:
 * - End-to-end test covering full onboarding flow
 * - Tests: sign-up → bootstrap → verify-eligibility → create-network → complete
 * - Uses Playwright for browser automation
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Onboarding Happy Path", () => {
  const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";

  test("should complete full onboarding flow: create-org", async ({ page }: { page: Page }) => {
    // 1. Sign in / Navigate to onboarding
    await page.goto(`${baseUrl}/auth/login`);
    await page.fill('input[type="email"]', "test-user@example.com");
    await page.fill('input[type="password"]', "Test123!@#");
    await page.click('button:has-text("Sign In")');

    // Wait for redirect to onboarding
    await page.waitForURL(`${baseUrl}/onboarding/**`);
    const currentUrl = page.url();
    expect(currentUrl).toContain("/onboarding");

    // 2. Bootstrap session (auto-runs on layout load)
    const bootstrapResponse = await page.request.post(`${baseUrl}/api/session/bootstrap`);
    expect(bootstrapResponse.ok()).toBe(true);
    const sessionData = await bootstrapResponse.json();
    expect(sessionData.user).toBeDefined();
    expect(sessionData.user.onboarding).toBeDefined();

    // 3. Fill profile page
    await page.goto(`${baseUrl}/onboarding/profile`);
    await page.fill('input[name="fullName"]', "John Doe");
    await page.fill('input[name="preferredName"]', "John");
    await page.fill('input[name="phone"]', "555-1234");
    await page.selectOption('select[name="timeZone"]', "America/New_York");
    await page.selectOption('select[name="selfDeclaredRole"]', "owner_founder_director");
    await page.click('button:has-text("Next")');

    // 4. Verify eligibility
    const eligibilityResponse = await page.request.post(
      `${baseUrl}/api/onboarding/verify-eligibility`,
      {
        data: {
          selfDeclaredRole: "owner_founder_director",
        },
      },
    );
    expect(eligibilityResponse.ok()).toBe(true);
    const eligibilityData = await eligibilityResponse.json();
    expect(eligibilityData.allowed).toBe(true);

    // 5. Select intent (create-org)
    await page.goto(`${baseUrl}/onboarding/intent`);
    await page.click('button:has-text("Create New Organization")');
    await page.waitForURL(`${baseUrl}/onboarding/**`);

    // 6. Fill admin form
    await page.goto(`${baseUrl}/onboarding/admin-form`);
    await page.fill('input[name="firstName"]', "John");
    await page.fill('input[name="lastName"]', "Doe");
    await page.selectOption('select[name="taxIdType"]', "ssn");
    await page.fill('input[name="taxIdLast4"]', "1234");
    await page.click('button:has-text("Submit")');

    // Verify form submission
    const adminFormResponse = await page.request.post(`${baseUrl}/api/onboarding/admin-form`, {
      data: {
        firstName: "John",
        lastName: "Doe",
        taxIdType: "ssn",
        taxIdLast4: "1234",
      },
    });
    expect(adminFormResponse.ok()).toBe(true);

    // 7. Create network + org
    await page.goto(`${baseUrl}/onboarding/create-network-org`);
    await page.fill('input[name="orgName"]', "Acme Corp");
    await page.fill('input[name="venueName"]', "Main Office");
    await page.fill('input[name="city"]', "New York");
    await page.fill('input[name="state"]', "NY");
    await page.click('button:has-text("Create Network")');

    // Verify network creation
    const createNetworkResponse = await page.request.post(
      `${baseUrl}/api/onboarding/create-network-org`,
      {
        data: {
          networkName: "Acme Corp Network",
          orgName: "Acme Corp",
          venueName: "Main Office",
          city: "New York",
          state: "NY",
        },
      },
    );
    expect(createNetworkResponse.ok()).toBe(true);
    const networkData = await createNetworkResponse.json();
    expect(networkData.networkId).toBeDefined();
    expect(networkData.orgId).toBeDefined();

    // 8. Verify onboarding is marked complete
    const finalBootstrap = await page.request.post(`${baseUrl}/api/session/bootstrap`);
    const finalSessionData = await finalBootstrap.json();
    expect(finalSessionData.user.onboarding.status).toBe("completed");

    // 9. Verify user is redirected to app dashboard
    await page.goto(`${baseUrl}/app`);
    expect(page.url()).toContain("/app");
    expect(await page.isVisible("text=Welcome")).toBe(true);
  });

  test("should complete full onboarding flow: join-with-token", async ({ page }: { page: Page }) => {
    // 1. Sign in
    await page.goto(`${baseUrl}/auth/login`);
    await page.fill('input[type="email"]', "join-user@example.com");
    await page.fill('input[type="password"]', "Test123!@#");
    await page.click('button:has-text("Sign In")');

    // 2. Bootstrap session
    await page.waitForURL(`${baseUrl}/onboarding/**`);
    const bootstrapResponse = await page.request.post(`${baseUrl}/api/session/bootstrap`);
    expect(bootstrapResponse.ok()).toBe(true);

    // 3. Fill profile
    await page.goto(`${baseUrl}/onboarding/profile`);
    await page.fill('input[name="fullName"]', "Jane Smith");
    await page.fill('input[name="preferredName"]', "Jane");
    await page.selectOption('select[name="selfDeclaredRole"]', "manager_supervisor");
    await page.click('button:has-text("Next")');

    // 4. Verify eligibility
    const eligibilityResponse = await page.request.post(
      `${baseUrl}/api/onboarding/verify-eligibility`,
      {
        data: {
          selfDeclaredRole: "manager_supervisor",
        },
      },
    );
    expect(eligibilityResponse.ok()).toBe(true);

    // 5. Select intent (join-existing)
    await page.goto(`${baseUrl}/onboarding/intent`);
    await page.click('button:has-text("Join Existing Organization")');

    // 6. Enter join token
    const testToken = process.env.TEST_JOIN_TOKEN || "test-token-12345";
    await page.goto(`${baseUrl}/onboarding/join`);
    await page.fill('input[name="token"]', testToken);
    await page.click('button:has-text("Join")');

    // Verify token join
    const joinResponse = await page.request.post(`${baseUrl}/api/onboarding/join-with-token`, {
      data: {
        token: testToken,
      },
    });
    expect(joinResponse.ok()).toBe(true);
    const joinData = await joinResponse.json();
    expect(joinData.networkId).toBeDefined();
    expect(joinData.orgId).toBeDefined();

    // 7. Verify onboarding is marked complete
    const finalBootstrap = await page.request.post(`${baseUrl}/api/session/bootstrap`);
    const finalSessionData = await finalBootstrap.json();
    expect(finalSessionData.user.onboarding.status).toBe("completed");

    // 8. Verify user can access app
    await page.goto(`${baseUrl}/app`);
    expect(page.url()).toContain("/app");
  });

  test("should reject invalid join token", async ({ page }: { page: Page }) => {
    await page.goto(`${baseUrl}/auth/login`);
    await page.fill('input[type="email"]', "invalid-token-user@example.com");
    await page.fill('input[type="password"]', "Test123!@#");
    await page.click('button:has-text("Sign In")');

    await page.goto(`${baseUrl}/onboarding/join`);
    await page.fill('input[name="token"]', "invalid-token-xyz");
    await page.click('button:has-text("Join")');

    // Verify error is shown
    const errorMessage = await page.locator("text=Invalid token").isVisible();
    expect(errorMessage).toBe(true);
  });

  test("should enforce rate-limiting on verify-eligibility", async ({ page }: { page: Page }) => {
    const testToken = "rate-limit-test-token";

    // Make 5 requests (should all succeed)
    for (let i = 0; i < 5; i++) {
      const response = await page.request.post(`${baseUrl}/api/onboarding/verify-eligibility`, {
        data: { selfDeclaredRole: "owner_founder_director" },
      });
      expect([200, 401]).toContain(response.status()); // 401 if not auth, 200 if valid
    }

    // 6th request should be rate-limited
    const rateLimitedResponse = await page.request.post(
      `${baseUrl}/api/onboarding/verify-eligibility`,
      {
        data: { selfDeclaredRole: "owner_founder_director" },
      },
    );

    // Should get 429 Too Many Requests
    expect(rateLimitedResponse.status()).toBe(429);
  });
});
