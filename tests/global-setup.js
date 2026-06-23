import { chromium } from '@playwright/test';
import { SupabaseHelper } from './helpers/supabase.js';

async function globalSetup() {
  const TEST_EMAIL = process.env.TEST_EMAIL;
  const TEST_PASSWORD = process.env.TEST_PASSWORD;
  const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
  const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;

  if (!TEST_EMAIL || !TEST_PASSWORD) {
    console.warn('WARN: TEST_EMAIL/TEST_PASSWORD not set — auth-dependent tests will be skipped. Create tests/.env from .env.test.example');
    return;
  }

  const apiUrl = process.env.API_URL || 'http://localhost:3000/api';

  const browser = await chromium.launch();
  const context = await browser.newContext();

  try {
    const supabase = new SupabaseHelper(apiUrl);

    const userSession = await supabase.loginWithPassword(TEST_EMAIL, TEST_PASSWORD);
    if (userSession) {
      await context.addInitScript((session) => {
        window.__testSession = session;
      }, userSession);
      await context.storageState({ path: 'tests/.auth/user.json' });
      console.log('User session stored');
    }

    if (TEST_ADMIN_EMAIL && TEST_ADMIN_PASSWORD) {
      const adminSession = await supabase.loginWithPassword(TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD);
      if (adminSession) {
        await context.addInitScript((session) => {
          window.__testSession = session;
        }, adminSession);
        await context.storageState({ path: 'tests/.auth/admin.json' });
        console.log('Admin session stored');
      }
    }
  } catch (err) {
    console.error('Global setup failed:', err.message);
  } finally {
    await browser.close();
  }
}

export default globalSetup;
