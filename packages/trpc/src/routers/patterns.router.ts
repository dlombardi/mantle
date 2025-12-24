/**
 * Patterns Router - Pattern management and triage operations.
 *
 * Handles pattern listing, status updates, and validation workflows.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';

/**
 * Pattern status enum matching the database enum.
 */
const patternStatusEnum = z.enum([
  'candidate',
  'authoritative',
  'rejected',
  'deferred',
]);

/**
 * Pagination with optional status filter.
 */
const listPatternsInput = z.object({
  repoId: z.string().uuid('Invalid repository ID'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  status: patternStatusEnum.optional(),
});

/**
 * Pattern ID input schema.
 */
const patternIdInput = z.object({
  id: z.string().uuid('Invalid pattern ID'),
});

/**
 * Update pattern status input.
 */
const updateStatusInput = z.object({
  id: z.string().uuid('Invalid pattern ID'),
  status: patternStatusEnum,
  rationale: z.string().max(1000).optional(),
  rejectionReason: z.string().max(500).optional(),
});

/**
 * Add evidence input.
 */
const addEvidenceInput = z.object({
  patternId: z.string().uuid('Invalid pattern ID'),
  filePath: z.string().min(1),
  startLine: z.number().int().positive().optional(),
  endLine: z.number().int().positive().optional(),
  snippet: z.string().max(500).optional(),
  isCanonical: z.boolean().default(false),
});

export const patternsRouter = router({
  /**
   * List patterns for a repository with optional status filter.
   *
   * @example
   * const { data } = trpc.patterns.list.useQuery({
   *   repoId: 'uuid',
   *   status: 'candidate',
   * });
   */
  list: protectedProcedure
    .input(listPatternsInput)
    .query(async ({ input }) => {
      const { page, limit } = input;
      // repoId and status will be used when database query is implemented

      // TODO: Implement actual database query
      // const patterns = await ctx.db.query.patterns.findMany({
      //   where: and(
      //     eq(patterns.repoId, repoId),
      //     status ? eq(patterns.status, status) : undefined,
      //   ),
      //   limit,
      //   offset,
      //   orderBy: [desc(patterns.extractedAt)],
      //   with: {
      //     evidence: { limit: 3, where: eq(patternEvidence.isCanonical, true) },
      //   },
      // });

      return {
        items: [] as Array<{
          id: string;
          name: string;
          description: string;
          status: string;
          type: string;
          extractedAt: string;
        }>,
        page,
        limit,
        total: 0,
      };
    }),

  /**
   * Get a single pattern with full details and evidence.
   *
   * @example
   * const { data } = trpc.patterns.getById.useQuery({ id: 'uuid' });
   */
  getById: protectedProcedure.input(patternIdInput).query(async ({ input }) => {
    const { id } = input;

    // TODO: Implement actual database query with relations
    // const pattern = await ctx.db.query.patterns.findFirst({
    //   where: eq(patterns.id, id),
    //   with: {
    //     evidence: true,
    //     provenance: true,
    //     repo: { columns: { githubFullName: true } },
    //   },
    // });

    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Pattern ${id} not found`,
    });
  }),

  /**
   * Update pattern status (triage action).
   *
   * @example
   * const { mutate } = trpc.patterns.updateStatus.useMutation();
   * mutate({ id: 'uuid', status: 'authoritative', rationale: 'Widely adopted' });
   */
  updateStatus: protectedProcedure
    .input(updateStatusInput)
    .mutation(async ({ ctx, input }) => {
      const { id, status, rationale, rejectionReason } = input;

      // Validate rejection reason is provided when rejecting
      if (status === 'rejected' && !rejectionReason) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Rejection reason is required when rejecting a pattern',
        });
      }

      // TODO: Implement status update
      // 1. Verify user has access to the pattern's repo
      // 2. Update pattern status
      // 3. Record who made the change and when

      return {
        success: true,
        pattern: {
          id,
          status,
          rationale,
          rejectionReason,
          statusChangedAt: new Date().toISOString(),
          statusChangedBy: ctx.user.id,
        },
      };
    }),

  /**
   * Defer a pattern for later review.
   *
   * @example
   * const { mutate } = trpc.patterns.defer.useMutation();
   * mutate({ id: 'uuid' });
   */
  defer: protectedProcedure
    .input(patternIdInput)
    .mutation(async ({ input }) => {
      const { id } = input;

      // TODO: Implement defer logic
      // 1. Update status to 'deferred'
      // 2. Increment deferCount
      // 3. Set deferredAt timestamp

      return {
        success: true,
        message: `Pattern ${id} deferred for later review`,
      };
    }),

  /**
   * Add evidence to a pattern.
   *
   * @example
   * const { mutate } = trpc.patterns.addEvidence.useMutation();
   * mutate({
   *   patternId: 'uuid',
   *   filePath: 'src/utils/format.ts',
   *   startLine: 10,
   *   endLine: 25,
   *   isCanonical: true,
   * });
   */
  addEvidence: protectedProcedure
    .input(addEvidenceInput)
    .mutation(async ({ input }) => {
      const { patternId, filePath, startLine, endLine, snippet, isCanonical } =
        input;

      // TODO: Implement evidence addition
      // 1. Verify user has access to the pattern's repo
      // 2. Create evidence record
      // 3. If isCanonical, update other evidence to not be canonical

      return {
        success: true,
        evidence: {
          id: 'placeholder-evidence-id',
          patternId,
          filePath,
          startLine,
          endLine,
          snippet,
          isCanonical,
          addedAt: new Date().toISOString(),
        },
      };
    }),

  /**
   * Get triage queue - patterns needing review.
   *
   * Returns candidate patterns sorted by confidence score.
   *
   * @example
   * const { data } = trpc.patterns.triageQueue.useQuery({ repoId: 'uuid' });
   */
  triageQueue: protectedProcedure
    .input(
      z.object({
        repoId: z.string().uuid(),
        limit: z.number().int().positive().max(50).default(10),
      }),
    )
    .query(async ({ input: _input }) => {
      // repoId and limit will be used when database query is implemented

      // TODO: Implement triage queue query
      // Fetch candidate patterns ordered by extraction date (newest first)
      // or by confidence score (highest first)

      return {
        items: [] as Array<{
          id: string;
          name: string;
          description: string;
          type: string;
          extractedAt: string;
          deferCount: number;
        }>,
        total: 0,
      };
    }),
});
