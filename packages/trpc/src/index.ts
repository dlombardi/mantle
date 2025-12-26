/**
 * @mantle/trpc - Shared tRPC types and utilities.
 *
 * This package provides the tRPC router definition and context
 * for type-safe API contracts between frontend and backend.
 *
 * @example Backend usage:
 * ```typescript
 * import { appRouter, createContext } from '@mantle/trpc';
 * import { trpcServer } from '@hono/trpc-server';
 *
 * app.use('/trpc/*', trpcServer({
 *   router: appRouter,
 *   endpoint: '/trpc',
 *   createContext: ({ req }) => createContext({ req, getDb, getUser }),
 * }));
 * ```
 *
 * @example Frontend usage:
 * ```typescript
 * import type { AppRouter } from '@mantle/trpc';
 * import { createTRPCReact } from '@trpc/react-query';
 *
 * export const trpc = createTRPCReact<AppRouter>();
 * ```
 */

// Router and types
export { appRouter, type AppRouter } from './router';

// Context
export { createContext, type Context, type User, type CreateContextOptions } from './context';

// Procedure builders (for creating routers in apps/api)
export {
  router,
  publicProcedure,
  protectedProcedure,
  middleware,
  mergeRouters,
} from './trpc';

// GitHub utilities
export { getGitHubApp, getInstallationOctokit } from './utils/github';
export {
  fetchFileTree,
  fetchDirectoryContents,
  fetchFileContent,
  fetchBlobContent,
  fetchMultipleFiles,
  checkRateLimit,
  extractRateLimitInfo,
  type RepoFile,
  type FileContent,
  type RateLimitInfo,
  type FetchOptions,
} from './utils/github-content';

// File indexing utilities
export {
  indexFileTree,
  indexFileTreeWithTokens,
  detectLanguage,
  DEFAULT_PATH_EXCLUSIONS,
  BINARY_EXTENSIONS,
  EXTENSION_TO_LANGUAGE,
  FILENAME_TO_LANGUAGE,
  DEFAULT_MAX_FILE_SIZE,
  type IndexedFile,
  type IndexerOptions,
  type IndexerStats,
  type IndexerResult,
  type IndexerResultWithTokens,
} from './utils/file-indexer';

// Token counting utilities
export {
  calculateTokenCount,
  formatTokenCount,
  createOversizedMessage,
  TOKEN_LIMIT,
  CHARS_PER_TOKEN,
  type TokenCountResult,
} from './utils/token-counter';
