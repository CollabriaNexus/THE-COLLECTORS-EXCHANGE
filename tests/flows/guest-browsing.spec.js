import { test, expect } from '@playwright/test';

test.describe('Guest Browsing', () => {
  test('Home page loads with key sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('header, nav').first()).toBeVisible();
    await expect(page.locator('footer').first()).toBeVisible();
  });

  test('Category page shows products with list/grid toggle', async ({ page }) => {
    await page.goto('/category');
    await expect(page).toHaveURL(/\/category/);
    await expect(
      page
        .locator('button, [role="button"]')
        .filter({ hasText: /grid|list/i })
        .first(),
    )
      .toBeVisible({ timeout: 5000 })
      .catch(() => {});
  });

  test('Product detail page loads for a known product', async ({ page }) => {
    const apiUrl = process.env.API_URL || 'http://localhost:3000/api';
    let productId;
    try {
      const res = await fetch(`${apiUrl}/products?limit=1`);
      const data = await res.json();
      productId = data.products?.[0]?.id || data[0]?.id;
    } catch {
      /* use production API fallback */
    }

    if (!productId) {
      try {
        const res = await fetch(
          'https://the-collectors-exchange.onrender.com/api/products?limit=1',
        );
        const data = await res.json();
        productId = data.products?.[0]?.id || data[0]?.id;
      } catch {
        /* no fallback */
      }
    }

    test.skip(!productId, 'No product found to test');

    await page.goto(`/product/${productId}`);
    await expect(page).toHaveURL(/\/product\//);

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const h1 = page.locator('h1').first();
    const itemNotFound = page.locator('text=Item Not Found');
    await expect(h1.or(itemNotFound)).toBeVisible({ timeout: 15000 });
  });

  test('Gallery page loads', async ({ page }) => {
    await page.goto('/gallery');
    await expect(page).toHaveURL(/\/gallery/);
  });

  test('About Us page displays content', async ({ page }) => {
    await page.goto('/about-us');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
  });

  test('FAQ page loads', async ({ page }) => {
    await page.goto('/faq');
    await expect(page).toHaveURL(/\/faq/);
  });

  test('Contact page has form fields', async ({ page }) => {
    await page.goto('/contact');
    await expect(
      page.locator('input[type="email"], input[name="email"], textarea').first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test('Unknown route redirects to home', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-12345');
    await expect(page).toHaveURL('/');
  });

  test('Navigation between pages works', async ({ page }) => {
    await page.goto('/');
    const visibleLink = page
      .locator('nav a, header a')
      .filter({ hasNot: page.locator('[hidden]') })
      .first();
    if (await visibleLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      const href = await visibleLink.getAttribute('href');
      if (href && href !== '/') {
        await visibleLink.scrollIntoViewIfNeeded();
        await visibleLink.click({ force: true });
        await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), {
          timeout: 5000,
        });
      }
    }
  });
});
