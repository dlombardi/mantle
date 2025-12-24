/**
 * tRPC initialization and base procedures.
 *
 * This file sets up the tRPC instance with superjson transformer
 * and defines public/protected procedures.
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { Context } from './context';

/**
 * Initialize tRPC with context and superjson transformer.
 * superjson preserves Date objects, undefined values, and other
 * JavaScript types that JSON.stringify would lose.
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Include Zod validation errors in a structured format
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Router factory - creates new routers.
 */
export const router = t.router;

/**
 * Middleware factory - creates reusable middleware.
 */
export const middleware = t.middleware;

/**
 * Merge routers utility - combines multiple routers.
 */
export const mergeRouters = t.mergeRouters;

/**
 * Public procedure - no authentication required.
 * Use for health checks, public data, etc.
 */
export const publicProcedure = t.procedure;

/**
 * Auth middleware - ensures user is authenticated.
 * Narrows context type from `User | null` to `User`.
 */
const isAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    });
  }

  return next({
    ctx: {
      ...ctx,
      // Narrow user type: User instead of User | null
      user: ctx.user,
    },
  });
});

/**
 * Protected procedure - requires authenticated user.
 * Use for user-specific data, mutations, etc.
 */
export const protectedProcedure = t.procedure.use(isAuthed);
