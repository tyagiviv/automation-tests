import { Locator, expect, Page } from '@playwright/test';
import { BasePage } from './BasePage'; // ✅ named import

export class HomePage extends BasePage {   // ✅ named export
  readonly signupLoginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.signupLoginLink = page.getByRole('link', { name: 'Signup / Login' });
  }

  async goto() {
    await this.page.goto('/');  // uses baseURL from config
    await this.dismissPopups(); // dismiss any popups
    await expect(this.page).toHaveTitle(/Automation Exercise/i);
  }

  async openSignupLogin() {
    await this.signupLoginLink.click();
  }

  // New login method
  async login(email: string, password: string) {
    await this.page.locator('[data-qa="login-email"]').fill(email);
    await this.page.locator('[data-qa="login-password"]').fill(password);
    await this.page.locator('[data-qa="login-button"]').click();
  }
  
  // Re-register same email method
  async reregister(email: string, signupFirstName: string) {
    await this.page.locator('[data-qa="signup-name"]').fill(signupFirstName);
    await this.page.locator('[data-qa="signup-email"]').fill(email);
    await this.page.locator('[data-qa="signup-button"]').click();
  }

}

