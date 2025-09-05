import { Locator, expect, Page } from '@playwright/test';
import { BasePage } from './BasePage'; // ✅ named import

export class CartPage extends BasePage {   // ✅ named export
  readonly cartLink: Locator;
  readonly cartRows: Locator;

  
  constructor(page: Page) {
    super(page);
    this.cartLink = page.getByRole('link', { name: 'Cart' });
    this.cartRows = page.locator('.cart_info tbody tr'); // each product row

  
  }

  async clickCart() {
    await this.cartLink.click(); // Go to Cart page

  }

  async cartScrollToFooter() {
    await this.page.locator('footer').scrollIntoViewIfNeeded();
  }
  
  
  // --- NEW FUNCTIONS ---
  
  async getCartProductNames(): Promise<string[]> {
    return await this.cartRows.locator('.cart_description h4 a').allInnerTexts();
  }

  async getProductPriceByIndex(index: number): Promise<number> {
    const text = await this.cartRows.nth(index).locator('.cart_price p').textContent();
    return Number(text?.replace('$', '').trim());
  }

  async getProductQuantityByIndex(index: number): Promise<number> {
    const value = await this.cartRows.nth(index).locator('.cart_quantity input').inputValue();
    return Number(value);
  }

  async getProductTotalByIndex(index: number): Promise<number> {
    const text = await this.cartRows.nth(index).locator('.cart_total p').textContent();
    return Number(text?.replace('$', '').trim());
  }
  // ⭐ NEW: Log cart contents
  async logCartContents() {
    const names = await this.getCartProductNames();
    console.log(`🛒 Cart contains ${names.length} products:`);

    for (let i = 0; i < names.length; i++) {
      const price = await this.getProductPriceByIndex(i);
      const qty = await this.getProductQuantityByIndex(i);
      const total = await this.getProductTotalByIndex(i);

      console.log(`   ${i + 1}. ${names[i]} | Price: $${price} | Qty: ${qty} | Total: $${total}`);
    }
  }
}

