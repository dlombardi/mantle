/**
 * Repos Router - Repository management operations.
 *
 * Handles repository listing, connection, and status queries.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, desc } from 'drizzle-orm';
import { router, protectedProcedure } from '../trpc';
import { repos } from '@mantle/db';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// Type for the database
type DrizzleDb = PostgresJsDatabase;

/**
 * Pagination input schema - reusable across list endpoints.
 */
const paginationInput = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

/**
 * Repository ID input schema.
 */
const repoIdInput = z.object({
  id: z.string().uuid('Invalid repository ID'),
});

/**
 * Connect repository input schema.
 */
const connectRepoInput = z.object({
  owner: z.string().min(1, 'Repository owner is required'),
  name: z.string().min(1, 'Repository name is required'),
  branch: z.string().default('main'),
  installationId: z.number().int().positive('Invalid installation ID'),
});

export const reposRouter = router({
  /**
   * List repositories for the authenticated user.
   * Returns repos with status mapped for UI display.
   *
   * @example
   * const { data } = trpc.repos.list.useQuery({ page: 1, limit: 20 });
   */
  list: protectedProcedure
    .input(paginationInput)
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const offset = (page - 1) * limit;
      const db = ctx.db as DrizzleDb;

      // Fetch repos for this user
      const userRepos = await db
        .select()
        .from(repos)
        .where(eq(repos.userId, ctx.user.id))
        .orderBy(desc(repos.createdAt))
        .limit(limit)
        .offset(offset);

      // Map database status to UI status
      const items = userRepos.map((repo) => {
        // Determine display status based on ingestion + extraction status
        let status: 'pending' | 'analyzing' | 'ready' | 'error';
        let progress: { percentage: number; currentStep: string } | undefined;
        let error: { message: string } | undefined;

        if (repo.ingestionStatus === 'failed' || repo.extractionStatus === 'failed') {
          status = 'error';
          error = { message: repo.lastError || 'Analysis failed' };
        } else if (repo.ingestionStatus === 'pending') {
          status = 'pending';
        } else if (repo.ingestionStatus === 'ingesting') {
          status = 'analyzing';
          progress = { percentage: 25, currentStep: 'Indexing files...' };
        } else if (repo.extractionStatus === 'extracting') {
          status = 'analyzing';
          progress = { percentage: 75, currentStep: 'Extracting patterns...' };
        } else if (repo.extractionStatus === 'extracted') {
          status = 'ready';
        } else {
          // ingestion completed (ingested) but extraction pending
          status = 'analyzing';
          progress = { percentage: 50, currentStep: 'Analyzing git history...' };
        }

        return {
          id: repo.id,
          fullName: repo.githubFullName,
          githubUrl: `https://github.com/${repo.githubFullName}`,
          status,
          // Stats for ready repos
          ...(status === 'ready' && {
            stats: {
              authoritative: 0, // TODO: Query from patterns table
              candidates: repo.patternCount ?? 0,
              caught: 0, // TODO: Query from violations table
              lastAnalyzed: repo.lastExtractedAt ?? repo.updatedAt,
            },
          }),
          // Progress for analyzing repos
          ...(status === 'analyzing' && progress && { progress }),
          // Error for failed repos
          ...(status === 'error' && error && { error }),
        };
      });

      // Get total count
      const totalResult = await db
        .select({ count: repos.id })
        .from(repos)
        .where(eq(repos.userId, ctx.user.id));
      const total = totalResult.length;

      return {
        items,
        page,
        limit,
        total,
      };
    }),

  /**
   * Get a single repository by ID.
   *
   * @example
   * const { data } = trpc.repos.getById.useQuery({ id: 'uuid' });
   */
  getById: protectedProcedure.input(repoIdInput).query(async ({ input }) => {
    const { id } = input;

    // TODO: Implement actual database query
    // const repo = await ctx.db.query.repos.findFirst({
    //   where: eq(repos.id, id),
    // });

    // Placeholder - would throw NOT_FOUND if repo is null
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Repository ${id} not found`,
    });
  }),

  /**
   * Connect a new repository.
   *
   * @example
   * const { mutate } = trpc.repos.connect.useMutation();
   * mutate({ owner: 'user', name: 'repo', installationId: 123 });
   */
  connect: protectedProcedure
    .input(connectRepoInput)
    .mutation(async ({ input }) => {
      const { owner, name, branch } = input;
      // ctx.db and installationId will be used when database query is implemented

      // TODO: Implement repository connection logic
      // 1. Verify GitHub App installation has access
      // 2. Create repo record in database
      // 3. Trigger ingestion job

      return {
        id: 'placeholder-id',
        githubFullName: `${owner}/${name}`,
        defaultBranch: branch,
        ingestionStatus: 'pending' as const,
        message: 'Repository connected successfully. Ingestion will begin shortly.',
      };
    }),

  /**
   * Disconnect (delete) a repository.
   *
   * @example
   * const { mutate } = trpc.repos.disconnect.useMutation();
   * mutate({ id: 'uuid' });
   */
  disconnect: protectedProcedure
    .input(repoIdInput)
    .mutation(async ({ input }) => {
      const { id } = input;

      // TODO: Implement repository deletion
      // 1. Verify user owns the repo
      // 2. Delete repo (cascades to patterns, violations, etc.)

      return {
        success: true,
        message: `Repository ${id} disconnected`,
      };
    }),

  /**
   * Trigger re-ingestion for a repository.
   *
   * @example
   * const { mutate } = trpc.repos.triggerIngestion.useMutation();
   * mutate({ id: 'uuid' });
   */
  triggerIngestion: protectedProcedure
    .input(repoIdInput)
    .mutation(async ({ input }) => {
      const { id } = input;

      // TODO: Implement ingestion trigger
      // 1. Verify user owns the repo
      // 2. Update ingestion status to 'pending'
      // 3. Trigger ingestion job via Trigger.dev

      return {
        success: true,
        message: `Ingestion triggered for repository ${id}`,
      };
    }),
});
