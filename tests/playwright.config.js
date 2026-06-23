import { defineConfig } from '@playwright/test';
import fs from 'fs';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5174';
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

function useWithAuth(baseURL, authFile) {
  const use = { baseURL };
  if (fs.existsSync(authFile)) {
    use.storageState = authFile;
  }
  return use;
}

export default defineConfig({
  testDir: './flows',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },
  projects: [
    {
      name: 'guest-browsing',
      testMatch: 'guest-browsing.spec.js',
      use: {
        baseURL: FRONTEND_URL,
      },
    },
    {
      name: 'auth-cart-checkout',
      testMatch: 'auth-cart-checkout.spec.js',
      use: useWithAuth(FRONTEND_URL, 'tests/.auth/user.json'),
    },
    {
      name: 'seller-lifecycle',
      testMatch: 'seller-lifecycle.spec.js',
      use: useWithAuth(FRONTEND_URL, 'tests/.auth/vendor.json'),
    },
    {
      name: 'admin-management',
      testMatch: 'admin-management.spec.js',
      use: useWithAuth(ADMIN_URL, 'tests/.auth/admin.json'),
    },
    {
      name: 'vendor-operations',
      testMatch: 'vendor-operations.spec.js',
      use: useWithAuth(FRONTEND_URL, 'tests/.auth/vendor.json'),
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: 'backend',
      url: 'http://localhost:3000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      command: 'npm run dev',
      cwd: 'admin',
      url: 'http://localhost:5174',
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
  globalSetup: './global-setup.js',
});
