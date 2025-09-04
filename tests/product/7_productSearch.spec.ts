import { test } from '@playwright/test';
import { ProductsPage } from '@pages/ProductsPage';
import { getRandomItems } from '@utils/random';


test.describe('Product Search', () => {
  test('7 User can search for fixed + random products', async ({ page }) => {
    const productsPage = new ProductsPage(page);

    // Step 1–5: Go to Products page
    await productsPage.gotoProducts();

    // 🔹 Fixed items per category
    const fixedTerms = [
      'Tops',      // Women
      'Jeans',     // Men
      'Dress',     // Women & Kids
    ];

    // 🔹 Get all product names from the page
    const allProducts = await productsPage.getAllProductNames();

    // 🔹 Pick 5 random products using utils
    const randomTerms = getRandomItems(allProducts, 5);

    // 🔹 Merge all search terms
    const searchTerms = [...fixedTerms, ...randomTerms];
    console.log('🔎 Search terms:', searchTerms);

    // Step 6–8: Search all terms
    for (const term of searchTerms) {
      console.log(`🔍 Searching for: ${term}`);
      await productsPage.searchProduct(term);
      await productsPage.verifySearchResultsVisible();

      // Go back to "All Products" page before next search
      await productsPage.gotoProducts();
    }
  });

  
});
