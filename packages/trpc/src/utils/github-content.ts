/**
 * GitHub Content Fetching Utilities
 *
 * Provides functions for fetching repository contents via GitHub API.
 * Implements rate limiting with exponential backoff per Decision D15.
 *
 * Key APIs used:
 * - git.getTree: Efficient recursive file listing
 * - git.getBlob: Raw file content fetching
 * - repos.getContent: File/directory content with metadata
 */

import { getInstallationOctokit } from './github';

// ============================================
// TYPES
// ============================================

export interface RepoFile {
  path: string;
  sha: string;
  size: number;
  type: 'blob' | 'tree';
  mode: string;
}

export interface FileContent {
  path: string;
  sha: string;
  content: string;
  encoding: 'utf-8' | 'base64';
  size: number;
}

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: Date;
  used: number;
}

export interface FetchOptions {
  /** Maximum number of retries on rate limit (default: 3) */
  maxRetries?: number;
  /** Base delay in ms for exponential backoff (default: 1000) */
  baseDelay?: number;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

// ============================================
// RATE LIMITING
// ============================================

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY = 1000;

/**
 * Extract rate limit info from GitHub API response headers.
 */
export function extractRateLimitInfo(headers: Record<string, string | undefined>): RateLimitInfo {
  return {
    remaining: parseInt(headers['x-ratelimit-remaining'] ?? '0', 10),
    limit: parseInt(headers['x-ratelimit-limit'] ?? '5000', 10),
    reset: new Date(parseInt(headers['x-ratelimit-reset'] ?? '0', 10) * 1000),
    used: parseInt(headers['x-ratelimit-used'] ?? '0', 10),
  };
}

/**
 * Calculate delay for exponential backoff.
 * Adds jitter to prevent thundering herd.
 */
function calculateBackoffDelay(attempt: number, baseDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
  return Math.min(exponentialDelay + jitter, 60000); // Cap at 60 seconds
}

/**
 * Sleep for a given duration, respecting abort signal.
 */
async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Operation aborted'));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new Error('Operation aborted'));
    });
  });
}

/**
 * Execute a GitHub API call with rate limit handling and exponential backoff.
 */
async function withRateLimiting<T>(
  operation: () => Promise<T>,
  options: FetchOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseDelay = options.baseDelay ?? DEFAULT_BASE_DELAY;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (options.signal?.aborted) {
      throw new Error('Operation aborted');
    }

    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Check if this is a rate limit error (403 with rate limit message or 429)
      const isRateLimited =
        (error as { status?: number }).status === 403 ||
        (error as { status?: number }).status === 429;

      if (!isRateLimited || attempt >= maxRetries) {
        throw error;
      }

      // Calculate backoff delay
      const delay = calculateBackoffDelay(attempt, baseDelay);
      console.warn(
        `GitHub rate limit hit, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`
      );

      await sleep(delay, options.signal);
    }
  }

  throw lastError;
}

// ============================================
// FILE LISTING
// ============================================

/**
 * Fetch the complete file tree for a repository.
 *
 * Uses the Git Trees API with recursive=true for efficiency.
 * Returns all files (blobs) in the repository at the given ref.
 *
 * @param installationId - GitHub App installation ID
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param ref - Git ref (branch, tag, or SHA). Defaults to HEAD.
 * @param options - Fetch options
 */
export async function fetchFileTree(
  installationId: number,
  owner: string,
  repo: string,
  ref = 'HEAD',
  options: FetchOptions = {}
): Promise<{ files: RepoFile[]; sha: string; truncated: boolean }> {
  const octokit = await getInstallationOctokit(installationId);

  // First, resolve the ref to a commit SHA
  const commitSha = await withRateLimiting(async () => {
    const { data } = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref,
    });
    return data.sha;
  }, options);

  // Then get the tree recursively
  const result = await withRateLimiting(async () => {
    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: commitSha,
      recursive: 'true',
    });
    return data;
  }, options);

  // Filter to only blobs (files) and map to our type
  const files: RepoFile[] = (result.tree ?? [])
    .filter((item): item is typeof item & { path: string; sha: string; size: number } =>
      item.type === 'blob' && !!item.path && !!item.sha
    )
    .map((item) => ({
      path: item.path,
      sha: item.sha,
      size: item.size ?? 0,
      type: 'blob' as const,
      mode: item.mode ?? '100644',
    }));

  return {
    files,
    sha: commitSha,
    truncated: result.truncated ?? false,
  };
}

/**
 * Fetch file tree for a specific directory.
 * Useful when the full tree is truncated.
 *
 * @param installationId - GitHub App installation ID
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param path - Directory path
 * @param ref - Git ref (branch, tag, or SHA)
 * @param options - Fetch options
 */
