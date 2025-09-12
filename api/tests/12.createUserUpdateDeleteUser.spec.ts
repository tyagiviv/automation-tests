// tests/updateUser.spec.ts
import { test, expect } from '@playwright/test';
import { createUser, updateUser, deleteUser } from '../utils/userUtils';

test('14_API Test - Create → Update → Delete user workflow', async ({ request, baseURL }) => {
  if (!baseURL) throw new Error('❌ baseURL is not defined');

  let email: string | undefined;
  let password: string | undefined;

  try {
    // Step 1: Create user
    const creds = await createUser(request, baseURL, {});
    email = creds.email;
    password = creds.password;

    // Step 2: Update user
    const updatedData = {
      email, // required to identify the user
      password, // <-- include original password
      name: 'Updated Name',
      firstname: 'UpdatedFirst',
      lastname: 'UpdatedLast',
      company: 'UpdatedCompany',
      address1: '123 Updated St',
      city: 'Updated City',
      country: 'Updated Country',
      zipcode: '999999',
      mobile_number: '1234567890',
      title: 'Mr',
      birth_date: '01',
      birth_month: '01',
      birth_year: '1990',
    };

    console.log('--- Updating user ---');
    const updateResponse = await updateUser(request, baseURL, updatedData);
    console.log('Update response body:', updateResponse);

  } finally {
    // Step 3: Delete user (cleanup even if update fails)
    if (email && password) {
      console.log('--- Deleting user ---');
      await deleteUser(request, baseURL, email, password);
    }
  }
});
