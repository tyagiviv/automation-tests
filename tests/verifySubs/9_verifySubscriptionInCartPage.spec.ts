import { test } from '@playwright/test';
import { HomePage } from '@pages/HomePage';
import { CartPage } from '@pages/CartPage';
import { getRandomEmail } from '@utils/random';

test.describe('Verify Email Subscription in Cart Page', () => {
  test('9 Verify Email Subscription in Cart Page', async ({ page }) => {
    const homePage = new HomePage(page);
    const cartPage = new CartPage(page);

    // Navigate to Home page
    await homePage.goto();

    // Click on cart link
    await cartPage.clickCart();

     // Scroll down to footer
    await cartPage.cartScrollToFooter();
    
    // Verify text 'SUBSCRIPTION'
    await homePage.verifySubscriptionText();

    // Enter email and click arrow button
    await homePage.subscribeWithEmail(getRandomEmail());

    // Verify success message
    await homePage.verifySubscriptionSuccess();
  });

  
});
