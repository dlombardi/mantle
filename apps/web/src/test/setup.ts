/**
 * Vitest test setup for React components.
 *
 * Configures jsdom environment, Jest DOM matchers,
 * and global mocks for external services.
 */

import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup DOM after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  })),
  isSupabaseConfigured: vi.fn(() => true),
}));

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('VITE_API_URL', 'http://localhost:3001');
