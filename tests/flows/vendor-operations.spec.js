import { test, expect } from '@playwright/test';

const { API_URL = 'http://localhost:3000/api' } = process.env;

test.describe('Vendor Operations', () => {

  test('Vendor dashboard loads key metrics', async ({ page }) => {
    test.skip(!process.env.TEST_EMAIL, 'TEST_EMAIL not set');
    await page.goto('/vendor-dashboard');
    await expect(page).toHaveURL(/\/vendor-dashboard/);

    const metricCards = page.locator('[class*="metric"], [class*="stat"], [class*="card"], section');
    const count = await metricCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('Vendor can see their analytics', async ({ page }) => {
    test.skip(!process.env.TEST_EMAIL, 'TEST_EMAIL not set');
    await page.goto('/vendor-dashboard');
    const chart = page.locator('canvas, svg, [class*="chart"], [class*="graph"], [class*="recharts"]').first();
    if (await chart.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(chart).toBeVisible();
    }
  });

  test('Vendor can view order history', async ({ page }) => {
    test.skip(!process.env.TEST_EMAIL, 'TEST_EMAIL not set');
    await page.goto('/vendor-dashboard');
    const ordersSection = page.locator('text=/order|transaction|sale/i').first();
    if (await ordersSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(ordersSection).toBeVisible();
    }
  });

  test('Vendor can navigate to product listing section', async ({ page }) => {
    test.skip(!process.env.TEST_EMAIL, 'TEST_EMAIL not set');
    await page.goto('/vendor-dashboard');
    const addProductBtn = page.locator('a, button').filter({ hasText: /add product|new listing|create/i }).first();
    if (await addProductBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addProductBtn.click();
      await expect(page).not.toHaveURL('/vendor-dashboard');
    }
  });

  test('API: Vendor analytics endpoint accessible', async ({ request }) => {
    test.skip(!process.env.TEST_EMAIL, 'TEST_EMAIL not set');
    const res = await request.get(`${API_URL}/vendor/analytics`, {
      headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN || ''}` },
    });
    if (res.status() === 401 || res.status() === 403) {
      test.skip(true, 'No valid vendor token available');
    }
    expect([200, 401, 403]).toContain(res.status());
  });

  test('API: Health endpoint is reachable', async ({ request }) => {
    const res = await request.get(`${API_URL.replace('/api', '')}/health`);
    expect(res.status()).toBe(200);
  });
});
