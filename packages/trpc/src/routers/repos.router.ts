/**
 * Repos Router - Repository management operations.
 *
 * Handles repository listing, connection, and status queries.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';

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
   *
   * @example
   * const { data } = trpc.repos.list.useQuery({ page: 1, limit: 20 });
   */
  list: protectedProcedure
    .input(paginationInput)
    .query(async ({ input }) => {
      const { page, limit } = input;
      // ctx.db and offset will be used when database query is implemented

      // TODO: Implement actual database query
      // const repos = await ctx.db.query.repos.findMany({
      //   where: eq(repos.userId, ctx.user.id),
      //   limit,
      //   offset,
      //   orderBy: [desc(repos.createdAt)],
      // });

      // Placeholder response
      return {
        items: [] as Array<{
          id: string;
          githubFullName: string;
          ingestionStatus: string;
          patternCount: number | null;
        }>,
        page,
        limit,
        total: 0,
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
