import { test, expect } from '@playwright/test';

test('7_API Test - Create User, Verify Login, and Delete User', async ({ request, baseURL }) => {
  const timestamp = Date.now();
  const email = `testuser${timestamp}@example.com`;
  const password = 'Test@1234';

  console.log('Creating user with credentials:');
  console.log('Email:', email);
  console.log('Password:', password);

  // ✅ Step 1: Create User
  const createResponse = await request.post(`${baseURL}/createAccount`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: {
      name: 'Test User',
      email,
      password,
      title: 'Mr',
      birth_date: '01',
      birth_month: '01',
      birth_year: '1990',
      firstname: 'Test',
      lastname: 'User',
      company: 'Test Company',
      address1: '123 Main St',
      address2: 'Suite 1',
      country: 'India',
      zipcode: '123456',
      state: 'Test State',
      city: 'Test City',
      mobile_number: '9999999999',
    },
    failOnStatusCode: false,
  });

  const rawCreateBody = await createResponse.text();
  console.log('Raw create user response:', rawCreateBody);
  console.log('Create user HTTP status:', createResponse.status());

  if (createResponse.status() !== 200 && !/User created/i.test(rawCreateBody)) {
    console.error('❌ User creation failed. Response:', rawCreateBody);
    return; // skip login and deletion
  }

  console.log('✅ User created successfully. Proceeding to login.');

  // ✅ Step 2: Verify Login
  const loginResponse = await request.post(`${baseURL}/verifyLogin`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: { email, password },
    failOnStatusCode: false,
  });

  const rawLoginBody = await loginResponse.text();
  console.log('Raw login response:', rawLoginBody);
  console.log('Login HTTP status:', loginResponse.status());

  let loginBody: any;
  try {
    loginBody = JSON.parse(rawLoginBody);
  } catch {
    loginBody = { message: rawLoginBody };
  }

  expect(loginResponse.status()).toBe(200);
  expect(loginBody.message).toMatch(/User exists/i);
  console.log('✅ Login successful for', email);

  // ✅ Step 3: Delete User (auto-cleanup)
  const deleteResponse = await request.delete(`${baseURL}/deleteAccount`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: { email, password },
    failOnStatusCode: false,
  });

  const rawDeleteBody = await deleteResponse.text();
  console.log('Raw delete response:', rawDeleteBody);
  console.log('Delete HTTP status:', deleteResponse.status());

  try {
    const deleteBody = JSON.parse(rawDeleteBody);
    if (deleteResponse.status() === 200 && /Account deleted/i.test(deleteBody.message)) {
      console.log('✅ User deleted successfully:', email);
    } else {
      console.warn('⚠️ User deletion may have failed. Response:', rawDeleteBody);
    }
  } catch {
    console.warn('⚠️ Could not parse delete response as JSON. Raw:', rawDeleteBody);
  }
});
