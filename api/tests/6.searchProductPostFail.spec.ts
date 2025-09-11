import { test, expect } from '@playwright/test';

test('6_API Test - POST To Search Product without search_product parameter should fail', async ({ request, baseURL }) => {
  // Send POST request without the search_product parameter
  const response = await request.post(`${baseURL}/searchProduct`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: '', // empty body
  });

  // ✅ Assert HTTP status (200, because API returns 200 even for errors)
  expect(response.status()).toBe(200);

  // ✅ Parse response body
  const body = await response.json();
  console.log('Response:', body);

  // ✅ Assert API-level error
  expect(body.responseCode || body.code).toBe(400);
  expect(body.message || body.error).toContain(
    'Bad request, search_product parameter is missing'
  );
});
