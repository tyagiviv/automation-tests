import { Locator, expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUT } from 'dns';

export class ContactUsPage extends BasePage {
  readonly contactUsLink: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly subjectInput: Locator;
  readonly messageTextarea: Locator;
  readonly uploadFileInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly homeLink: Locator;

  constructor(page: Page) {
    super(page);

    this.contactUsLink = page.getByRole('link', { name: ' Contact us' });
    this.nameInput = page.locator('[data-qa="name"]');
    this.emailInput = page.locator('[data-qa="email"]');
    this.subjectInput = page.locator('[data-qa="subject"]');
    this.messageTextarea = page.locator('[data-qa="message"]');
    this.uploadFileInput = page.locator('input[name="upload_file"]');
    this.submitButton = page.locator('[data-qa="submit-button"]');
    this.successMessage = page.locator('div.status.alert.alert-success');
    this.homeLink = page.locator('a.btn.btn-success', { hasText: 'Home' });
  }

  async goto() {
    await this.page.goto('/');  // uses baseURL from config
    await this.dismissPopups(); // dismiss any popups
    await expect(this.page).toHaveTitle(/Automation Exercise/i);
  
    await this.contactUsLink.click();     // go to Contact Us page
    await expect(this.page.locator('h2.title.text-center', { hasText: 'Get In Touch' })).toBeVisible();
  }


  async submitForm(name: string, email: string, subject: string, message: string, filePath?: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.subjectInput.fill(subject);
    await this.messageTextarea.fill(message);

    if (filePath) {
      await this.uploadFileInput.setInputFiles(filePath); 
    }

    await this.handleDialog('accept');    // ✅ from BasePage
    await expect(this.submitButton).toBeEnabled({ timeout: 5000 });
    await this.submitButton.click();
  }

  async verifySuccessMessage() {
    // await expect(this.successMessage).toBeVisible();
    await this.successMessage.waitFor({ state: 'visible', timeout: 10000 });

    await expect(this.successMessage).toHaveText(
      'Success! Your details have been submitted successfully.'
    );
  }

  async clickHomeLink() {
    await this.homeLink.click();
    await expect(this.page).toHaveURL('/');


  }
}
