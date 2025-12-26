/**
 * File Storage Tests
 *
 * Tests for storing indexed files to the database.
 * Uses mocking since actual DB operations require a live connection.
 */

import { describe, test, expect, vi } from 'vitest';
import { storeIndexedFiles, type StoreFilesOptions } from './file-storage';
import { CHARS_PER_TOKEN } from './token-counter';
import type { IndexedFile } from './file-indexer';

// ============================================
// MOCK SETUP
// ============================================

/**
 * Creates a mock Drizzle DB that captures insert operations.
 * Mocks the fluent chain: db.insert().values().onConflictDoUpdate()
 */
function createMockDb() {
  const mockOnConflictDoUpdate = vi.fn().mockResolvedValue({});
  const mockValues = vi.fn().mockReturnValue({
    onConflictDoUpdate: mockOnConflictDoUpdate,
  });
  const mockInsert = vi.fn().mockReturnValue({
    values: mockValues,
  });

  return {
    db: { insert: mockInsert } as unknown as StoreFilesOptions['db'],
    mockInsert,
    mockValues,
    mockOnConflictDoUpdate,
  };
}

/**
 * Create a mock indexed file for testing.
 */
function createMockFile(overrides: Partial<IndexedFile> = {}): IndexedFile {
  return {
    filePath: 'src/index.ts',
    language: 'typescript',
    sizeBytes: 1000,
    ...overrides,
  };
}

// ============================================
// TESTS: EMPTY INPUT
// ============================================

