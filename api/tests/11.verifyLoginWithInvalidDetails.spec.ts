import { test, expect } from '@playwright/test';

test('13_API test - Verify Login with invalid details', async ({ request, baseURL }) => {
  const email = 'invaliduser@example.com';
  const password = 'WrongPass@123';

  console.log('Verifying login with invalid credentials:');
  console.log('Email:', email);
  console.log('Password:', password);

  const response = await request.post(`${baseURL}/verifyLogin`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: { email, password },
    failOnStatusCode: false,
  });

  const rawBody = await response.text();
  const body = JSON.parse(rawBody);

  console.log('Raw API response:', rawBody);
  console.log('HTTP status:', response.status());

  expect(body.responseCode).toBe(404);
  expect(body.message).toMatch(/User not found/i);

  console.log('✅ API correctly returned 404 for invalid login details.');
});
