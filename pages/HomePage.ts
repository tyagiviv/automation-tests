import { Locator, expect, Page } from '@playwright/test';
import { BasePage } from './BasePage'; // ✅ named import

export class HomePage extends BasePage {   // ✅ named export
  readonly signupLoginLink: Locator;
  readonly footer: Locator;
  readonly subscriptionText: Locator;
  readonly emailInput: Locator;
  readonly subscribeBtn: Locator;
  readonly successMsg: Locator;

  constructor(page: Page) {
    super(page);
    this.signupLoginLink = page.getByRole('link', { name: 'Signup / Login' });
    // ✅ subscription locators
    this.footer = page.locator('footer');
    this.subscriptionText = page.getByRole('heading', { name: 'Subscription' });
    this.emailInput = page.locator('#susbscribe_email');
    this.subscribeBtn = page.locator('#subscribe');
    this.successMsg = page.getByText('You have been successfully subscribed!', { exact: true });
  
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

   // ✅ scroll to footer
  async scrollToFooter() {
    await this.footer.scrollIntoViewIfNeeded();
  }

  // ✅ verify subscription heading
  async verifySubscriptionText() {
    await expect(this.subscriptionText).toBeVisible();
  }

  // ✅ perform subscription
  async subscribeWithEmail(email: string) {
    await this.emailInput.fill(email);
    console.log('📧 Generated subscription email:', email);
    await this.subscribeBtn.click();
  }

  // ✅ verify success
  async verifySubscriptionSuccess() {
    await expect(this.successMsg).toBeVisible();
  }

}

