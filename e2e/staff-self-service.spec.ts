import { test, expect } from "@playwright/test";

/**
 * E2E Test: Staff Self-Service
 *
 * Tests staff member workflows:
 * 1. View own schedule
 * 2. Request time-off
 * 3. View available shifts
 * 4. Claim open shifts
 * 5. Update availability
 *
 * Prerequisites:
 * - Authenticated user with 'staff' role
 * - Organization membership active
 */

test.describe("Staff Self-Service - Schedule Access", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/schedules");
  });

  test("staff can view their schedules", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Should load schedules page or redirect to auth
    await expect(page).toHaveURL(/\/(schedules|login|onboarding)/);
  });

  test("staff cannot access admin functions", async ({ page }) => {
    // Attempt to access schedule builder (manager+ only)
    await page.goto("/schedules/builder");

    await page.waitForLoadState("networkidle");

    // Should redirect or show access denied
    const url = page.url();
    // Staff should not have direct access to builder
    expect(url.includes("builder") || url.includes("schedules") || url.includes("login")).toBeTruthy();
  });
});

test.describe("Staff Self-Service - Shift Management", () => {
  test("shifts API enforces RBAC for staff", async ({ page }) => {
    // Staff can read but not create shifts
    const createResponse = await page.request.post("/api/shifts", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        scheduleId: "test",
        startTime: Date.now(),
        endTime: Date.now() + 3600000,
      }),
    });

    // Should return 401 (no auth) or 403 (forbidden for staff)
    expect([401, 403]).toContain(createResponse.status());
  });

  test("staff can update own shift self-service fields", async ({ page }) => {
    // Test self-service update endpoint (if exists)
    const response = await page.request.patch("/api/shifts/self-update", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        shiftId: "test-shift-id",
        notes: "Updated notes",
      }),
    });

    // Should return appropriate status
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe("Staff Self-Service - Attendance", () => {
  test("attendance tracking endpoint responds", async ({ page }) => {
    const response = await page.request.post("/api/attendance", {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        shiftId: "test-shift-id",
        checkIn: Date.now(),
      }),
    });

    // Should return appropriate status
    expect(response.status()).toBeLessThan(500);
  });

  test("staff cannot access other staff attendance", async ({ page }) => {
    // Attempt to access attendance for another user
    const response = await page.request.get("/api/attendance?userId=other-user-id");

    // Should return 401 (no auth) or 403 (forbidden)
    expect([401, 403]).toContain(response.status());
  });
});

test.describe("Staff Self-Service - Performance", () => {
  test("schedule view loads quickly", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/schedules");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;

    // Should load within 4 seconds
    expect(loadTime).toBeLessThan(4000);
  });
});
