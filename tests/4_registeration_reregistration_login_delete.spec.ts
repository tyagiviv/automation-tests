
import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { RegistrationPage } from '../pages/RegistrationPage';

test('user registration → reregistration → logout → login → delete account successfully → checked password or email incorrect', async ({ page }) => {
  const home = new HomePage(page);
  const registration = new RegistrationPage(page);

  // --- Go to home and open signup/login ---
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
  await registration.assertLoggedIn(registration['signupFirstName']);

  // Logout account
  await registration.logoutAccount();

  // Go to Signup / login page again
  await home.goto();
  await home.openSignupLogin();

  // --- Try to reregister with same email and verify error ---
  await home.reregister(registration['signupEmail'], registration['signupFirstName']);
  await registration.assertEmailAlreadyExists();

  // Login with the same email
  await home.login(registration['signupEmail'], 'Qwerty@123456');
  await registration.assertLoggedIn(registration['signupFirstName']);

  // Delete account
  await registration.deleteAccount();
  await registration.assertAccountDeleted();

   // Go to Signup / login page again
  await home.goto();
  await home.openSignupLogin();

    // Login with the same email which does not exists (or deleted)
  await home.login(registration['signupEmail'], 'Qwerty@123456');
  await registration.assertEmailOrPasswordIsIncorrect();


});
