/**
 * File Storage Utility
 *
 * Persists indexed file metadata to the repoFiles table.
 * Handles upsert logic for re-ingestion scenarios.
 *
 * @see packages/db/src/schema.ts - repoFiles table
 * @see packages/trpc/src/utils/file-indexer.ts - IndexedFile input type
 */

import { sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { repoFiles } from '@mantle/db';
import { CHARS_PER_TOKEN } from './token-counter';
import type { IndexedFile } from './file-indexer';

// ============================================
// TYPES
// ============================================

// Match the pattern used in routers (see repos.router.ts:15)
type DrizzleDb = PostgresJsDatabase;

export interface StoreFilesOptions {
  /** UUID of the repo to store files for */
  repoId: string;
  /** Indexed files from indexFileTree() or indexFileTreeWithTokens() */
  files: IndexedFile[];
  /** Drizzle database instance */
  db: DrizzleDb;
}

export interface StoreFilesResult {
  /** Total files stored (inserted or updated) */
  stored: number;
}

// ============================================
// MAIN FUNCTION
// ============================================

/**
 * Store indexed files to the repoFiles table.
 *
 * Uses upsert semantics:
 * - New files are inserted
 * - Existing files (same repoId + filePath) are updated
 *
 * @param options - Storage options including repoId, files, and db
 * @returns Result with count of stored files
 *
 * @example
 * ```typescript
 * const result = indexFileTreeWithTokens(tree.files);
 *
 * if (!result.tokenCount.exceedsLimit) {
 *   await storeIndexedFiles({
 *     repoId,
 *     files: result.files,
 *     db: ctx.db,
 *   });
 * }
 * ```
 */
export async function storeIndexedFiles(
  options: StoreFilesOptions,
): Promise<StoreFilesResult> {
  const { repoId, files, db } = options;

  if (files.length === 0) {
    return { stored: 0 };
  }

  let stored = 0;

  // Loop-based upsert (matches existing codebase pattern in seed.ts)
  for (const file of files) {
    const tokenEstimate = Math.ceil(file.sizeBytes / CHARS_PER_TOKEN);

    await db
      .insert(repoFiles)
      .values({
        repoId,
        filePath: file.filePath,
        language: file.language,
        sizeBytes: file.sizeBytes,
        tokenEstimate,
        lastSeenAt: new Date(),
      })
      .onConflictDoUpdate({
        // Composite unique index on (repoId, filePath)
        target: [repoFiles.repoId, repoFiles.filePath],
        set: {
          language: file.language,
          sizeBytes: file.sizeBytes,
          tokenEstimate,
          lastSeenAt: sql`now()`,
        },
      });

    stored++;
  }

  return { stored };
}
