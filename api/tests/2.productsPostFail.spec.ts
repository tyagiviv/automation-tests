import { test, expect } from '@playwright/test';

test('2_API Test - POST to All Products List should fail', async ({ request, baseURL }) => {
  const response = await request.post(`${baseURL}/productsList`, {
    data: { name: 'Test Product', price: 'Rs. 999' },
  });

  // Log response for debugging
  const body = await response.json(); // or .text() if plain text
  console.log('Response:', body);

  // Assert that response contains a message about unsupported method
  expect(body.message || body.error || body).toContain('This request method is not supported');
});
