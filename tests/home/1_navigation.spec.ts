import { test } from '@playwright/test';
import { HomePage } from '@pages/HomePage';  // ✅ named import

test('1 navigate to Signup / Login from header', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await home.openSignupLogin();
});
