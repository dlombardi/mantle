/**
 * tRPC Router Tests.
 *
 * Tests the appRouter using createCaller() for direct procedure invocation.
 * This bypasses HTTP and tests the actual procedure logic.
 */

import { describe, it, expect } from 'vitest';
import { appRouter } from './router';
import { TRPCError } from '@trpc/server';
import type { Context } from './context';

/**
 * Create a chainable mock result for Drizzle query builder pattern.
 * Supports full query chain: select().from().where().orderBy().limit().offset()
 */
function createChainableMock<T>(result: T) {
  const chain = {
    from: () => chain,
    where: () => chain,
    orderBy: () => chain,
    limit: () => chain,
    offset: () => Promise.resolve(result),
    // Make the chain thenable so it can be awaited at any point
    then: (resolve: (value: T) => void) => Promise.resolve(result).then(resolve),
  };
  return chain;
}

/**
 * Create a mock database for testing.
 * Provides chainable query builders that return configurable results.
 */
function createMockDb(options: {
  selectResult?: unknown[];
  deleteResult?: unknown[];
} = {}) {
  return {
    select: () => createChainableMock(options.selectResult ?? []),
    delete: () => ({
      where: () => Promise.resolve(options.deleteResult ?? []),
    }),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve([]),
        onConflictDoUpdate: () => ({
          returning: () => Promise.resolve([]),
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve([]),
      }),
    }),
  } as unknown as Context['db'];
}

/**
 * Create a mock tRPC context for testing.
 *
 * @param overrides - Optional context overrides
 */
function createMockContext(overrides: Partial<Context> = {}): Context {
  return {
    db: createMockDb(),
    user: null,
    req: new Request('http://localhost/trpc'),
    ...overrides,
  };
}

/**
 * Create an authenticated mock context.
 */
function createAuthenticatedContext(
  userId: string = 'test-user-id',
  overrides: Partial<Context> = {},
): Context {
  return createMockContext({
    user: {
      id: userId,
      githubId: 12345,
      githubUsername: 'testuser',
    },
    ...overrides,
  });
}

