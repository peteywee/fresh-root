// [P0][TEST][TEST] Onboarding Happy Path Spec tests
// Tags: P0, TEST, TEST
import { test, expect } from "@playwright/test";

test("onboarding happy path (profile → admin form → create network) - stubbed", async ({
  page,
}) => {
  // Start at profile
  await page.goto("/onboarding/profile");

  await page.getByLabel("Full name").fill("Test Manager");
  await page.getByLabel("Phone").fill("+15551234567");
  await page.getByLabel("Language").selectOption("en");
  await page.getByLabel("I am a").selectOption("manager");

  await Promise.all([
    page.waitForNavigation(),
    page.getByRole("button", { name: /Continue/i }).click(),
  ]);

  // Should land on intent selector
  await expect(page).toHaveURL(/\/onboarding\/intent/);

  // Navigate to admin form to generate a token
  await page.goto("/onboarding/admin-form");
  await page.getByLabel("Legal entity name").fill("Test Co LLC");
  await page.getByLabel("Business email").fill("admin@example.com");

  await Promise.all([
    page.waitForResponse(
      (r) => r.url().endsWith("/api/onboarding/admin-form") && r.status() === 200,
    ),
    page.getByRole("button", { name: /Save and continue/i }).click(),
  ]);

  // The UI shows the token and a link to continue
  const tokenEl = page.getByText(/Form saved/).first();
  await expect(tokenEl).toBeVisible();

  // Continue to create network
  await Promise.all([
    page.waitForNavigation(),
    page.getByRole("link", { name: /Continue to create network/i }).click(),
  ]);

  // On create-network-org page, ensure we can submit and get a stubbed response
  await page.getByLabel("Organization name").fill("Test Co Org");
  await page.getByLabel("Initial venue name").fill("Main Venue");

  await page.getByRole("button", { name: /Create network/i }).click();

  // The page renders the JSON result in a pre element
  const pre = page.locator("pre");
  await expect(pre).toContainText("stub-network-id");
});
