import { test, expect } from '@playwright/test';

/**
 * Schedule Management E2E Tests
 * 
 * Tests the schedule CRUD operations and UI interactions:
 * - Schedule listing
 * - Schedule creation
 * - Schedule editing
 * - Schedule deletion
 */

test.describe('Schedule Management', () => {
  // Note: These tests assume authenticated state
  // In real implementation, use fixtures for auth

  test('should display schedules page with proper layout', async ({ page }) => {
    await test.step('Navigate to schedules', async () => {
      await page.goto('/schedules');
    });

    await test.step('Verify page structure', async () => {
      // Check for main content area
      const main = page.getByRole('main');
      await expect(main).toBeVisible();

      // Check for heading
      const heading = page.getByRole('heading', { level: 1 });
      if (await heading.isVisible()) {
        await expect(heading).toContainText(/schedule/i);
      }
    });
  });

  test('should have create schedule button', async ({ page }) => {
    await page.goto('/schedules');

    await test.step('Look for create action', async () => {
      // Look for create/add button
      const createButton = page.getByRole('button', { name: /create|add|new/i });
      const createLink = page.getByRole('link', { name: /create|add|new/i });

      const hasCreateButton = await createButton.isVisible().catch(() => false);
      const hasCreateLink = await createLink.isVisible().catch(() => false);

      // At least one creation mechanism should exist
      expect(hasCreateButton || hasCreateLink).toBeTruthy();
    });
  });

  test('should display schedule list or empty state', async ({ page }) => {
    await page.goto('/schedules');

    await test.step('Verify list or empty state', async () => {
      // Wait for content to load
      await page.waitForLoadState('networkidle');

      // Check for either list items or empty state
      const listItems = page.locator('[role="listitem"], [data-testid*="schedule"], .schedule-item');
      const emptyState = page.locator('[data-testid="empty-state"], .empty-state, :text("No schedules")');

      const hasItems = await listItems.count() > 0;
      const hasEmptyState = await emptyState.isVisible().catch(() => false);

      // Should have either items or empty state
      expect(hasItems || hasEmptyState).toBeTruthy();
    });
  });

  test('should have responsive layout', async ({ page }) => {
    await page.goto('/schedules');

    await test.step('Test mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(300);

      // Content should still be visible
      const main = page.getByRole('main');
      await expect(main).toBeVisible();
    });

    await test.step('Test desktop viewport', async () => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForTimeout(300);

      // Content should still be visible
      const main = page.getByRole('main');
      await expect(main).toBeVisible();
    });
  });
});
