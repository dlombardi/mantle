/**
 * Repository test data factory.
 *
 * Generates realistic repo data for tests.
 */

import { faker } from '@faker-js/faker';

export type RepoStatus = 'pending' | 'ingesting' | 'ready' | 'error';

export interface Repo {
  id: string;
  userId: string;
  owner: string;
  name: string;
  fullName: string;
  installationId: number;
  status: RepoStatus;
  defaultBranch: string;
  lastIngestedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRepoOptions {
  id?: string;
  userId?: string;
  owner?: string;
  name?: string;
  fullName?: string;
  installationId?: number;
  status?: RepoStatus;
  defaultBranch?: string;
  lastIngestedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const REPO_STATUSES: RepoStatus[] = ['pending', 'ingesting', 'ready', 'error'];

/**
 * Create a test repository with realistic fake data.
 *
 * @example
 * ```ts
 * const repo = createRepo(); // Random repo
 * const readyRepo = createRepo({ status: 'ready' });
 * ```
 */
export function createRepo(overrides: CreateRepoOptions = {}): Repo {
  const now = new Date().toISOString();
  const owner = overrides.owner ?? faker.internet.username();
  const name = overrides.name ?? faker.lorem.slug(2);

  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    owner,
    name,
    fullName: `${owner}/${name}`,
    installationId: faker.number.int({ min: 10000, max: 99999 }),
    status: faker.helpers.arrayElement(REPO_STATUSES),
    defaultBranch: 'main',
    lastIngestedAt: faker.datatype.boolean() ? faker.date.recent().toISOString() : null,
    createdAt: faker.date.past().toISOString(),
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create multiple test repositories.
 */
export function createRepos(count: number, overrides: CreateRepoOptions = {}): Repo[] {
  return Array.from({ length: count }, () => createRepo(overrides));
}
