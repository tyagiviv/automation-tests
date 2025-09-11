import { test, expect } from '@playwright/test';

test('1_API Test - GET All Products List', async ({ request, baseURL }) => {
  const response = await request.get(`${baseURL}/productsList`);
  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(data).toHaveProperty('products');
  expect(Array.isArray(data.products)).toBeTruthy();

  // Filter valid products (non-undefined)
  const validProducts = data.products.filter(p => p !== undefined);

  console.log('Total valid products:', validProducts.length);
  console.log('All valid products:');
  validProducts.forEach((product, index) => {
    console.log(`${index + 1}. [ID: ${product.id}] ${product.name} - ${product.price} - ${product.brand}`);
  });
});
