import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { faker } from '@faker-js/faker';

export class RegistrationPage extends BasePage {
  private signupGender!: 'male' | 'female';   // store gender internally
  private signupFirstName!: string;
  private signupEmail!: string; // <-- add this


  constructor(page: Page) {
    super(page);
  }

  // Fill the signup form (name + email) and submit
  async signup(name?: string, email?: string) {
    // Pick a random gender internally
    this.signupGender = Math.random() < 0.5 ? 'male' : 'female';

    // Generate first name based on gender
    this.signupFirstName = name ?? faker.person.firstName(this.signupGender);
    this.signupEmail = email ?? faker.internet.email(); // store in class property

    // const randomEmail = email ?? faker.internet.email();

    // Compute title here just for logging
    const title = this.signupGender === 'male' ? 'Mr.' : 'Mrs.';

    // Log everything
    console.log(`Generated signup info-> Name: ${this.signupFirstName}, Gender: ${this.signupGender}, Title: ${title}`);
    console.log(`Generated email for signup: ${this.signupEmail}`);


    // Scope to the Signup form only
    const signupForm = this.page.locator('form').filter({ hasText: 'Signup' });
    const nameInput = signupForm.getByRole('textbox', { name: 'Name' });
    const emailInput = signupForm.getByPlaceholder('Email Address');
    const signupButton = signupForm.getByRole('button', { name: 'Signup' });

    await nameInput.fill(this.signupFirstName);
    await emailInput.fill(this.signupEmail);

    // Click signup and wait for navigation to account form
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      signupButton.click(),
    ]);
  }

  // Fill the account registration form
  async fillAccountForm(password?: string) {
    const finalPassword = password ?? "Qwerty@123456";
    const birthdate = faker.date.birthdate({ min: 19, max: 60, mode: 'age' });
    const day = birthdate.getDate().toString();
    const month = (birthdate.getMonth() + 1).toString();
    const year = birthdate.getFullYear().toString();

    console.log(`Generated DOB signup: ${birthdate}`);



    // Determine title based on gender
    const title = this.signupGender === 'male' ? 'Mr.' : 'Mrs.';
    await this.page.getByRole('radio', { name: title }).check();

    // Fill password, first and last name
    await this.page.locator('[data-qa="password"]').fill(finalPassword);
    await this.page.locator('[data-qa="first_name"]').fill(this.signupFirstName);
    await this.page.locator('[data-qa="last_name"]').fill(faker.person.lastName());

    // Fill DOB
    await this.page.locator('[data-qa="days"]').selectOption({ value: day });
    await this.page.locator('[data-qa="months"]').selectOption({ value: month });
    await this.page.locator('[data-qa="years"]').selectOption({ value: year });

    console.log(`Selected DOB: ${day}/${month}/${year}`);

    // Tick newsletter and opt-in
    await this.page.locator('#newsletter').check();
    await this.page.locator('#optin').check();

    // Fill address details
    await this.page.locator('[data-qa="address"]').fill(faker.location.streetAddress());
    await this.page.locator('[data-qa="country"]').selectOption('United States');
    await this.page.locator('[data-qa="state"]').fill(faker.location.state());
    await this.page.locator('[data-qa="city"]').fill(faker.location.city());
    await this.page.locator('[data-qa="zipcode"]').fill(faker.location.zipCode('#####'));
    await this.page.locator('[data-qa="mobile_number"]').fill(faker.string.numeric(10));
  }

  // Submit the account creation form
  async submitAccount() {
    await this.page.getByRole('button', { name: 'Create Account' }).click();
  }

  // Assert account is created successfully
  async assertAccountCreated() {
    await expect(this.page.locator('b')).toHaveText('Account Created!');
    await expect(this.page.getByRole('link', { name: 'Continue' })).toBeVisible();
  }

  // Click Continue after account creation
  async continueAfterAccountCreated() {
    await this.page.locator('[data-qa="continue-button"]').click();
  }

  // Verify logged in as FirstName
  async assertLoggedIn(firstName: string) {
    await expect(this.page.locator(`text=Logged in as ${firstName}`)).toBeVisible();
  }

  // Logout account
  async logoutAccount() {
    await this.page.getByRole('link', { name: 'Logout' }).click();
    console.log(`Generated email for signup is logged out: ${this.signupEmail}`);

    await expect(this.page).toHaveURL('https://www.automationexercise.com/login');
  }


  // Delete account
  async deleteAccount() {
    await this.page.getByRole('link', { name: 'Delete Account' }).click();
  }

  // Assert account deleted and click Continue
  async assertAccountDeleted() {
    await expect(this.page.locator('b')).toHaveText('Account Deleted!');
    await this.page.locator('[data-qa="continue-button"]').click();
    await expect(this.page).toHaveURL('/');
    console.log(`Generated email for signup is deleted: ${this.signupEmail}`);

  }

  // verify email already exists message present: 'Email Address already exist!'
  async assertEmailAlreadyExists() {
    await expect(this.page.getByText('Email Address already exist!')).toBeVisible();
  }

    // verify email already exists message present: 'Email Address already exist!'
  async assertEmailOrPasswordIsIncorrect() {
    await expect(this.page.getByText('Your email or password is incorrect!')).toBeVisible();
  }

}
