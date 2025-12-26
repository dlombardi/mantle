/**
 * Tests for ingestRepoJob
 *
 * Uses mocked dependencies to test job logic without external calls.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDb } from '@/lib/db';

// Mock @mantle/trpc utilities
vi.mock('@mantle/trpc', () => ({
  fetchFileTree: vi.fn(),
  indexFileTreeWithTokens: vi.fn(),
  storeIndexedFiles: vi.fn(),
  createOversizedMessage: vi.fn(),
}));

import {
  fetchFileTree,
  indexFileTreeWithTokens,
  storeIndexedFiles,
  createOversizedMessage,
} from '@mantle/trpc';

// Import run handler after mocks are set up (not the task, which can't be unit tested)
import { runIngestRepo } from './ingest-repo';

// ============================================
// MOCK HELPERS
// ============================================

/**
 * Create a mock database with chainable query methods.
 */
function createMockDb() {
  const mockUpdate = vi.fn().mockReturnThis();
  const mockSet = vi.fn().mockReturnThis();
  const mockWhere = vi.fn().mockResolvedValue({});
  const mockLimit = vi.fn();
  const mockFrom = vi.fn().mockReturnThis();
  const mockSelect = vi.fn().mockReturnValue({
    from: mockFrom,
    where: vi.fn().mockReturnValue({
      limit: mockLimit,
    }),
  });

  return {
    select: mockSelect,
    update: mockUpdate,
    from: mockFrom,
    set: mockSet,
    where: mockWhere,
    limit: mockLimit,
    _mockUpdate: mockUpdate,
    _mockSet: mockSet,
    _mockLimit: mockLimit,
  };
}

/**
 * Create a mock repo record.
 */
