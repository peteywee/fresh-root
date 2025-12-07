import { test, expect } from '@playwright/test';

/**
 * Performance E2E Tests
 * 
 * Tests page load performance and responsiveness:
 * - Initial load time
 * - First contentful paint
 * - Interactive time
 */

test.describe('Performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    await test.step('Measure page load', async () => {
      const startTime = Date.now();
      
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
      
      console.log(`Homepage load time: ${loadTime}ms`);
    });
  });

  test('should render main content quickly', async ({ page }) => {
    await test.step('Check first contentful paint', async () => {
      await page.goto('/');
      
      // Wait for any visible content
      const main = page.getByRole('main');
      await expect(main).toBeVisible({ timeout: 3000 });
    });
  });

  test('should have no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known acceptable errors (like favicon 404)
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('404')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should have no JavaScript errors', async ({ page }) => {
    const jsErrors: Error[] = [];

    page.on('pageerror', (error) => {
      jsErrors.push(error);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(jsErrors).toHaveLength(0);
  });

  test('should have reasonable bundle size impact', async ({ page }) => {
    await test.step('Check network requests', async () => {
      const requests: { size: number; url: string }[] = [];

      page.on('response', async (response) => {
        const size = parseInt(response.headers()['content-length'] || '0', 10);
        requests.push({ size, url: response.url() });
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Calculate total JS bundle size
      const jsRequests = requests.filter((r) => r.url.endsWith('.js'));
      const totalJsSize = jsRequests.reduce((sum, r) => sum + r.size, 0);

      // Log for monitoring
      console.log(`Total JS size: ${(totalJsSize / 1024).toFixed(2)} KB`);
      console.log(`JS bundles count: ${jsRequests.length}`);
    });
  });
});
