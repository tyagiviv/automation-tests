import { test, expect } from '@playwright/test';

test('4_API Test - PUT to All Brands List should fail', async ({ request, baseURL }) => {
  // Send PUT request
  const response = await request.put(`${baseURL}/brandsList`, {
    data: { name: 'Test Brand' },
  });

  // Log response for debugging
  const body = await response.json(); // the API may return JSON
  console.log('Response:', body);

  // Assert that response contains error message
  expect(body.responseCode || body.code).toBe(405); // optional if API sends a code field
  expect(body.message || body.error || body).toContain('This request method is not supported');
});
