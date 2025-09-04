export function getRandomString(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getRandomEmail(): string {
  return `${getRandomString(6)}@example.com`;
}

export function getRandomSubject(): string {
  return `Subject ${getRandomString(5)}`;
}

export function getRandomMessage(): string {
  return `This is a test message: ${getRandomString(20)}`;
}
