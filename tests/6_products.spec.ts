import { test } from '@playwright/test';
import { ProductsPage } from '../pages/ProductsPage';

test.describe('Products Page', () => {
  test('6.1 User can view first product details successfully', async ({ page }) => {
    const productsPage = new ProductsPage(page);

    // Step 1-5: Navigate to Products page
    await productsPage.gotoProducts();

    // Step 6: Verify products list is visible
    await productsPage.verifyProductsListVisible();

    // Step 7-8: Click first product
    await productsPage.viewProductByIndex(0);

    // Step 9: Verify product details are visible
    await productsPage.verifyProductDetailsVisible();
  });

  test('6.2 User can view 10 random product details (extended regression)', async ({ page }) => {
    const productsPage = new ProductsPage(page);

    await productsPage.gotoProducts();
    await productsPage.verifyProductsListVisible();
    await productsPage.viewRandomProducts(10);
  });
  
});
