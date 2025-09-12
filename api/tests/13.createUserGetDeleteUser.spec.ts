import { test, expect } from '@playwright/test';
import { createUser, deleteUser } from '../utils/userUtils';

test('15_API Test - Get user account detail by email', async ({ request, baseURL }) => {
  if (!baseURL) throw new Error('❌ baseURL is not defined');

  // Step 1: Create user
  const { email, password } = await createUser(request, baseURL, {});

  try {
    // Step 2: Get user details
    const response = await request.get(`${baseURL}/getUserDetailByEmail`, {
      params: { email },
      failOnStatusCode: false,
    });

    const rawBody = await response.text();
    const body = JSON.parse(rawBody);

    console.log('Raw GET response:', rawBody);
    console.log('GET HTTP status:', response.status());

    // Assert HTTP status
    expect(response.status()).toBe(200);

    // If user details are wrapped in a "user" key
    const userData = body.user || body;

    console.log('Fetched user details:');
    console.table(userData);

    // Basic assertions
    expect(userData.email).toBe(email);
    expect(userData.name).toBeDefined();

    // ---------------- Sensitive fields check ----------------
    expect(userData.password, 'Password should not be present in API response').toBeUndefined();
    expect(userData.mobile_number, 'Mobile number should not be present in API response').toBeUndefined();

    console.log('✅ Password and mobile_number are not sent in GET API response');
    // ---------------------------------------------------------

    console.log(`✅ Successfully fetched user details for ${email}`);
  } finally {
    // Step 3: Delete user
    await deleteUser(request, baseURL, email, password);
  }
});
