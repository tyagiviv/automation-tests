import { test, expect } from '@playwright/test';

test('12_API Test - DELETE method not allowed on verifyLogin', async ({ request, baseURL }) => {
  const response = await request.delete(`${baseURL}/verifyLogin`, {
    failOnStatusCode: false,
  });

  const rawBody = await response.text();
  const body = JSON.parse(rawBody);

  console.log('Raw API response:', rawBody);
  console.log('HTTP status:', response.status());

  // ✅ Use responseCode from API body instead of HTTP status
  expect(body.responseCode).toBe(405);
  expect(body.message).toMatch(/This request method is not supported/i);

  console.log('✅ API correctly returned 405 for DELETE on verifyLogin');
});
