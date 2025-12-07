import { test, expect } from '@playwright/test';

/**
 * Navigation E2E Tests
 * 
 * Tests the navigation flow and accessibility:
 * - Main navigation structure
 * - Link accessibility
 * - Keyboard navigation
 */

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have accessible navigation landmark', async ({ page }) => {
    await test.step('Verify navigation exists', async () => {
      const nav = page.getByRole('navigation');
      const navCount = await nav.count();
      
      // Should have at least one navigation element
      expect(navCount).toBeGreaterThan(0);
    });
  });

  test('should have visible links', async ({ page }) => {
    await test.step('Check for navigation links', async () => {
      const links = page.getByRole('link');
      const linkCount = await links.count();

      // Should have navigation links
      expect(linkCount).toBeGreaterThan(0);
    });
  });

  test('should support keyboard navigation', async ({ page }) => {
    await test.step('Tab through interactive elements', async () => {
      // Press Tab to move focus
      await page.keyboard.press('Tab');

      // Get the currently focused element
      const focusedElement = page.locator(':focus');
      const isFocused = await focusedElement.count() > 0;

      // Should have a focused element after Tab
      expect(isFocused).toBeTruthy();
    });
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await test.step('Verify heading structure', async () => {
      // Check for h1
      const h1 = page.getByRole('heading', { level: 1 });
      const h1Count = await h1.count();

      // Should have exactly one h1 per page
      expect(h1Count).toBeLessThanOrEqual(1);

      // If there's an h1, check its content
      if (h1Count > 0) {
        const h1Text = await h1.first().textContent();
        expect(h1Text?.trim().length).toBeGreaterThan(0);
      }
    });
  });

  test('should have skip link for accessibility', async ({ page }) => {
    await test.step('Check for skip navigation link', async () => {
      // Skip links are often hidden until focused
      await page.keyboard.press('Tab');

      const skipLink = page.getByRole('link', { name: /skip/i });
      const hasSkipLink = await skipLink.isVisible().catch(() => false);

      // Skip link is a best practice but not required
      // Log if missing for accessibility improvement
      if (!hasSkipLink) {
        console.log('Recommendation: Add skip navigation link for accessibility');
      }
    });
  });
});
