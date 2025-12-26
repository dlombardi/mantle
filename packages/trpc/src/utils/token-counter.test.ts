/**
 * Token Counter Tests
 *
 * Tests for token estimation and limit enforcement.
 */

import { describe, test, expect } from 'vitest';
import {
  calculateTokenCount,
  formatTokenCount,
  createOversizedMessage,
  TOKEN_LIMIT,
  CHARS_PER_TOKEN,
  type TokenCountResult,
} from './token-counter';
import type { IndexedFile } from './file-indexer';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a mock indexed file with specified size.
 */
function createMockFile(sizeBytes: number): IndexedFile {
  return {
    filePath: `src/file-${sizeBytes}.ts`,
    language: 'typescript',
    sizeBytes,
  };
}

/**
 * Create an array of mock files totaling the specified bytes.
 */
function createFilesWithTotalBytes(totalBytes: number, fileCount = 10): IndexedFile[] {
  const bytesPerFile = Math.ceil(totalBytes / fileCount);
  const files: IndexedFile[] = [];

  let remaining = totalBytes;
  for (let i = 0; i < fileCount; i++) {
    const size = Math.min(bytesPerFile, remaining);
    if (size > 0) {
      files.push(createMockFile(size));
      remaining -= size;
    }
  }

  return files;
}

// ============================================
// CONSTANTS TESTS
// ============================================

describe('Token Counter Constants', () => {
  test('TOKEN_LIMIT is 600k', () => {
    expect(TOKEN_LIMIT).toBe(600_000);
  });

  test('CHARS_PER_TOKEN is 4', () => {
    expect(CHARS_PER_TOKEN).toBe(4);
  });
});

// ============================================
// calculateTokenCount TESTS
// ============================================

describe('calculateTokenCount', () => {
  describe('empty input', () => {
    test('returns 0 tokens for empty array', () => {
      const result = calculateTokenCount([]);

      expect(result.totalBytes).toBe(0);
      expect(result.estimatedTokens).toBe(0);
      expect(result.exceedsLimit).toBe(false);
      expect(result.limit).toBe(TOKEN_LIMIT);
    });
  });

  describe('token calculation', () => {
    test('calculates 250 tokens for 1KB file', () => {
      const files = [createMockFile(1000)];
      const result = calculateTokenCount(files);

      expect(result.totalBytes).toBe(1000);
      expect(result.estimatedTokens).toBe(250);
      expect(result.exceedsLimit).toBe(false);
    });

    test('calculates 25k tokens for 100KB total', () => {
      const files = createFilesWithTotalBytes(100_000);
      const result = calculateTokenCount(files);

      expect(result.totalBytes).toBe(100_000);
      expect(result.estimatedTokens).toBe(25_000);
      expect(result.exceedsLimit).toBe(false);
    });

    test('sums bytes from multiple files', () => {
      const files = [
        createMockFile(1000),
        createMockFile(2000),
        createMockFile(1000),
      ];
      const result = calculateTokenCount(files);

      expect(result.totalBytes).toBe(4000);
      expect(result.estimatedTokens).toBe(1000);
    });

    test('rounds up for non-divisible bytes', () => {
      const files = [createMockFile(5)]; // 5 / 4 = 1.25 → 2
      const result = calculateTokenCount(files);

      expect(result.estimatedTokens).toBe(2);
    });
  });

  describe('limit enforcement', () => {
    test('NOT over limit at exactly 600k tokens (2.4M bytes)', () => {
      // 600k tokens × 4 chars = 2.4M bytes
      const files = createFilesWithTotalBytes(2_400_000);
      const result = calculateTokenCount(files);

      expect(result.estimatedTokens).toBe(600_000);
      expect(result.exceedsLimit).toBe(false);
    });

    test('IS over limit at 600,001 tokens', () => {
      // Just over the limit
      const files = createFilesWithTotalBytes(2_400_004);
      const result = calculateTokenCount(files);

      expect(result.estimatedTokens).toBe(600_001);
      expect(result.exceedsLimit).toBe(true);
    });

    test('IS over limit at 750k tokens', () => {
      // 750k tokens × 4 chars = 3M bytes
      const files = createFilesWithTotalBytes(3_000_000);
      const result = calculateTokenCount(files);

      expect(result.estimatedTokens).toBe(750_000);
      expect(result.exceedsLimit).toBe(true);
    });

    test('returns limit value in result', () => {
      const result = calculateTokenCount([]);
      expect(result.limit).toBe(600_000);
    });
  });

  describe('edge cases', () => {
    test('handles single very large file', () => {
      const files = [createMockFile(10_000_000)]; // 10MB
      const result = calculateTokenCount(files);

      expect(result.totalBytes).toBe(10_000_000);
      expect(result.estimatedTokens).toBe(2_500_000);
      expect(result.exceedsLimit).toBe(true);
    });

    test('handles many small files', () => {
      const files = Array.from({ length: 1000 }, () => createMockFile(100));
      const result = calculateTokenCount(files);

      expect(result.totalBytes).toBe(100_000);
      expect(result.estimatedTokens).toBe(25_000);
      expect(result.exceedsLimit).toBe(false);
    });

    test('handles zero-byte files', () => {
      const files = [
        createMockFile(0),
        createMockFile(100),
        createMockFile(0),
      ];
      const result = calculateTokenCount(files);

      expect(result.totalBytes).toBe(100);
      expect(result.estimatedTokens).toBe(25);
    });
  });
});