function createMockRepo(overrides: Record<string, unknown> = {}) {
  return {
    id: 'repo-123',
    userId: 'user-456',
    githubId: 12345,
    githubFullName: 'owner/repo',
    defaultBranch: 'main',
    private: false,
    installationId: 67890,
    ingestionStatus: 'pending' as const,
    lastIngestedAt: null,
    lastIngestedCommitSha: null,
    fileCount: null,
    tokenCount: null,
    extractionStatus: 'pending' as const,
    lastExtractedAt: null,
    patternCount: null,
    lastError: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create mock tree result from fetchFileTree.
 */
function createMockTreeResult() {
  return {
    files: [
      {
        path: 'src/index.ts',
        sha: 'abc123',
        size: 1000,
        type: 'blob' as const,
        mode: '100644',
      },
      {
        path: 'src/utils.ts',
        sha: 'def456',
        size: 500,
        type: 'blob' as const,
        mode: '100644',
      },
    ],
    sha: 'tree-sha-123',
    truncated: false,
  };
}

/**
 * Create mock index result from indexFileTreeWithTokens.
 */
function createMockIndexResult(overrides: Record<string, unknown> = {}) {
  return {
    files: [
      { filePath: 'src/index.ts', language: 'typescript', sizeBytes: 1000 },
      { filePath: 'src/utils.ts', language: 'typescript', sizeBytes: 500 },
    ],
    stats: {
      totalFiles: 2,
      includedFiles: 2,
      excludedByPath: 0,
      excludedByExtension: 0,
      excludedBySize: 0,
    },
    tokenCount: {
      totalBytes: 1500,
      estimatedTokens: 375,
      exceedsLimit: false,
      limit: 600000,
    },
    ...overrides,
  };
}

// ============================================
// TESTS
// ============================================

describe('ingestRepoJob', () => {
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockDb();
    vi.mocked(getDb).mockReturnValue(
      mockDb as unknown as ReturnType<typeof getDb>,
    );
  });

  // ----------------------------------------
  // IDEMPOTENCY TESTS
  // ----------------------------------------

  describe('idempotency', () => {
    it('should skip ingestion if repo is already ingested', async () => {
      const repo = createMockRepo({
        ingestionStatus: 'ingested',
        fileCount: 100,
        tokenCount: 25000,
        lastIngestedCommitSha: 'abc123',
      });
      mockDb._mockLimit.mockResolvedValue([repo]);

      const result = await runIngestRepo({ repoId: 'repo-123' });

      expect(result.success).toBe(true);
      expect(result.fileCount).toBe(100);
      expect(result.tokenCount).toBe(25000);
      expect(result.commitSha).toBe('abc123');
      expect(mockDb._mockUpdate).not.toHaveBeenCalled();
      expect(fetchFileTree).not.toHaveBeenCalled();
    });

    it('should proceed if repo status is pending', async () => {
      const repo = createMockRepo({ ingestionStatus: 'pending' });
      mockDb._mockLimit.mockResolvedValue([repo]);
      vi.mocked(fetchFileTree).mockResolvedValue(createMockTreeResult());
      vi.mocked(indexFileTreeWithTokens).mockReturnValue(
        createMockIndexResult(),
      );
      vi.mocked(storeIndexedFiles).mockResolvedValue({ stored: 2 });

      const result = await runIngestRepo({ repoId: 'repo-123' });

      expect(result.success).toBe(true);
      expect(fetchFileTree).toHaveBeenCalled();
    });

    it('should proceed if repo status is failed (retry)', async () => {
      const repo = createMockRepo({
        ingestionStatus: 'failed',
        lastError: 'Previous error',
      });
      mockDb._mockLimit.mockResolvedValue([repo]);
      vi.mocked(fetchFileTree).mockResolvedValue(createMockTreeResult());
      vi.mocked(indexFileTreeWithTokens).mockReturnValue(
        createMockIndexResult(),
      );
      vi.mocked(storeIndexedFiles).mockResolvedValue({ stored: 2 });

      const result = await runIngestRepo({ repoId: 'repo-123' });

      expect(result.success).toBe(true);
    });
  });

  // ----------------------------------------
  // REPO NOT FOUND
  // ----------------------------------------

  describe('repo not found', () => {
    it('should throw error if repo does not exist', async () => {
      mockDb._mockLimit.mockResolvedValue([]);

      await expect(runIngestRepo({ repoId: 'missing-repo' })).rejects.toThrow(
        'Repo not found: missing-repo',
      );
    });
  });

  // ----------------------------------------
  // HAPPY PATH
  // ----------------------------------------

  describe('successful ingestion', () => {
    it('should complete full ingestion pipeline', async () => {
      const repo = createMockRepo();
      mockDb._mockLimit.mockResolvedValue([repo]);
      vi.mocked(fetchFileTree).mockResolvedValue(createMockTreeResult());
      vi.mocked(indexFileTreeWithTokens).mockReturnValue(
        createMockIndexResult(),
      );
      vi.mocked(storeIndexedFiles).mockResolvedValue({ stored: 2 });

      const result = await runIngestRepo({ repoId: 'repo-123' });

      expect(result.success).toBe(true);
      expect(result.repoId).toBe('repo-123');
      expect(result.fileCount).toBe(2);
      expect(result.tokenCount).toBe(375);
      expect(result.commitSha).toBe('tree-sha-123');
    });

    it('should fetch file tree with correct parameters', async () => {
      const repo = createMockRepo({
        installationId: 99999,
        githubFullName: 'myorg/myrepo',
        defaultBranch: 'develop',
      });
      mockDb._mockLimit.mockResolvedValue([repo]);
      vi.mocked(fetchFileTree).mockResolvedValue(createMockTreeResult());
      vi.mocked(indexFileTreeWithTokens).mockReturnValue(
        createMockIndexResult(),
      );
      vi.mocked(storeIndexedFiles).mockResolvedValue({ stored: 2 });

      await runIngestRepo({ repoId: 'repo-123' });

      expect(fetchFileTree).toHaveBeenCalledWith(
        99999,
        'myorg',
        'myrepo',
        'develop',
      );
    });

    it('should store files with correct repoId', async () => {
      const repo = createMockRepo({ id: 'specific-repo-id' });
      mockDb._mockLimit.mockResolvedValue([repo]);
      vi.mocked(fetchFileTree).mockResolvedValue(createMockTreeResult());
      vi.mocked(indexFileTreeWithTokens).mockReturnValue(
        createMockIndexResult(),
      );
      vi.mocked(storeIndexedFiles).mockResolvedValue({ stored: 2 });

      await runIngestRepo({ repoId: 'specific-repo-id' });

      expect(storeIndexedFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          repoId: 'specific-repo-id',
        }),
      );
    });
  });

  // ----------------------------------------
  // TOKEN LIMIT
  // ----------------------------------------

  describe('token limit enforcement', () => {
    it('should fail if repo exceeds token limit', async () => {
      const repo = createMockRepo();
      mockDb._mockLimit.mockResolvedValue([repo]);
      vi.mocked(fetchFileTree).mockResolvedValue(createMockTreeResult());
      vi.mocked(indexFileTreeWithTokens).mockReturnValue(
        createMockIndexResult({
          tokenCount: {
            totalBytes: 3000000,
            estimatedTokens: 750000,
            exceedsLimit: true,
            limit: 600000,
          },
        }),
      );
      vi.mocked(createOversizedMessage).mockReturnValue(
        'Repository too large: 750k tokens exceeds 600k limit',
      );

      const result = await runIngestRepo({ repoId: 'repo-123' });

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Repository too large: 750k tokens exceeds 600k limit',
      );
      expect(storeIndexedFiles).not.toHaveBeenCalled();
    });

    it('should still report file and token counts on oversized failure', async () => {
      const repo = createMockRepo();
      mockDb._mockLimit.mockResolvedValue([repo]);
      vi.mocked(fetchFileTree).mockResolvedValue(createMockTreeResult());
      vi.mocked(indexFileTreeWithTokens).mockReturnValue(
        createMockIndexResult({
          stats: { totalFiles: 1000, includedFiles: 900 },
          tokenCount: {
            totalBytes: 3000000,
            estimatedTokens: 750000,
            exceedsLimit: true,
            limit: 600000,
          },
        }),
      );
      vi.mocked(createOversizedMessage).mockReturnValue('Too large');

      const result = await runIngestRepo({ repoId: 'repo-123' });

      expect(result.fileCount).toBe(900);
      expect(result.tokenCount).toBe(750000);
    });
  });

  // ----------------------------------------
  // ERROR HANDLING
  // ----------------------------------------

  describe('error handling', () => {
    it('should re-throw error for retry', async () => {
      const repo = createMockRepo();
      mockDb._mockLimit.mockResolvedValue([repo]);
      vi.mocked(fetchFileTree).mockRejectedValue(new Error('GitHub API error'));

      await expect(runIngestRepo({ repoId: 'repo-123' })).rejects.toThrow(
        'GitHub API error',
      );
    });

    it('should handle invalid githubFullName format', async () => {
      const repo = createMockRepo({ githubFullName: 'invalid-format' });
      mockDb._mockLimit.mockResolvedValue([repo]);

      await expect(runIngestRepo({ repoId: 'repo-123' })).rejects.toThrow(
        'Invalid GitHub full name format: invalid-format',
      );
    });
  });

  // ----------------------------------------
  // STATUS UPDATES
  // ----------------------------------------

  describe('status updates', () => {
    it('should update status to ingesting before processing', async () => {
      const repo = createMockRepo();
      mockDb._mockLimit.mockResolvedValue([repo]);
      vi.mocked(fetchFileTree).mockResolvedValue(createMockTreeResult());
      vi.mocked(indexFileTreeWithTokens).mockReturnValue(
        createMockIndexResult(),
      );
      vi.mocked(storeIndexedFiles).mockResolvedValue({ stored: 2 });

      await runIngestRepo({ repoId: 'repo-123' });

      // First update should set status to 'ingesting'
      expect(mockDb._mockUpdate).toHaveBeenCalled();
      expect(mockDb._mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          ingestionStatus: 'ingesting',
          lastError: null,
        }),
      );
    });
  });
});