export async function fetchDirectoryContents(
  installationId: number,
  owner: string,
  repo: string,
  path: string,
  ref = 'HEAD',
  options: FetchOptions = {}
): Promise<RepoFile[]> {
  const octokit = await getInstallationOctokit(installationId);

  const result = await withRateLimiting(async () => {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });
    return data;
  }, options);

  // getContent returns an array for directories
  if (!Array.isArray(result)) {
    throw new Error(`Path "${path}" is not a directory`);
  }

  return result.map((item) => ({
    path: item.path,
    sha: item.sha,
    size: item.size ?? 0,
    type: item.type === 'dir' ? 'tree' as const : 'blob' as const,
    mode: item.type === 'dir' ? '040000' : '100644',
  }));
}

// ============================================
// FILE CONTENT
// ============================================

/**
 * Fetch the content of a single file.
 *
 * For files under 1MB, returns UTF-8 decoded content.
 * For larger files, returns base64-encoded content.
 *
 * @param installationId - GitHub App installation ID
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param path - File path
 * @param ref - Git ref (branch, tag, or SHA)
 * @param options - Fetch options
 */
export async function fetchFileContent(
  installationId: number,
  owner: string,
  repo: string,
  path: string,
  ref = 'HEAD',
  options: FetchOptions = {}
): Promise<FileContent> {
  const octokit = await getInstallationOctokit(installationId);

  const result = await withRateLimiting(async () => {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });
    return data;
  }, options);

  // getContent returns an object for files
  if (Array.isArray(result)) {
    throw new Error(`Path "${path}" is a directory, not a file`);
  }

  if (result.type !== 'file' || !('content' in result)) {
    throw new Error(`Path "${path}" is not a regular file`);
  }

  // Content is base64 encoded by GitHub
  const base64Content = result.content.replace(/\n/g, '');

  // Try to decode as UTF-8
  try {
    const content = Buffer.from(base64Content, 'base64').toString('utf-8');
    return {
      path: result.path,
      sha: result.sha,
      content,
      encoding: 'utf-8',
      size: result.size,
    };
  } catch {
    // If UTF-8 decoding fails, return base64
    return {
      path: result.path,
      sha: result.sha,
      content: base64Content,
      encoding: 'base64',
      size: result.size,
    };
  }
}

/**
 * Fetch file content by blob SHA.
 * More efficient than path-based fetch when you already have the SHA.
 *
 * @param installationId - GitHub App installation ID
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param sha - Blob SHA
 * @param options - Fetch options
 */
export async function fetchBlobContent(
  installationId: number,
  owner: string,
  repo: string,
  sha: string,
  options: FetchOptions = {}
): Promise<{ content: string; encoding: 'utf-8' | 'base64'; size: number }> {
  const octokit = await getInstallationOctokit(installationId);

  const result = await withRateLimiting(async () => {
    const { data } = await octokit.rest.git.getBlob({
      owner,
      repo,
      file_sha: sha,
    });
    return data;
  }, options);

  const base64Content = result.content.replace(/\n/g, '');

  // Try to decode as UTF-8
  try {
    const content = Buffer.from(base64Content, 'base64').toString('utf-8');
    return {
      content,
      encoding: 'utf-8',
      size: result.size ?? 0,
    };
  } catch {
    return {
      content: base64Content,
      encoding: 'base64',
      size: result.size ?? 0,
    };
  }
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Fetch multiple files in parallel with rate limiting.
 * Useful for batch content fetching.
 *
 * @param installationId - GitHub App installation ID
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param paths - Array of file paths
 * @param ref - Git ref (branch, tag, or SHA)
 * @param options - Fetch options with concurrency limit
 */
export async function fetchMultipleFiles(
  installationId: number,
  owner: string,
  repo: string,
  paths: string[],
  ref = 'HEAD',
  options: FetchOptions & { concurrency?: number } = {}
): Promise<Map<string, FileContent | Error>> {
  const concurrency = options.concurrency ?? 5;
  const results = new Map<string, FileContent | Error>();

  // Process in batches to respect concurrency limit
  for (let i = 0; i < paths.length; i += concurrency) {
    if (options.signal?.aborted) {
      throw new Error('Operation aborted');
    }

    const batch = paths.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map((path) =>
        fetchFileContent(installationId, owner, repo, path, ref, options)
      )
    );

    batchResults.forEach((result, index) => {
      const path = batch[index]!;
      if (result.status === 'fulfilled') {
        results.set(path, result.value);
      } else {
        results.set(path, result.reason);
      }
    });
  }

  return results;
}

// ============================================
// RATE LIMIT UTILITIES
// ============================================

/**
 * Check current rate limit status for an installation.
 *
 * @param installationId - GitHub App installation ID
 */
export async function checkRateLimit(installationId: number): Promise<RateLimitInfo> {
  const octokit = await getInstallationOctokit(installationId);

  const { data } = await octokit.rest.rateLimit.get();

  return {
    remaining: data.rate.remaining,
    limit: data.rate.limit,
    reset: new Date(data.rate.reset * 1000),
    used: data.rate.used,
  };
}
