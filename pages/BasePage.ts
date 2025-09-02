import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async dismissPopups() {
    const popupButtons = [
      /accept essential cookies/i,
      /consent/i,
      /accept/i,
      /agree/i,
      /enable accessibility/i,
      /continue/i,
    ];

    for (const text of popupButtons) {
      const btn = this.page.getByRole('button', { name: text });
      try {
        if (await btn.isVisible({ timeout: 3000 })) {
          await btn.click();
          await this.page.waitForTimeout(500);
        }
      } catch (err) {
        // ignore
      }
    }
  }

}
