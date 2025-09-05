import { Page, Dialog } from '@playwright/test';

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
      /continue shopping/i,
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
  // ✅ Generic alert/dialog handler
  async handleDialog(action: 'accept' | 'dismiss' = 'accept', message?: string) {
    this.page.once('dialog', async (dialog: Dialog) => {
      if (message) {
        // optional: verify alert text
        if (dialog.message() !== message) {
          console.warn(`Unexpected dialog message: ${dialog.message()}`);
        }
      }
      if (action === 'accept') {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }
}

