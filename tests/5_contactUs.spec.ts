import { test } from '@playwright/test';
import { ContactUsPage } from '../pages/ContactUsPage';
import { getRandomEmail, getRandomMessage, getRandomSubject, getRandomString } from '../utils/random';


test.describe('Contact Us Page', () => {
  test('should submit contact form successfully', async ({ page }) => {
    const contactUsPage = new ContactUsPage(page);

    // Step 1: Navigate to Contact Us page
    await contactUsPage.goto();

    // Step 2: Fill and submit the form
    await contactUsPage.submitForm(
        getRandomString(6),        // random name
        getRandomEmail(),           // random email
        getRandomSubject(),         // random subject
        getRandomMessage(),          // random message
        'fixtures/testfile.txt' // optional file, remove if not needed
    );

    // Step 3: Verify success message
    await contactUsPage.verifySuccessMessage();

    // Step 4: Navigate back to Home
    await contactUsPage.clickHomeLink();
  });
});
