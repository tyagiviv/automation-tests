import { Locator, expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  readonly productsLink: Locator;
  readonly productList: Locator;
  readonly searchField: Locator;
  readonly searchButton: Locator;
  readonly firstProductAddToCartBtn: Locator;
  readonly secondProductAddToCartBtn: Locator;



  constructor(page: Page) {
    super(page);

    this.productsLink = page.getByRole('link', { name: 'Products' });
    this.productList = page.locator('.product-image-wrapper'); // adjust selector to match your product items
    this.searchField = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.firstProductAddToCartBtn = page.locator('button.btn.btn-default.cart').first();
    this.secondProductAddToCartBtn = page.locator('button.btn.btn-default.cart').nth(1);



  }

  async gotoProducts() {
    await this.page.goto('/');  // uses baseURL from config
    await this.dismissPopups(); // dismiss any popups
    await expect(this.page).toHaveTitle(/Automation Exercise/i);

    await this.productsLink.click();
    await expect(this.page.locator('h2.title.text-center', { hasText: 'All Products' })).toBeVisible();
  }

  async verifyProductsListVisible() {
    await expect(this.productList.first()).toBeVisible();
  }
  
  async viewProductByIndex(index: number = 0) {
    const product = this.productList.nth(index);

    // Only select <a> with href starting with /product_details/
    const productLink = product.locator('a[href^="/product_details/"]');
    const href = await productLink.getAttribute('href');

    await productLink.click();

    // Verify URL contains the correct product number (e.g., /product_details/1)
    await expect(this.page).toHaveURL(new RegExp(`.*${href?.split('/').pop()}.*`));
  }

  async verifyProductDetailsVisible() {
    const productInfo = this.page.locator('.product-information');
    // Product name Category   // Price  // Availability // Condition   // Brand
    await expect(productInfo.locator('h2')).toBeVisible();
    await expect(productInfo.locator('p:has-text("Category")')).toBeVisible();
    await expect(productInfo.locator('span > span')).toBeVisible();
    await expect(productInfo.locator('p:has-text("Availability")')).toBeVisible();
    await expect(productInfo.locator('p:has-text("Condition")')).toBeVisible();
    await expect(productInfo.locator('p:has-text("Brand")')).toBeVisible();
  }

  async viewRandomProducts(count: number = 10) {
    const total = await this.productList.count();
    if (total === 0) throw new Error("No products found on page");

    // Create shuffled indices
    const indices = [...Array(total).keys()].sort(() => 0.5 - Math.random());
    const selected = indices.slice(0, Math.min(count, total));

    for (const i of selected) {
        const product = this.productList.nth(i);

        // Find product link
        const productLink = product.locator('a[href^="/product_details/"]');
        const href = await productLink.getAttribute('href');

        // Click product
        await productLink.click();

        // Verify details page
        await this.verifyProductDetailsVisible();

        // Log which product was tested (useful for debugging random runs)
        console.log(`✅ Verified product: ${href}`);

        // Go back to product list
        await this.page.goBack();
        await expect(this.page.locator('h2.title.text-center', { hasText: 'All Products' })).toBeVisible();
    }
  }

  async searchProduct(productName: string) {
    await this.searchField.fill(productName);
    await this.searchButton.click();
  }

  async verifySearchResultsVisible() {
    await expect(this.page.locator('h2.title.text-center', { hasText: 'Searched Products' })).toBeVisible();
    await expect(this.productList.first()).toBeVisible();
    const count = await this.productList.count();
    expect(count).toBeGreaterThan(0);
  }

  async getAllProductNames(): Promise<string[]> {
    return await this.page.locator('.productinfo p').allInnerTexts();
  }

  async selectFirstProduct() {
    // First product
    await this.firstProductAddToCartBtn.hover();
    await this.firstProductAddToCartBtn.click();
    await this.dismissPopups(); // handle "Continue Shopping"

  }
  async selectSecondProduct(){
    // Second product
    await this.secondProductAddToCartBtn.hover();
    await this.secondProductAddToCartBtn.click();
    await this.dismissPopups(); // handle "Continue Shopping"
  }




}