describe('appRouter', () => {
  describe('health', () => {
    it('returns status ok with timestamp', async () => {
      const caller = appRouter.createCaller(createMockContext());
      const result = await caller.health();

      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('repos', () => {
    describe('list', () => {
      it('requires authentication', async () => {
        const caller = appRouter.createCaller(createMockContext({ user: null }));

        await expect(caller.repos.list({ page: 1, limit: 20 })).rejects.toThrow(
          TRPCError,
        );
      });

      it('returns paginated results when authenticated', async () => {
        const caller = appRouter.createCaller(createAuthenticatedContext());
        const result = await caller.repos.list({ page: 1, limit: 20 });

        expect(result.items).toEqual([]);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
        expect(result.total).toBe(0);
      });

      it('uses default pagination values', async () => {
        const caller = appRouter.createCaller(createAuthenticatedContext());
        const result = await caller.repos.list({});

        expect(result.page).toBe(1);
        expect(result.limit).toBe(20);
      });
    });

    describe('getById', () => {
      it('throws NOT_FOUND for non-existent repo', async () => {
        const caller = appRouter.createCaller(createAuthenticatedContext());
        const repoId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

        await expect(caller.repos.getById({ id: repoId })).rejects.toThrow(TRPCError);
      });
    });

    describe('connect', () => {
      it('returns success with repo details', async () => {
        const caller = appRouter.createCaller(createAuthenticatedContext());
        const result = await caller.repos.connect({
          owner: 'acme',
          name: 'widgets',
          branch: 'main',
          installationId: 12345,
        });

        expect(result.githubFullName).toBe('acme/widgets');
        expect(result.defaultBranch).toBe('main');
        expect(result.ingestionStatus).toBe('pending');
      });
    });

    describe('disconnect', () => {
      it('returns success with repo fullName', async () => {
        const repoId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
        // Create context with mock db that returns the repo
        const mockDb = createMockDb({
          selectResult: [{ id: repoId, fullName: 'acme/widgets' }],
        });
        const caller = appRouter.createCaller(
          createAuthenticatedContext('test-user-id', { db: mockDb }),
        );

        const result = await caller.repos.disconnect({ id: repoId });

        expect(result.success).toBe(true);
        expect(result.fullName).toBe('acme/widgets');
      });

      it('throws NOT_FOUND when repo does not exist', async () => {
        // Default mock db returns empty array (no repo found)
        const caller = appRouter.createCaller(createAuthenticatedContext());

        await expect(
          caller.repos.disconnect({ id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' }),
        ).rejects.toThrow(TRPCError);
      });
    });

    describe('triggerIngestion', () => {
      it('returns success with message', async () => {
        const caller = appRouter.createCaller(createAuthenticatedContext());
        const repoId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
        const result = await caller.repos.triggerIngestion({ id: repoId });

        expect(result.success).toBe(true);
        expect(result.message).toContain(repoId);
      });
    });
  });

  describe('patterns', () => {
    describe('list', () => {
      it('requires authentication', async () => {
        const caller = appRouter.createCaller(createMockContext({ user: null }));
        const repoId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

        await expect(caller.patterns.list({ repoId })).rejects.toThrow(TRPCError);
      });

      it('returns paginated results when authenticated', async () => {
        const caller = appRouter.createCaller(createAuthenticatedContext());
        const repoId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
        const result = await caller.patterns.list({ repoId, page: 1, limit: 10 });

        expect(result.items).toEqual([]);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(10);
      });

      it('can filter by status', async () => {
        const caller = appRouter.createCaller(createAuthenticatedContext());
        const repoId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
        const result = await caller.patterns.list({
          repoId,
          status: 'candidate',
        });

        expect(result.items).toEqual([]);
      });
    });

    describe('updateStatus', () => {
      it('requires rejection reason when rejecting', async () => {
        const caller = appRouter.createCaller(createAuthenticatedContext());

        await expect(
          caller.patterns.updateStatus({
            id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            status: 'rejected',
            // Missing rejectionReason
          }),
        ).rejects.toThrow(TRPCError);
      });

      it('accepts rejection with reason', async () => {
        const caller = appRouter.createCaller(createAuthenticatedContext('user-1'));
        const result = await caller.patterns.updateStatus({
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          status: 'rejected',
          rejectionReason: 'Not a pattern, just coincidence',
        });

        expect(result.success).toBe(true);
        expect(result.pattern.status).toBe('rejected');
        expect(result.pattern.statusChangedBy).toBe('user-1');
      });

      it('can promote to authoritative', async () => {
        const caller = appRouter.createCaller(createAuthenticatedContext());
        const result = await caller.patterns.updateStatus({
          id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          status: 'authoritative',
          rationale: 'Widely adopted across the codebase',
        });

        expect(result.pattern.status).toBe('authoritative');
        expect(result.pattern.rationale).toBe('Widely adopted across the codebase');
      });
    });

    describe('defer', () => {
      it('returns success message', async () => {
        const caller = appRouter.createCaller(createAuthenticatedContext());
        const patternId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
        const result = await caller.patterns.defer({ id: patternId });

        expect(result.success).toBe(true);
        expect(result.message).toContain('deferred');
      });
    });

    describe('addEvidence', () => {
      it('adds evidence to a pattern', async () => {
        const caller = appRouter.createCaller(createAuthenticatedContext());
        const result = await caller.patterns.addEvidence({
          patternId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          filePath: 'src/utils/format.ts',
          startLine: 10,
          endLine: 25,
          isCanonical: true,
        });

        expect(result.success).toBe(true);
        expect(result.evidence.filePath).toBe('src/utils/format.ts');
        expect(result.evidence.isCanonical).toBe(true);
      });
    });

    describe('triageQueue', () => {
      it('returns empty queue initially', async () => {
        const caller = appRouter.createCaller(createAuthenticatedContext());
        const result = await caller.patterns.triageQueue({
          repoId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        });

        expect(result.items).toEqual([]);
        expect(result.total).toBe(0);
      });
    });
  });
});
