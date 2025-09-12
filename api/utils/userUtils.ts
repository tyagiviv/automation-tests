// utils/userUtils.ts
import { APIRequestContext, expect } from '@playwright/test';

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserData {
  name?: string;
  email?: string;
  password?: string;
  title?: string;
  birth_date?: string;
  birth_month?: string;
  birth_year?: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  address1?: string;
  address2?: string;
  country?: string;
  zipcode?: string;
  state?: string;
  city?: string;
  mobile_number?: string;
}

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumberString(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

export async function createUser(
  request: APIRequestContext,
  baseURL: string,
  userData?: UserData
): Promise<UserCredentials> {
  const timestamp = Date.now();
  const email = userData?.email || `testuser${timestamp}@example.com`;
  const password = userData?.password || 'Test@1234';

  // Random values
  const titles = ['Mr', 'Mrs'];
  const countries = ['India', 'Unites Stages', 'Canada', 'Australia', 'Israel', 'New Zealand', 'Singapore'];
  const states = ['Test State', 'California', 'Texas', 'London', 'Bavaria', 'Delhi', 'Dublin', 'Goa'];
  const cities = ['Test City', 'New York', 'Los Angeles', 'London', 'Munich'];
  const firstNames = ['John', 'Jane', 'Alice', 'Bob', 'Mike', 'Linda', 'Josh', 'Bubble', 'Asha'];
  const lastNames = ['Smith', 'Doe', 'Johnson', 'Brown', 'Williams', 'Trivedi'];

  const formData = {
    name: userData?.name || `${randomFromArray(firstNames)} ${randomFromArray(lastNames)}`,
    email,
    password,
    title: userData?.title || randomFromArray(titles),
    birth_date: userData?.birth_date || String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0'),
    birth_month: userData?.birth_month || String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0'),
    birth_year: userData?.birth_year || String(1970 + Math.floor(Math.random() * 30)), // 1970-1999
    firstname: userData?.firstname || randomFromArray(firstNames),
    lastname: userData?.lastname || randomFromArray(lastNames),
    company: userData?.company || `Company${Math.floor(Math.random() * 1000)}`,
    address1: userData?.address1 || `${Math.floor(Math.random() * 999)} Main St`,
    address2: userData?.address2 || `Suite ${Math.floor(Math.random() * 999)}`,
    country: userData?.country || randomFromArray(countries),
    zipcode: userData?.zipcode || randomNumberString(6),
    state: userData?.state || randomFromArray(states),
    city: userData?.city || randomFromArray(cities),
    mobile_number: userData?.mobile_number || randomNumberString(10),
  };

  console.log('Creating user with credentials:');
  console.table(formData);

  const response = await request.post(`${baseURL}/createAccount`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: formData,
    failOnStatusCode: false,
  });

  const rawBody = await response.text();
  console.log('Raw create user response:', rawBody);
  console.log('Create user HTTP status:', response.status());

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    body = { message: rawBody };
  }

  expect(response.status()).toBeGreaterThanOrEqual(200);
  expect(body.message).toMatch(/User created/i);

  console.log('✅ User created successfully. Proceeding to login.');

  return { email, password };
}

// Flexible loginUser - keeps all console logs
export async function loginUser(
  request: APIRequestContext,
  baseURL: string,
  email?: string,
  password?: string
) {
  const form: Record<string, string | number> = {};
  if (email) form.email = email;
  if (password) form.password = password;

  console.log('Logging in with credentials:');
  console.table(form);

  const response = await request.post(`${baseURL}/verifyLogin`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form,
    failOnStatusCode: false,
  });

  const rawBody = await response.text();
  console.log('Raw login response:', rawBody);
  console.log('Login HTTP status:', response.status());

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    body = { message: rawBody };
  }

  // ✅ Only assert if both email & password are provided
  if (email && password) {
    expect(response.status()).toBe(200);
    expect(body.message).toMatch(/User exists/i);
    console.log(`✅ Login successful for ${email}`);
  }

  return { response, body };
}

export async function deleteUser(
  request: APIRequestContext,
  baseURL: string,
  email: string,
  password: string
) {
  const response = await request.delete(`${baseURL}/deleteAccount`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form: { email, password },
    failOnStatusCode: false,
  });

  const rawBody = await response.text();
  console.log('Raw delete response:', rawBody);
  console.log('Delete HTTP status:', response.status());

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    body = { message: rawBody };
  }

  expect(response.status()).toBe(200);
  expect(body.message).toMatch(/Account deleted/i);

  console.log(`✅ User deleted successfully: ${email}`);

  return body;
}

// --------------------- New Update Function ---------------------
export async function updateUser(
  request: APIRequestContext,
  baseURL: string,
  userData: UserData
) {
  // Convert UserData to a form object with only defined string/number values
  const form: Record<string, string | number> = {};
  for (const key in userData) {
    const value = userData[key as keyof UserData];
    if (value !== undefined) {
      form[key] = value;
    }
  }

  console.log('Updating user with data:');
  console.table(form);

  const response = await request.put(`${baseURL}/updateAccount`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    form,
    failOnStatusCode: false,
  });

  const rawBody = await response.text();
  console.log('Raw update response:', rawBody);
  console.log('Update HTTP status:', response.status());

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    body = { message: rawBody };
  }

  expect(response.status()).toBe(200);
  expect(body.message).toMatch(/User updated/i);

  console.log(`✅ User updated successfully: ${userData.email}`);

  return body;
}
