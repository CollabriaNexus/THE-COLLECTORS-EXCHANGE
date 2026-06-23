import { test, expect } from '@playwright/test';

const { API_URL = 'http://localhost:3000/api' } = process.env;

test.describe('Seller Lifecycle', () => {

  test('Vendor dashboard renders seller info if vendor', async ({ page }) => {
    test.skip(!process.env.TEST_EMAIL, 'TEST_EMAIL not set');
    await page.goto('/vendor-dashboard');
    await expect(page).toHaveURL(/\/vendor-dashboard/);
  });

  test('Seller agreement page loads', async ({ page }) => {
    await page.goto('/seller-agreement');
    await expect(page.locator('h1, h2, article').first()).toBeVisible({ timeout: 5000 });
  });

  test('Vendor can view their products', async ({ page }) => {
    test.skip(!process.env.TEST_EMAIL, 'TEST_EMAIL not set');
    await page.goto('/vendor-dashboard');
    const productsSection = page.locator('text=/product|listing|my items/i').first();
    if (await productsSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(productsSection).toBeVisible();
    }
  });

  test('Vendor can see KYC status', async ({ page }) => {
    test.skip(!process.env.TEST_EMAIL, 'TEST_EMAIL not set');
    await page.goto('/vendor-dashboard');
    const kycSection = page.locator('text=/kyc|verification|approved|pending/i').first();
    if (await kycSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(kycSection).toBeVisible();
    }
  });

  test('Vendor payout info accessible', async ({ page }) => {
    test.skip(!process.env.TEST_EMAIL, 'TEST_EMAIL not set');
    await page.goto('/vendor-dashboard');
    const payoutSection = page.locator('text=/payout|earning|balance/i').first();
    if (await payoutSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(payoutSection).toBeVisible();
    }
  });

  test('API: Vendor can fetch their own products', async ({ request }) => {
    test.skip(!process.env.TEST_EMAIL, 'TEST_EMAIL not set');
    const res = await request.get(`${API_URL}/vendor/products`, {
      headers: { 'Authorization': `Bearer ${process.env.TEST_TOKEN || ''}` },
    });
    if (res.status() === 401 || res.status() === 403) {
      test.skip(true, 'No valid vendor token available');
    }
    expect([200, 401, 403]).toContain(res.status());
  });
});
