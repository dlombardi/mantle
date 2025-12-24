/**
 * tRPC Context definition.
 *
 * The context is created for each request and provides
 * access to database, user session, and request metadata.
 */

/**
 * User information extracted from JWT/session.
 */
export interface User {
  id: string;
  githubId: number;
  githubUsername: string;
}

/**
 * Database instance type placeholder.
 * Will be properly typed when imported from @mantle/api.
 */
export type Database = unknown;

/**
 * tRPC context available to all procedures.
 *
 * The index signature is required for compatibility with @hono/trpc-server
 * which expects Record<string, unknown>.
 */
export interface Context {
  /** Database instance (Drizzle ORM) */
  db: Database;
  /** Authenticated user or null if not logged in */
  user: User | null;
  /** Original request object */
  req: Request;
  /** Index signature for @hono/trpc-server compatibility */
  [key: string]: unknown;
}

/**
 * Options for creating the tRPC context.
 */
export interface CreateContextOptions {
  /** The incoming request */
  req: Request;
  /** Function to get database instance */
  getDb: () => Database;
  /** Optional function to extract user from request */
  getUser?: () => Promise<User | null>;
}

/**
 * Creates the tRPC context for a request.
 *
 * This is called by the Hono middleware for each incoming request.
 * It initializes the database connection and extracts user info.
 *
 * @example
 * ```typescript
 * app.use('/trpc/*', trpcServer({
 *   router: appRouter,
 *   createContext: ({ req }) => createContext({
 *     req,
 *     getDb,
 *     getUser: () => extractUserFromHeader(req),
 *   }),
 * }));
 * ```
 */
export async function createContext(
  opts: CreateContextOptions
): Promise<Context> {
  const user = opts.getUser ? await opts.getUser() : null;

  return {
    db: opts.getDb(),
    user,
    req: opts.req,
  };
}
