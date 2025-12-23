/**
 * Supabase client mock factory for tests.
 *
 * Creates a fully mocked Supabase client with configurable behavior.
 */

import { vi } from 'vitest';

export interface MockSupabaseOptions {
  user?: { id: string; email: string } | null;
  session?: { access_token: string } | null;
}

/**
 * Create a mock Supabase client for testing.
 *
 * @example
 * ```ts
 * const mockClient = createMockSupabaseClient({ user: { id: '1', email: 'test@example.com' } });
 * vi.mocked(getSupabaseClient).mockReturnValue(mockClient);
 * ```
 */
export function createMockSupabaseClient(options: MockSupabaseOptions = {}) {
  const { user = null, session = null } = options;

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: null,
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session },
        error: null,
      }),
      signInWithOAuth: vi.fn().mockResolvedValue({
        data: { url: 'https://example.com/oauth' },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn((callback) => {
        // Optionally trigger callback with initial state
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        };
      }),
    },
    from: vi.fn((table: string) => createMockQueryBuilder(table)),
    storage: {
      from: vi.fn((bucket: string) => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test.txt' }, error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file.txt' } }),
        remove: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn(),
    })),
  };
}

/**
 * Create a mock query builder for Supabase .from() calls.
 */
function createMockQueryBuilder(table: string) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    // Terminal methods that return promises
    then: vi.fn((resolve) => resolve({ data: [], error: null })),
  };

  return builder;
}
