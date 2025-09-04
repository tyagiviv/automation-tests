import { test } from '@playwright/test';
import { HomePage } from '@pages/HomePage';
import { RegistrationPage } from '@pages/RegistrationPage';
import { faker } from '@faker-js/faker';

test('user register and deleted successfully', async ({ page }) => {
  const home = new HomePage(page);
  const registration = new RegistrationPage(page);

  await home.goto();
  await home.openSignupLogin();

  // Signup with name + email
  await registration.signup();

  // Fill account form with random password and other details
  await registration.fillAccountForm();

  // Submit registration
  await registration.submitAccount();

  // Verify account creation
  await registration.assertAccountCreated();

  // Continue
  await registration.continueAfterAccountCreated();

  // Verify logged in as first name
  await registration.assertLoggedIn(registration['signupFirstName']); // access stored name

  // Delete account
  await registration.deleteAccount();
  await registration.assertAccountDeleted();





});
