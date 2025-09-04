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

export function getRandomItems<T>(items: T[], count: number): T[] {
  if (items.length === 0) throw new Error('❌ No items available to pick');

  return [...items]
    .sort(() => 0.5 - Math.random()) // shuffle
    .slice(0, Math.min(count, items.length));
}