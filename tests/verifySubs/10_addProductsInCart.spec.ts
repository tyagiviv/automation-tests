import { test, expect } from '@playwright/test';
import { HomePage } from '@pages/HomePage';
import { ProductsPage } from '@pages/ProductsPage';
import { CartPage } from '@pages/CartPage';
import { BasePage } from '@pages/BasePage';
import { getRandomEmail } from '@utils/random';

test.describe('Add Products in cart', () => {
  test('10 Add Product (1 & 2) and check in Cart', async ({ page }) => {
    const homePage = new HomePage(page);
    const cartPage = new CartPage(page);
    const productsPage = new ProductsPage(page);
    const basePage = new BasePage(page);

    // Navigate to Home page
    await homePage.goto();

    // Click first product view details
    await productsPage.viewProductByIndex(0);

    // Navigate to product 1 and add to cart
    await productsPage.selectFirstProduct();

    // Navigate to Home page
    await homePage.goto();

    // Click first product view details
    await productsPage.viewProductByIndex(1);

    // Navigate to product 2 and add to cart
    await productsPage.selectFirstProduct();


    // Click on cart link
    await cartPage.clickCart();

    const productNames = await cartPage.getCartProductNames();
    expect(productNames.length).toBe(2);

    const price = await cartPage.getProductPriceByIndex(0);
    const quantity = await cartPage.getProductQuantityByIndex(0);
    const total = await cartPage.getProductTotalByIndex(0);
    expect(total).toBe(price * quantity);

  
  });

  
});
