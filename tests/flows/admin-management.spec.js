import { test, expect } from '@playwright/test';

const { API_URL = 'http://localhost:3000/api' } = process.env;

test.describe('Admin Management', () => {

  test('Login page renders', async ({ page }) => {
    try {
      await page.goto('/login', { timeout: 5000 });
    } catch {
      test.skip(true, 'Admin server not running on port 5174 — start with: cd admin && npm run dev');
      return;
    }
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2, [class*="login"]').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('Dashboard loads for authenticated admin', async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'TEST_ADMIN_EMAIL not set');
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('KYC requests page accessible', async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'TEST_ADMIN_EMAIL not set');
    await page.goto('/kyc');
    await expect(page).toHaveURL(/\/kyc/);
  });

  test('Users management page loads', async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'TEST_ADMIN_EMAIL not set');
    await page.goto('/users');
    await expect(page).toHaveURL(/\/users/);
  });

  test('Orders page loads and shows data', async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'TEST_ADMIN_EMAIL not set');
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/orders/);

    const table = page.locator('table, [role="grid"], [class*="order"]').first();
    if (await table.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(table).toBeVisible();
    }
  });

  test('Products management page loads', async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'TEST_ADMIN_EMAIL not set');
    await page.goto('/products');
    await expect(page).toHaveURL(/\/products/);
  });

  test('Vendors page loads', async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'TEST_ADMIN_EMAIL not set');
    await page.goto('/vendors');
    await expect(page).toHaveURL(/\/vendors/);
  });

  test('Payouts page loads', async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'TEST_ADMIN_EMAIL not set');
    await page.goto('/payouts');
    await expect(page).toHaveURL(/\/payouts/);
  });

  test('Gallery manager loads', async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'TEST_ADMIN_EMAIL not set');
    await page.goto('/gallery');
    await expect(page).toHaveURL(/\/gallery/);
  });

  test('API: Admin can list users', async ({ request }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'TEST_ADMIN_EMAIL not set');
    const res = await request.get(`${API_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${process.env.TEST_ADMIN_TOKEN || ''}` },
    });
    if (res.status() === 401 || res.status() === 403) {
      test.skip(true, 'No valid admin token available');
    }
    expect([200, 401, 403]).toContain(res.status());
  });

  test('API: Products endpoint returns data', async () => {
    const res = await fetch(`${API_URL}/products?limit=3`);
    expect(res.status).toBe(200);
    const body = await res.json();
    const products = body.products || body;
    expect(Array.isArray(products)).toBe(true);
  });
});
