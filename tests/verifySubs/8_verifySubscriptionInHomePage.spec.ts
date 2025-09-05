import { test } from '@playwright/test';
import { HomePage } from '@pages/HomePage';
import { getRandomEmail } from '@utils/random';

test.describe('Verify Email Subscription in Home Page', () => {
  test('8 Verify Email Subscription in Home Page', async ({ page }) => {
    const homePage = new HomePage(page);

    // Step 1: Navigate to Home page
    await homePage.goto();

    // Step 2: Verify that home page is visible successfully
    // (already checked in goto() via title assertion)

    // Step 3: Scroll down to footer
    await homePage.scrollToFooter();

    // Step 4: Verify text 'SUBSCRIPTION'
    await homePage.verifySubscriptionText();

    // Step 5 & 6: Enter email and click arrow button
    await homePage.subscribeWithEmail(getRandomEmail());

    // Step 7: Verify success message
    await homePage.verifySubscriptionSuccess();
  });

  
});
