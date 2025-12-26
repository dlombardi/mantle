/**
 * Repository Ingestion Job
 *
 * Orchestrates the full ingestion pipeline:
 * 1. Fetch file tree from GitHub
 * 2. Index files with language detection and token estimation
 * 3. Store file metadata in repoFiles table
 * 4. Update repo status and metrics
 *
 * @see packages/trpc/src/utils/github-content.ts - File tree fetching
 * @see packages/trpc/src/utils/file-indexer.ts - File indexing
 * @see packages/trpc/src/utils/file-storage.ts - File storage
 */

import { task } from '@trigger.dev/sdk/v3';
import { eq } from 'drizzle-orm';
import { getDb, repos } from '@/lib/db';
import {
  fetchFileTree,
  indexFileTreeWithTokens,
  storeIndexedFiles,
  createOversizedMessage,
} from '@mantle/trpc';

// ============================================
// TYPES
// ============================================

/**
 * Payload for the ingestRepo job.
 */
export interface IngestRepoPayload {
  /** UUID of the repo to ingest */
  repoId: string;
}

/**
 * Result returned by the ingestRepo job.
 */
export interface IngestRepoResult {
  /** Whether ingestion completed successfully */
  success: boolean;
  /** UUID of the processed repo */
  repoId: string;
  /** Number of files indexed (on success) */
  fileCount?: number;
  /** Estimated token count (on success) */
  tokenCount?: number;
  /** Git commit SHA of the ingested tree (on success) */
  commitSha?: string;
  /** Error message (on failure) */
  error?: string;
}

// ============================================
// HELPERS
// ============================================

/**
 * Parse owner and repo name from GitHub full name.
 * @param fullName - Format: "owner/repo"
 * @throws Error if format is invalid
 */
function parseGitHubFullName(fullName: string): {
  owner: string;
  repo: string;
} {
  const parts = fullName.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`Invalid GitHub full name format: ${fullName}`);
  }
  return { owner: parts[0], repo: parts[1] };
}

// ============================================
// RUN HANDLER (exported for testing)
// ============================================

/**
 * Core ingestion logic, extracted for testability.
 *
 * @internal Exported for testing. Use ingestRepoJob for production.
 */
export async function runIngestRepo(
  payload: IngestRepoPayload,
): Promise<IngestRepoResult> {
  const { repoId } = payload;
  const db = getDb();

  // ----------------------------------------
  // STEP 1: Fetch repo from database
  // ----------------------------------------
  const [repoRecord] = await db
    .select()
    .from(repos)
    .where(eq(repos.id, repoId))
    .limit(1);

  if (!repoRecord) {
    throw new Error(`Repo not found: ${repoId}`);
  }

  // ----------------------------------------
  // STEP 2: Idempotency check
  // ----------------------------------------
  if (repoRecord.ingestionStatus === 'ingested') {
    console.log(`Repo ${repoId} already ingested, skipping`);
    return {
      success: true,
      repoId,
      fileCount: repoRecord.fileCount ?? 0,
      tokenCount: repoRecord.tokenCount ?? 0,
      commitSha: repoRecord.lastIngestedCommitSha ?? undefined,
    };
  }

  // ----------------------------------------
  // STEP 3: Update status to 'ingesting'
  // ----------------------------------------
  await db
    .update(repos)
    .set({
      ingestionStatus: 'ingesting',
      lastError: null,
      updatedAt: new Date(),
    })
    .where(eq(repos.id, repoId));

  try {
    // ----------------------------------------
    // STEP 4: Parse GitHub identifiers
    // ----------------------------------------
    const { owner, repo } = parseGitHubFullName(repoRecord.githubFullName);
    const installationId = repoRecord.installationId;
    const ref = repoRecord.defaultBranch;

    // ----------------------------------------
    // STEP 5: Fetch file tree from GitHub
    // ----------------------------------------
    console.log(`Fetching file tree for ${owner}/${repo}@${ref}`);
    const treeResult = await fetchFileTree(installationId, owner, repo, ref);

    if (treeResult.truncated) {
      console.warn(
        `File tree truncated for ${owner}/${repo} - large repository`,
      );
    }

    // ----------------------------------------
    // STEP 6: Index files with token counting
    // ----------------------------------------
    console.log(`Indexing ${treeResult.files.length} files`);
    const indexResult = indexFileTreeWithTokens(treeResult.files);

    console.log(
      `Indexed ${indexResult.stats.includedFiles} of ${indexResult.stats.totalFiles} files ` +
        `(excluded: ${indexResult.stats.excludedByPath} by path, ` +
        `${indexResult.stats.excludedByExtension} by extension, ` +
        `${indexResult.stats.excludedBySize} by size)`,
    );

    // ----------------------------------------
    // STEP 7: Check token limit
    // ----------------------------------------
    if (indexResult.tokenCount.exceedsLimit) {
      const errorMessage = createOversizedMessage(indexResult.tokenCount);
      console.warn(`Repo ${repoId} exceeds token limit: ${errorMessage}`);

      await db
        .update(repos)
        .set({
          ingestionStatus: 'failed',
          lastError: errorMessage,
          fileCount: indexResult.stats.includedFiles,
          tokenCount: indexResult.tokenCount.estimatedTokens,
          updatedAt: new Date(),
        })
        .where(eq(repos.id, repoId));

      return {
        success: false,
        repoId,
        fileCount: indexResult.stats.includedFiles,
        tokenCount: indexResult.tokenCount.estimatedTokens,
        error: errorMessage,
      };
    }

    // ----------------------------------------
    // STEP 8: Store indexed files
    // ----------------------------------------
    console.log(`Storing ${indexResult.files.length} files for repo ${repoId}`);
    const storeResult = await storeIndexedFiles({
      repoId,
      files: indexResult.files,
      db,
    });

    console.log(`Stored ${storeResult.stored} files`);

    // ----------------------------------------
    // STEP 9: Update repo with success status
    // ----------------------------------------
    await db
      .update(repos)
      .set({
        ingestionStatus: 'ingested',
        lastIngestedAt: new Date(),
        lastIngestedCommitSha: treeResult.sha,
        fileCount: indexResult.stats.includedFiles,
        tokenCount: indexResult.tokenCount.estimatedTokens,
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(repos.id, repoId));

    console.log(`Successfully ingested repo ${repoId}`);

    return {
      success: true,
      repoId,
      fileCount: indexResult.stats.includedFiles,
      tokenCount: indexResult.tokenCount.estimatedTokens,
      commitSha: treeResult.sha,
    };
  } catch (error) {
    // ----------------------------------------
    // ERROR HANDLING: Update status to 'failed'
    // ----------------------------------------
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Ingestion failed for repo ${repoId}:`, errorMessage);

    await db
      .update(repos)
      .set({
        ingestionStatus: 'failed',
        lastError: errorMessage,
        updatedAt: new Date(),
      })
      .where(eq(repos.id, repoId));

    // Re-throw to trigger retry if attempts remain
    throw error;
  }
}

// ============================================
// TRIGGER.DEV JOB DEFINITION
// ============================================

/**
 * Trigger.dev task for repository ingestion.
 *
 * Wraps runIngestRepo with retry configuration.
 * Use this for production; use runIngestRepo directly for testing.
 */
export const ingestRepoJob = task({
  id: 'ingest-repo',
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
    factor: 2,
  },
  run: runIngestRepo,
});
