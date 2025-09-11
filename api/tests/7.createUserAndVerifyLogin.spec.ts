import { test, expect } from '@playwright/test';

test('7_API Test - Create User and then Verify Login', async ({ request, baseURL }) => {
  const timestamp = Date.now();
  const email = `testuser${timestamp}@example.com`;
  const password = 'Test@1234';

  console.log('Creating user with credentials:');
  console.log('Email:', email);
  console.log('Password:', password);

  // ✅ Step 1: Create User using form data
  const createResponse = await request.post(`${baseURL}/createAccount`, {
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

  const createBody = await createResponse.json();
  console.log('User creation response:', createBody);

  expect([200, 201]).toContain(createResponse.status());
  expect(createBody.message || createBody.msg).toContain('User created');

  // ✅ Step 2: Verify Login
  const loginResponse = await request.post(`${baseURL}/verifyLogin`, {
    form: { email, password },
    failOnStatusCode: false,
  });

  const loginBody = await loginResponse.json();
  console.log('Login response:', loginBody);

  expect(loginResponse.status()).toBe(200);
  expect(loginBody.message || loginBody.msg).toContain('User exists');
});
