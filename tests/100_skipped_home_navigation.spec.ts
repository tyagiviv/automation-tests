// tests/skip_example.spec.ts
import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.skip('Skipped test example: navigate to Home page', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto(); // uses baseURL from config
});
