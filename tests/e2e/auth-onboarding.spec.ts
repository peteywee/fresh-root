// [P0][AUTH][TEST] Auth Onboarding Spec tests
// Tags: P0, AUTH, TEST
import { test, expect } from '@playwright/test';

// NOTE: This is a harness template. For full automation you’d provide a test auth emulator UI or stub endpoints.
test('login page renders', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

test('middleware blocks dashboard when logged out', async ({ page }) => {
  const res = await page.goto('/dashboard');
  expect(res?.status()).toBe(200);
  await expect(page).toHaveURL(/\/login$/);
});