describe('storeIndexedFiles', () => {
  describe('empty input', () => {
    test('returns stored: 0 for empty array', async () => {
      const { db, mockInsert } = createMockDb();

      const result = await storeIndexedFiles({
        repoId: 'repo-123',
        files: [],
        db,
      });

      expect(result.stored).toBe(0);
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // TESTS: SINGLE FILE
  // ============================================

  describe('single file', () => {
    test('stores one file and returns stored: 1', async () => {
      const { db, mockInsert, mockValues } = createMockDb();
      const file = createMockFile();

      const result = await storeIndexedFiles({
        repoId: 'repo-123',
        files: [file],
        db,
      });

      expect(result.stored).toBe(1);
      expect(mockInsert).toHaveBeenCalledTimes(1);
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          repoId: 'repo-123',
          filePath: 'src/index.ts',
          language: 'typescript',
          sizeBytes: 1000,
        }),
      );
    });

    test('calculates tokenEstimate as sizeBytes / CHARS_PER_TOKEN', async () => {
      const { db, mockValues } = createMockDb();
      const file = createMockFile({ sizeBytes: 1000 });

      await storeIndexedFiles({
        repoId: 'repo-123',
        files: [file],
        db,
      });

      const expectedTokens = Math.ceil(1000 / CHARS_PER_TOKEN); // 250
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenEstimate: expectedTokens,
        }),
      );
    });

    test('rounds up tokenEstimate for non-divisible sizes', async () => {
      const { db, mockValues } = createMockDb();
      const file = createMockFile({ sizeBytes: 5 }); // 5 / 4 = 1.25 → 2

      await storeIndexedFiles({
        repoId: 'repo-123',
        files: [file],
        db,
      });

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenEstimate: 2,
        }),
      );
    });

    test('handles null language', async () => {
      const { db, mockValues } = createMockDb();
      const file = createMockFile({ language: null });

      await storeIndexedFiles({
        repoId: 'repo-123',
        files: [file],
        db,
      });

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          language: null,
        }),
      );
    });
  });

  // ============================================
  // TESTS: MULTIPLE FILES
  // ============================================

  describe('multiple files', () => {
    test('stores all files and returns correct count', async () => {
      const { db, mockInsert } = createMockDb();
      const files = [
        createMockFile({ filePath: 'src/index.ts', sizeBytes: 1000 }),
        createMockFile({ filePath: 'src/utils.ts', sizeBytes: 500 }),
        createMockFile({ filePath: 'README.md', language: 'markdown', sizeBytes: 200 }),
      ];

      const result = await storeIndexedFiles({
        repoId: 'repo-123',
        files,
        db,
      });

      expect(result.stored).toBe(3);
      expect(mockInsert).toHaveBeenCalledTimes(3);
    });

    test('stores each file with correct repoId', async () => {
      const { db, mockValues } = createMockDb();
      const files = [
        createMockFile({ filePath: 'file1.ts' }),
        createMockFile({ filePath: 'file2.ts' }),
      ];

      await storeIndexedFiles({
        repoId: 'specific-repo-id',
        files,
        db,
      });

      // Both calls should have the same repoId
      expect(mockValues).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ repoId: 'specific-repo-id' }),
      );
      expect(mockValues).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ repoId: 'specific-repo-id' }),
      );
    });
  });

  // ============================================
  // TESTS: UPSERT BEHAVIOR
  // ============================================

  describe('upsert configuration', () => {
    test('configures onConflictDoUpdate with composite target', async () => {
      const { db, mockOnConflictDoUpdate } = createMockDb();
      const file = createMockFile();

      await storeIndexedFiles({
        repoId: 'repo-123',
        files: [file],
        db,
      });

      expect(mockOnConflictDoUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.arrayContaining([
            expect.anything(), // repoFiles.repoId
            expect.anything(), // repoFiles.filePath
          ]),
        }),
      );
    });

    test('updates language, sizeBytes, tokenEstimate on conflict', async () => {
      const { db, mockOnConflictDoUpdate } = createMockDb();
      const file = createMockFile({
        language: 'python',
        sizeBytes: 2000,
      });

      await storeIndexedFiles({
        repoId: 'repo-123',
        files: [file],
        db,
      });

      expect(mockOnConflictDoUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          set: expect.objectContaining({
            language: 'python',
            sizeBytes: 2000,
            tokenEstimate: Math.ceil(2000 / CHARS_PER_TOKEN),
          }),
        }),
      );
    });
  });

  // ============================================
  // TESTS: EDGE CASES
  // ============================================

  describe('edge cases', () => {
    test('handles zero-byte file', async () => {
      const { db, mockValues } = createMockDb();
      const file = createMockFile({ sizeBytes: 0 });

      const result = await storeIndexedFiles({
        repoId: 'repo-123',
        files: [file],
        db,
      });

      expect(result.stored).toBe(1);
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          sizeBytes: 0,
          tokenEstimate: 0,
        }),
      );
    });

    test('handles large file with many tokens', async () => {
      const { db, mockValues } = createMockDb();
      const largeSize = 1_000_000; // 1MB
      const file = createMockFile({ sizeBytes: largeSize });

      await storeIndexedFiles({
        repoId: 'repo-123',
        files: [file],
        db,
      });

      const expectedTokens = Math.ceil(largeSize / CHARS_PER_TOKEN); // 250,000
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenEstimate: expectedTokens,
        }),
      );
    });

    test('preserves file path exactly', async () => {
      const { db, mockValues } = createMockDb();
      const file = createMockFile({
        filePath: 'src/components/Button/index.tsx',
      });

      await storeIndexedFiles({
        repoId: 'repo-123',
        files: [file],
        db,
      });

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          filePath: 'src/components/Button/index.tsx',
        }),
      );
    });
  });

  // ============================================
  // TESTS: TIMESTAMP
  // ============================================

  describe('timestamp handling', () => {
    test('sets lastSeenAt on insert', async () => {
      const { db, mockValues } = createMockDb();
      const file = createMockFile();

      await storeIndexedFiles({
        repoId: 'repo-123',
        files: [file],
        db,
      });

      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          lastSeenAt: expect.any(Date),
        }),
      );
    });

    test('updates lastSeenAt on conflict (uses SQL now())', async () => {
      const { db, mockOnConflictDoUpdate } = createMockDb();
      const file = createMockFile();

      await storeIndexedFiles({
        repoId: 'repo-123',
        files: [file],
        db,
      });

      // The set object should contain a SQL expression for lastSeenAt
      const callArg = mockOnConflictDoUpdate.mock.calls[0][0];
      expect(callArg.set).toHaveProperty('lastSeenAt');
    });
  });
});
