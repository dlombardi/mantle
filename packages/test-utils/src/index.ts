/**
 * @mantle/test-utils
 *
 * Shared testing utilities, mocks, and factories for the Mantle monorepo.
 *
 * @example
 * ```ts
 * import { createUser, createPattern, createMockSupabaseClient } from '@mantle/test-utils';
 *
 * const user = createUser({ email: 'test@example.com' });
 * const patterns = createPatterns(5, { tier: 'authoritative' });
 * const mockClient = createMockSupabaseClient({ user });
 * ```
 */

// Re-export all mocks
export * from './mocks';

// Re-export all factories
export * from './factories';
