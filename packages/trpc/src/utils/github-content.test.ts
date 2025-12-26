/**
 * GitHub Content Fetching Tests
 *
 * Tests the content fetching utilities with mocked Octokit responses.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  extractRateLimitInfo,
  fetchFileTree,
  fetchFileContent,
  fetchBlobContent,
  fetchDirectoryContents,
  fetchMultipleFiles,
  checkRateLimit,
} from './github-content';

// Mock the github module
vi.mock('./github', () => ({
  getInstallationOctokit: vi.fn(),
}));

import { getInstallationOctokit } from './github';

const mockOctokit = {
  rest: {
    repos: {
      getCommit: vi.fn(),
      getContent: vi.fn(),
    },
    git: {
      getTree: vi.fn(),
      getBlob: vi.fn(),
    },
    rateLimit: {
      get: vi.fn(),
    },
  },
};

beforeEach(() => {
  vi.mocked(getInstallationOctokit).mockResolvedValue(mockOctokit as unknown as Awaited<ReturnType<typeof getInstallationOctokit>>);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('extractRateLimitInfo', () => {
  it('extracts rate limit info from headers', () => {
    const headers = {
      'x-ratelimit-remaining': '4999',
      'x-ratelimit-limit': '5000',
      'x-ratelimit-reset': '1703548800',
      'x-ratelimit-used': '1',
    };

    const info = extractRateLimitInfo(headers);

    expect(info.remaining).toBe(4999);
    expect(info.limit).toBe(5000);
    expect(info.used).toBe(1);
    expect(info.reset.getTime()).toBe(1703548800000);
  });

  it('handles missing headers with defaults', () => {
    const info = extractRateLimitInfo({});

    expect(info.remaining).toBe(0);
    expect(info.limit).toBe(5000);
    expect(info.used).toBe(0);
  });
});

describe('fetchFileTree', () => {
  it('fetches complete file tree for a repository', async () => {
    mockOctokit.rest.repos.getCommit.mockResolvedValue({
      data: { sha: 'abc123' },
    });

    mockOctokit.rest.git.getTree.mockResolvedValue({
      data: {
        sha: 'tree-sha',
        truncated: false,
        tree: [
          { path: 'README.md', sha: 'blob1', type: 'blob', size: 1024, mode: '100644' },
          { path: 'src/index.ts', sha: 'blob2', type: 'blob', size: 2048, mode: '100644' },
          { path: 'src', sha: 'tree1', type: 'tree', mode: '040000' },
        ],
      },
    });

    const result = await fetchFileTree(12345, 'owner', 'repo', 'main');

    expect(result.sha).toBe('abc123');
    expect(result.truncated).toBe(false);
    expect(result.files).toHaveLength(2); // Only blobs, not trees
    expect(result.files[0]).toEqual({
      path: 'README.md',
      sha: 'blob1',
      size: 1024,
      type: 'blob',
      mode: '100644',
    });
  });

  it('uses HEAD as default ref', async () => {
    mockOctokit.rest.repos.getCommit.mockResolvedValue({
      data: { sha: 'head-sha' },
    });
    mockOctokit.rest.git.getTree.mockResolvedValue({
      data: { sha: 'tree-sha', truncated: false, tree: [] },
    });

    await fetchFileTree(12345, 'owner', 'repo');

    expect(mockOctokit.rest.repos.getCommit).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      ref: 'HEAD',
    });
  });

  it('indicates when tree is truncated', async () => {
    mockOctokit.rest.repos.getCommit.mockResolvedValue({
      data: { sha: 'abc123' },
    });
    mockOctokit.rest.git.getTree.mockResolvedValue({
      data: { sha: 'tree-sha', truncated: true, tree: [] },
    });

    const result = await fetchFileTree(12345, 'owner', 'repo');

    expect(result.truncated).toBe(true);
  });
});

describe('fetchFileContent', () => {
  it('fetches and decodes file content as UTF-8', async () => {
    const content = 'Hello, World!';
    const base64Content = Buffer.from(content).toString('base64');

    mockOctokit.rest.repos.getContent.mockResolvedValue({
      data: {
        type: 'file',
        path: 'README.md',
        sha: 'blob-sha',
        size: content.length,
        content: base64Content,
      },
    });

    const result = await fetchFileContent(12345, 'owner', 'repo', 'README.md');

    expect(result.path).toBe('README.md');
    expect(result.sha).toBe('blob-sha');
    expect(result.content).toBe(content);
    expect(result.encoding).toBe('utf-8');
  });

  it('throws error for directories', async () => {
    mockOctokit.rest.repos.getContent.mockResolvedValue({
      data: [
        { name: 'file1.ts', type: 'file' },
        { name: 'file2.ts', type: 'file' },
      ],
    });

    await expect(
      fetchFileContent(12345, 'owner', 'repo', 'src')
    ).rejects.toThrow('is a directory');
  });
});

describe('fetchBlobContent', () => {
  it('fetches blob content by SHA', async () => {
    const content = 'export const foo = 42;';
    const base64Content = Buffer.from(content).toString('base64');

    mockOctokit.rest.git.getBlob.mockResolvedValue({
      data: {
        sha: 'blob-sha',
        size: content.length,
        content: base64Content,
      },
    });

    const result = await fetchBlobContent(12345, 'owner', 'repo', 'blob-sha');

    expect(result.content).toBe(content);
    expect(result.encoding).toBe('utf-8');
    expect(result.size).toBe(content.length);
  });
});

describe('fetchDirectoryContents', () => {
  it('lists directory contents', async () => {
    mockOctokit.rest.repos.getContent.mockResolvedValue({
      data: [
        { path: 'src/index.ts', sha: 'blob1', size: 1024, type: 'file' },
        { path: 'src/utils', sha: 'tree1', size: 0, type: 'dir' },
      ],
    });

    const result = await fetchDirectoryContents(12345, 'owner', 'repo', 'src');

    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('blob');
    expect(result[1].type).toBe('tree');
  });

  it('throws error for files', async () => {
    mockOctokit.rest.repos.getContent.mockResolvedValue({
      data: {
        type: 'file',
        path: 'README.md',
        sha: 'blob-sha',
        content: 'SGVsbG8=',
      },
    });

    await expect(
      fetchDirectoryContents(12345, 'owner', 'repo', 'README.md')
    ).rejects.toThrow('is not a directory');
  });
});

describe('fetchMultipleFiles', () => {
  it('fetches multiple files in parallel', async () => {
    const file1Content = 'File 1 content';
    const file2Content = 'File 2 content';

    mockOctokit.rest.repos.getContent
      .mockResolvedValueOnce({
        data: {
          type: 'file',
          path: 'file1.ts',
          sha: 'sha1',
          size: file1Content.length,
          content: Buffer.from(file1Content).toString('base64'),
        },
      })
      .mockResolvedValueOnce({
        data: {
          type: 'file',
          path: 'file2.ts',
          sha: 'sha2',
          size: file2Content.length,
          content: Buffer.from(file2Content).toString('base64'),
        },
      });

    const results = await fetchMultipleFiles(
      12345,
      'owner',
      'repo',
      ['file1.ts', 'file2.ts'],
      'main',
      { concurrency: 2 }
    );

    expect(results.size).toBe(2);
    expect((results.get('file1.ts') as { content: string }).content).toBe(file1Content);
    expect((results.get('file2.ts') as { content: string }).content).toBe(file2Content);
  });

  it('captures errors for individual files', async () => {
    mockOctokit.rest.repos.getContent
      .mockResolvedValueOnce({
        data: {
          type: 'file',
          path: 'exists.ts',
          sha: 'sha1',
          size: 10,
          content: Buffer.from('content').toString('base64'),
        },
      })
      .mockRejectedValueOnce(new Error('File not found'));

    const results = await fetchMultipleFiles(
      12345,
      'owner',
      'repo',
      ['exists.ts', 'missing.ts'],
      'main'
    );

    expect(results.size).toBe(2);
    expect(results.get('exists.ts')).toHaveProperty('content');
    expect(results.get('missing.ts')).toBeInstanceOf(Error);
  });
});

describe('checkRateLimit', () => {
  it('returns current rate limit status', async () => {
    mockOctokit.rest.rateLimit.get.mockResolvedValue({
      data: {
        rate: {
          remaining: 4500,
          limit: 5000,
          reset: 1703548800,
          used: 500,
        },
      },
    });

    const result = await checkRateLimit(12345);

    expect(result.remaining).toBe(4500);
    expect(result.limit).toBe(5000);
    expect(result.used).toBe(500);
    expect(result.reset.getTime()).toBe(1703548800000);
  });
});

describe('rate limiting with backoff', () => {
  it('retries on rate limit error', async () => {
    // First call fails with rate limit, second succeeds
    mockOctokit.rest.repos.getCommit
      .mockRejectedValueOnce({ status: 403, message: 'Rate limit exceeded' })
      .mockResolvedValueOnce({ data: { sha: 'abc123' } });

    mockOctokit.rest.git.getTree.mockResolvedValue({
      data: { sha: 'tree-sha', truncated: false, tree: [] },
    });

    const result = await fetchFileTree(12345, 'owner', 'repo', 'main', {
      maxRetries: 3,
      baseDelay: 10, // Short delay for tests
    });

    expect(result.sha).toBe('abc123');
    expect(mockOctokit.rest.repos.getCommit).toHaveBeenCalledTimes(2);
  });

  it('throws after max retries exceeded', async () => {
    mockOctokit.rest.repos.getCommit.mockRejectedValue({
      status: 403,
      message: 'Rate limit exceeded',
    });

    await expect(
      fetchFileTree(12345, 'owner', 'repo', 'main', {
        maxRetries: 2,
        baseDelay: 10,
      })
    ).rejects.toMatchObject({ status: 403 });

    expect(mockOctokit.rest.repos.getCommit).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('respects abort signal', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      fetchFileTree(12345, 'owner', 'repo', 'main', {
        signal: controller.signal,
      })
    ).rejects.toThrow('aborted');
  });
});
