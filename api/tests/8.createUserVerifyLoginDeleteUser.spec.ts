// tests/createLoginDelete.spec.ts
import { test } from '@playwright/test';
import { createUser, loginUser, deleteUser } from '../utils/userUtils';

test('8_API Test - Create → Login → Delete user workflow', async ({ request, baseURL }) => {
  if (!baseURL) throw new Error('❌ baseURL is not defined');

  let email: string | undefined;
  let password: string | undefined;

  try {
    // Step 1: Create user
    const creds = await createUser(request, baseURL, {});
    email = creds.email;
    password = creds.password;

    // Step 2: Login
    await loginUser(request, baseURL, email, password);

  } finally {
    // Step 3: Delete user (cleanup even if login fails)
    if (email && password) {
      await deleteUser(request, baseURL, email, password);
    }
  }
});
