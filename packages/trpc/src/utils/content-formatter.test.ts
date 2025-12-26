/**
 * Content Formatter Tests
 *
 * Tests for file formatting and chunking utilities.
 */

import { describe, test, expect } from 'vitest';
import { formatFileForContext, chunkFilesForContext } from './content-formatter';
import { CHARS_PER_TOKEN } from './token-counter';
import type { FileContent } from './github-content';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a mock FileContent for testing.
 */
function createMockContent(overrides: Partial<FileContent> = {}): FileContent {
  return {
    path: 'src/index.ts',
    sha: 'abc123',
    content: 'const x = 1;',
    encoding: 'utf-8' as const,
    size: 12,
    ...overrides,
  };
}

/**
 * Create content with specific size for token testing.
 */
function createContentWithSize(path: string, sizeChars: number): FileContent {
  return createMockContent({
    path,
    content: 'x'.repeat(sizeChars),
    size: sizeChars,
  });
}

// ============================================
// formatFileForContext TESTS
// ============================================

describe('formatFileForContext', () => {
  describe('basic formatting', () => {
    test('formats file with path header', () => {
      const content = createMockContent({ path: 'src/utils/helper.ts' });
      const result = formatFileForContext(content, 'typescript');

      expect(result.formattedContent).toContain('## File: src/utils/helper.ts');
    });

    test('includes language in header', () => {
      const content = createMockContent();
      const result = formatFileForContext(content, 'typescript');

      expect(result.formattedContent).toContain('Language: typescript');
    });

    test('wraps content in code fence with language', () => {
      const content = createMockContent({ content: 'const x = 1;' });
      const result = formatFileForContext(content, 'typescript');

      expect(result.formattedContent).toContain('```typescript');
      expect(result.formattedContent).toContain('const x = 1;');
      expect(result.formattedContent).toContain('```');
    });

    test('uses "text" for null language', () => {
      const content = createMockContent();
      const result = formatFileForContext(content, null);

      expect(result.formattedContent).toContain('Language: text');
      expect(result.formattedContent).toContain('```text');
    });
  });

  describe('result properties', () => {
    test('preserves original path', () => {
      const content = createMockContent({ path: 'deep/nested/file.ts' });
      const result = formatFileForContext(content, 'typescript');

      expect(result.path).toBe('deep/nested/file.ts');
    });

    test('preserves original content', () => {
      const content = createMockContent({ content: 'original content here' });
      const result = formatFileForContext(content, 'typescript');

      expect(result.content).toBe('original content here');
    });

    test('preserves language', () => {
      const content = createMockContent();
      const result = formatFileForContext(content, 'python');

      expect(result.language).toBe('python');
    });

    test('preserves null language', () => {
      const content = createMockContent();
      const result = formatFileForContext(content, null);

      expect(result.language).toBeNull();
    });
  });

  describe('token estimation', () => {
    test('calculates token estimate from formatted length', () => {
      const content = createMockContent({ content: 'x'.repeat(100) });
      const result = formatFileForContext(content, 'typescript');

      // Formatted content includes headers + code fence
      const expectedTokens = Math.ceil(result.formattedContent.length / CHARS_PER_TOKEN);
      expect(result.tokenEstimate).toBe(expectedTokens);
    });

    test('rounds up token estimate', () => {
      // Create content where total length is not divisible by 4
      const content = createMockContent({ content: 'x' });
      const result = formatFileForContext(content, 'typescript');

      // Should round up
      expect(result.tokenEstimate).toBe(Math.ceil(result.formattedContent.length / CHARS_PER_TOKEN));
    });

    test('token estimate includes header overhead', () => {
      const content = createMockContent({ content: '' });
      const result = formatFileForContext(content, 'typescript');

      // Even empty content has headers
      expect(result.tokenEstimate).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    test('handles empty content', () => {
      const content = createMockContent({ content: '' });
      const result = formatFileForContext(content, 'typescript');

      expect(result.formattedContent).toContain('```typescript');
      expect(result.formattedContent).toContain('```');
    });

    test('handles content with backticks', () => {
      const content = createMockContent({ content: 'const x = `template`;' });
      const result = formatFileForContext(content, 'typescript');

      expect(result.formattedContent).toContain('const x = `template`;');
    });

    test('handles multiline content', () => {
      const content = createMockContent({
        content: 'line1\nline2\nline3',
      });
      const result = formatFileForContext(content, 'typescript');

      expect(result.formattedContent).toContain('line1\nline2\nline3');
    });
  });
});

// ============================================
// chunkFilesForContext TESTS
// ============================================

describe('chunkFilesForContext', () => {
  describe('empty input', () => {
    test('returns empty result for empty array', () => {
      const result = chunkFilesForContext([], new Map());

      expect(result.chunks).toHaveLength(0);
      expect(result.totalFiles).toBe(0);
      expect(result.totalTokens).toBe(0);
      expect(result.exceedsBudget).toBe(false);
      expect(result.skippedFiles).toHaveLength(0);
    });
  });

  describe('single chunk scenarios', () => {
    test('returns single chunk for small files', () => {
      const contents = [
        createMockContent({ path: 'a.ts', content: 'const a = 1;' }),
        createMockContent({ path: 'b.ts', content: 'const b = 2;' }),
      ];
      const languages = new Map([
        ['a.ts', 'typescript'],
        ['b.ts', 'typescript'],
      ]);

      const result = chunkFilesForContext(contents, languages);

      expect(result.chunks).toHaveLength(1);
      expect(result.chunks[0].files).toHaveLength(2);
      expect(result.exceedsBudget).toBe(false);
    });

    test('chunk contains formatted content from all files', () => {
      const contents = [
        createMockContent({ path: 'a.ts', content: 'aaa' }),
        createMockContent({ path: 'b.ts', content: 'bbb' }),
      ];
      const languages = new Map<string, string | null>([
        ['a.ts', 'typescript'],
        ['b.ts', 'typescript'],
      ]);

      const result = chunkFilesForContext(contents, languages);

      expect(result.chunks[0].formattedContent).toContain('## File: a.ts');
      expect(result.chunks[0].formattedContent).toContain('## File: b.ts');
      expect(result.chunks[0].formattedContent).toContain('aaa');
      expect(result.chunks[0].formattedContent).toContain('bbb');
    });

    test('chunk index is 0 for single chunk', () => {
      const contents = [createMockContent()];
      const languages = new Map<string, string | null>();

      const result = chunkFilesForContext(contents, languages);

      expect(result.chunks[0].chunkIndex).toBe(0);
    });
  });

  describe('multi-chunk scenarios', () => {
    test('splits files across chunks when exceeding budget', () => {
      // Create files that together exceed a small budget
      const smallBudget = 100; // ~400 chars
      const contents = [
        createContentWithSize('a.ts', 200),
        createContentWithSize('b.ts', 200),
        createContentWithSize('c.ts', 200),
      ];
      const languages = new Map<string, string | null>();

      const result = chunkFilesForContext(contents, languages, { tokenBudget: smallBudget });

      expect(result.chunks.length).toBeGreaterThan(1);
      expect(result.exceedsBudget).toBe(true);
    });

    test('chunk indices are sequential', () => {
      const smallBudget = 50;
      const contents = [
        createContentWithSize('a.ts', 100),
        createContentWithSize('b.ts', 100),
        createContentWithSize('c.ts', 100),
      ];
      const languages = new Map<string, string | null>();

      const result = chunkFilesForContext(contents, languages, { tokenBudget: smallBudget });

      for (let i = 0; i < result.chunks.length; i++) {
        expect(result.chunks[i].chunkIndex).toBe(i);
      }
    });

    test('each chunk respects token budget', () => {
      const budget = 200;
      const contents = Array.from({ length: 10 }, (_, i) =>
        createContentWithSize(`file${i}.ts`, 100),
      );
      const languages = new Map<string, string | null>();

      const result = chunkFilesForContext(contents, languages, { tokenBudget: budget });

      for (const chunk of result.chunks) {
        expect(chunk.totalTokens).toBeLessThanOrEqual(budget);
      }
    });
  });

  describe('skipped files', () => {
    test('skips files that alone exceed budget', () => {
      const smallBudget = 50; // ~200 chars
      const contents = [
        createContentWithSize('small.ts', 50),
        createContentWithSize('huge.ts', 10000), // Way over budget
        createContentWithSize('small2.ts', 50),
      ];
      const languages = new Map<string, string | null>();

      const result = chunkFilesForContext(contents, languages, { tokenBudget: smallBudget });

      expect(result.skippedFiles).toContain('huge.ts');
      expect(result.skippedFiles).toHaveLength(1);
      expect(result.totalFiles).toBe(2);
    });

    test('includes small files even when large file is skipped', () => {
      const smallBudget = 100;
      const contents = [
        createContentWithSize('a.ts', 50),
        createContentWithSize('huge.ts', 10000),
        createContentWithSize('b.ts', 50),
      ];
      const languages = new Map<string, string | null>();

      const result = chunkFilesForContext(contents, languages, { tokenBudget: smallBudget });

      const allPaths = result.chunks.flatMap((c) => c.files.map((f) => f.path));
      expect(allPaths).toContain('a.ts');
      expect(allPaths).toContain('b.ts');
      expect(allPaths).not.toContain('huge.ts');
    });
  });

  describe('language handling', () => {
    test('uses language from map', () => {
      const contents = [createMockContent({ path: 'script.py' })];
      const languages = new Map([['script.py', 'python']]);

      const result = chunkFilesForContext(contents, languages);

      expect(result.chunks[0].files[0].language).toBe('python');
      expect(result.chunks[0].formattedContent).toContain('Language: python');
    });

    test('uses null for missing language', () => {
      const contents = [createMockContent({ path: 'unknown.xyz' })];
      const languages = new Map<string, string | null>();

      const result = chunkFilesForContext(contents, languages);

      expect(result.chunks[0].files[0].language).toBeNull();
      expect(result.chunks[0].formattedContent).toContain('Language: text');
    });
  });

  describe('token calculations', () => {
    test('totalTokens is sum of all chunk tokens', () => {
      const contents = [
        createMockContent({ path: 'a.ts', content: 'aaa' }),
        createMockContent({ path: 'b.ts', content: 'bbb' }),
      ];
      const languages = new Map<string, string | null>();

      const result = chunkFilesForContext(contents, languages);

      const sumFromChunks = result.chunks.reduce((sum, c) => sum + c.totalTokens, 0);
      expect(result.totalTokens).toBe(sumFromChunks);
    });

    test('uses default TOKEN_LIMIT when no budget specified', () => {
      // This test verifies the function works without explicit budget
      const contents = [createMockContent()];
      const languages = new Map<string, string | null>();

      // Should not throw
      const result = chunkFilesForContext(contents, languages);
      expect(result.chunks).toHaveLength(1);
    });
  });

  describe('chunk separators', () => {
    test('files in chunk are separated by ---', () => {
      const contents = [
        createMockContent({ path: 'a.ts', content: 'a' }),
        createMockContent({ path: 'b.ts', content: 'b' }),
      ];
      const languages = new Map<string, string | null>();

      const result = chunkFilesForContext(contents, languages);

      expect(result.chunks[0].formattedContent).toContain('---');
    });
  });
});
