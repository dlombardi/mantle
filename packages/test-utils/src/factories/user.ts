/**
 * User test data factory.
 *
 * Generates realistic user data for tests using Faker.
 */

import { faker } from '@faker-js/faker';

export interface User {
  id: string;
  email: string;
  githubUsername: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserOptions {
  id?: string;
  email?: string;
  githubUsername?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create a test user with realistic fake data.
 *
 * @example
 * ```ts
 * const user = createUser(); // Random user
 * const specificUser = createUser({ email: 'test@example.com' }); // Override email
 * ```
 */
export function createUser(overrides: CreateUserOptions = {}): User {
  const now = new Date().toISOString();

  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    githubUsername: faker.internet.username(),
    avatarUrl: faker.image.avatar(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create multiple test users.
 */
export function createUsers(count: number, overrides: CreateUserOptions = {}): User[] {
  return Array.from({ length: count }, () => createUser(overrides));
}