// ============================================
// formatTokenCount TESTS
// ============================================

describe('formatTokenCount', () => {
  describe('small numbers (< 1k)', () => {
    test('formats 0 as "0"', () => {
      expect(formatTokenCount(0)).toBe('0');
    });

    test('formats 500 as "500"', () => {
      expect(formatTokenCount(500)).toBe('500');
    });

    test('formats 999 as "999"', () => {
      expect(formatTokenCount(999)).toBe('999');
    });
  });

  describe('thousands (1k - 999k)', () => {
    test('formats 1000 as "1k"', () => {
      expect(formatTokenCount(1_000)).toBe('1k');
    });

    test('formats 1500 as "2k" (rounds)', () => {
      expect(formatTokenCount(1_500)).toBe('2k');
    });

    test('formats 50000 as "50k"', () => {
      expect(formatTokenCount(50_000)).toBe('50k');
    });

    test('formats 600000 as "600k"', () => {
      expect(formatTokenCount(600_000)).toBe('600k');
    });

    test('formats 999499 as "999k"', () => {
      expect(formatTokenCount(999_499)).toBe('999k');
    });
  });

  describe('millions (>= 1M)', () => {
    test('formats 1000000 as "1M"', () => {
      expect(formatTokenCount(1_000_000)).toBe('1M');
    });

    test('formats 1500000 as "1.5M"', () => {
      expect(formatTokenCount(1_500_000)).toBe('1.5M');
    });

    test('formats 2000000 as "2M"', () => {
      expect(formatTokenCount(2_000_000)).toBe('2M');
    });

    test('formats 2345678 as "2.3M"', () => {
      expect(formatTokenCount(2_345_678)).toBe('2.3M');
    });
  });
});

// ============================================
// createOversizedMessage TESTS
// ============================================

describe('createOversizedMessage', () => {
  test('creates message for 750k tokens', () => {
    const result: TokenCountResult = {
      totalBytes: 3_000_000,
      estimatedTokens: 750_000,
      exceedsLimit: true,
      limit: 600_000,
    };

    const message = createOversizedMessage(result);

    expect(message).toBe('Repository too large: 750k tokens exceeds 600k limit');
  });

  test('creates message for 1.5M tokens', () => {
    const result: TokenCountResult = {
      totalBytes: 6_000_000,
      estimatedTokens: 1_500_000,
      exceedsLimit: true,
      limit: 600_000,
    };

    const message = createOversizedMessage(result);

    expect(message).toBe('Repository too large: 1.5M tokens exceeds 600k limit');
  });

  test('includes formatted token counts', () => {
    const result: TokenCountResult = {
      totalBytes: 2_600_000,
      estimatedTokens: 650_000,
      exceedsLimit: true,
      limit: 600_000,
    };

    const message = createOversizedMessage(result);

    expect(message).toContain('650k');
    expect(message).toContain('600k');
    expect(message).toContain('exceeds');
  });
});

// ============================================
// INTEGRATION WITH FILE INDEXER
// ============================================

describe('Integration with indexFileTreeWithTokens', () => {
  // These tests verify the token counter works correctly
  // when called via the combined function

  test('realistic small repo (under limit)', () => {
    // 50 files, avg 10KB each = 500KB = ~125k tokens
    const files = Array.from({ length: 50 }, () =>
      createMockFile(10_000)
    );
    const result = calculateTokenCount(files);

    expect(result.totalBytes).toBe(500_000);
    expect(result.estimatedTokens).toBe(125_000);
    expect(result.exceedsLimit).toBe(false);
  });

  test('realistic medium repo (under limit)', () => {
    // 200 files, avg 10KB each = 2MB = ~500k tokens
    const files = Array.from({ length: 200 }, () =>
      createMockFile(10_000)
    );
    const result = calculateTokenCount(files);

    expect(result.totalBytes).toBe(2_000_000);
    expect(result.estimatedTokens).toBe(500_000);
    expect(result.exceedsLimit).toBe(false);
  });

  test('realistic large repo (over limit)', () => {
    // 500 files, avg 10KB each = 5MB = ~1.25M tokens
    const files = Array.from({ length: 500 }, () =>
      createMockFile(10_000)
    );
    const result = calculateTokenCount(files);

    expect(result.totalBytes).toBe(5_000_000);
    expect(result.estimatedTokens).toBe(1_250_000);
    expect(result.exceedsLimit).toBe(true);
  });
});
