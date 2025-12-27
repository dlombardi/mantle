/**
 * Main tRPC router.
 *
 * Merges all feature routers into a single appRouter.
 * The AppRouter type is exported for frontend type inference.
 */

import { router, publicProcedure } from './trpc';
import { reposRouter } from './routers/repos.router';
import { patternsRouter } from './routers/patterns.router';
import { githubRouter } from './routers/github.router';
import { installationsRouter } from './routers/installations.router';

/**
 * Main application router.
 *
 * All feature routers are merged here under their namespace:
 * - repos.list, repos.getById, etc.
 * - patterns.list, patterns.updateStatus, etc.
 * - installations.list, installations.discoverInstallations, etc.
 */
export const appRouter = router({
  // Health check procedure (public, for testing tRPC is working)
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Feature routers
  repos: reposRouter,
  patterns: patternsRouter,
  github: githubRouter,
  installations: installationsRouter,

  // Future routers:
  // violations: violationsRouter,
  // pullRequests: pullRequestsRouter,
  // users: usersRouter,
});

/**
 * AppRouter type for frontend type inference.
 *
 * @example
 * ```typescript
 * import type { AppRouter } from '@mantle/trpc';
 * const trpc = createTRPCReact<AppRouter>();
 * ```
 */
export type AppRouter = typeof appRouter;
