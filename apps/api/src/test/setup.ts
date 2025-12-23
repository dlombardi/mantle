/**
 * Vitest test setup file.
 *
 * Configures global mocks for database and external services.
 * This runs before each test file.
 */

import { vi, beforeEach, afterEach } from 'vitest';

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Mock the database client by default
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(),
  closeDb: vi.fn(),
  dbHealthCheck: vi.fn().mockResolvedValue({ connected: true }),
}));

// Mock Trigger.dev
vi.mock('@/lib/trigger', () => ({
  initTrigger: vi.fn(),
  isTriggerConfigured: vi.fn().mockReturnValue(true),
}));

// Mock environment variables for tests
vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test');
vi.stubEnv('CORS_ORIGIN', 'http://localhost:3000');
