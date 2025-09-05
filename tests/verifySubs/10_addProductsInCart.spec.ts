import { test, expect } from '@playwright/test';
import { HomePage } from '@pages/HomePage';
import { ProductsPage } from '@pages/ProductsPage';
import { CartPage } from '@pages/CartPage';

test.describe('Add Products in cart', () => {
  test('10 Add Product (1 & 2) and check in Cart', async ({ page }) => {
    const homePage = new HomePage(page);
    const cartPage = new CartPage(page);
    const productsPage = new ProductsPage(page);

    // Navigate to Home page
    await homePage.goto();

    // --- Add product 1 ---
    await productsPage.viewProductByIndex(0);
    await productsPage.selectProduct();

    // Navigate to Home page again
    await homePage.goto();

    // --- Add product 2 ---
    await productsPage.viewProductByIndex(1);
    await productsPage.selectProduct();

    // --- Go to Cart ---
    await cartPage.clickCart();
    await cartPage.logCartContents();

    // --- Assertions ---
    const productNames = await cartPage.getCartProductNames();
    expect(productNames.length).toBe(2);
  });
});
