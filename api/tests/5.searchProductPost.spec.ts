import { test, expect } from '@playwright/test';

test('5_API Test - POST To Search Product', async ({ request, baseURL }) => {
  // Request payload as form data
  const formData = new URLSearchParams();
  formData.append('search_product', 'top');

  // Send POST request
  const response = await request.post(`${baseURL}/searchProduct`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: formData.toString(),
  });

  // ✅ Assert status code
  expect(response.status()).toBe(200);

  // ✅ Parse JSON response
  const data = await response.json();

  // ✅ Check that "products" exists and is an array
  expect(data).toHaveProperty('products');
  expect(Array.isArray(data.products)).toBeTruthy();

  // Log count of products
  console.log('Total searched products:', data.products.length);

  // Log all searched products
  console.log('All searched products:');
  data.products.forEach((product: any, index: number) => {
    console.log(`${index + 1}. ${product.name} - ${product.price} - ${product.brand}`);
  });
});
