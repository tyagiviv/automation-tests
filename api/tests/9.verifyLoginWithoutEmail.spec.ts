import { test, expect } from '@playwright/test';

test('9_API test - Verify Login without email parameter', async ({ request, baseURL }) => {
  const password = 'Test@1234';

  console.log('Verifying login without email:');
  console.log('Password:', password);

  const response = await request.post(`${baseURL}/verifyLogin`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: { password }, // email missing
    failOnStatusCode: false,
  });

  const rawBody = await response.text();
  const body = JSON.parse(rawBody);

  console.log('Raw API response:', rawBody);
  console.log('HTTP status:', response.status());

  // ✅ Assert using API's internal responseCode
  expect(body.responseCode).toBe(400);
  expect(body.message).toMatch(/email or password parameter is missing/i);

  console.log('✅ API correctly returned error for missing email.');
});

test('10_API test - Verify Login without password parameter', async ({ request, baseURL }) => {
  const email = 'test@example.com';

  console.log('Verifying login without password:');
  console.log('Email:', email);

  const response = await request.post(`${baseURL}/verifyLogin`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: { email }, // password missing
    failOnStatusCode: false,
  });

  const rawBody = await response.text();
  const body = JSON.parse(rawBody);

  console.log('Raw API response:', rawBody);
  console.log('HTTP status:', response.status());

  expect(body.responseCode).toBe(400);
  expect(body.message).toMatch(/email or password parameter is missing/i);

  console.log('✅ API correctly returned error for missing password.');
});

test('11_API test - Verify Login without email and password parameters', async ({ request, baseURL }) => {
  console.log('Verifying login without email and password:');

  const response = await request.post(`${baseURL}/verifyLogin`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: {}, // both missing
    failOnStatusCode: false,
  });

  const rawBody = await response.text();
  const body = JSON.parse(rawBody);

  console.log('Raw API response:', rawBody);
  console.log('HTTP status:', response.status());

  expect(body.responseCode).toBe(400);
  expect(body.message).toMatch(/email or password parameter is missing/i);

  console.log('✅ API correctly returned error for missing email and password.');
});
