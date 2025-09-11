import { test, expect } from '@playwright/test';

test('3_API Test - GET All Brands List', async ({ request, baseURL }) => {
  const response = await request.get(`${baseURL}/brandsList`);
  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(data).toHaveProperty('brands');
  expect(Array.isArray(data.brands)).toBeTruthy();

  // Filter valid brands
  const validBrands = data.brands.filter(b => b !== undefined);

  console.log('Total valid brands:', validBrands.length);
  console.log('All valid brands:');
  validBrands.forEach((brand, index) => {
    console.log(`${index + 1}. [ID: ${brand.id}] ${brand.brand}`);
  });
});
