/**
 * Shared Hono application configuration.
 *
 * This file exports the configured Hono app without server startup,
 * allowing it to be used by both:
 * - Local development server (index.ts)
 * - Vercel Functions (api/[[...route]].ts)
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';
import { trpcServer } from '@hono/trpc-server';
import { ZodError } from 'zod';
import { getDb } from './lib/db';
import { healthRoutes } from './routes/health';
import { exampleRoutes } from './routes/example';
import { seedRoutes } from './routes/seed';
import { appRouter, createContext } from '@mantle/trpc';

/**
 * Create and configure the Hono application.
 *
 * @param options.enableLogger - Enable request logging (default: true for local, false for serverless)
 */
export function createApp(options: { enableLogger?: boolean } = {}) {
  const { enableLogger = false } = options;

  const app = new Hono().basePath('/api');

  // Middleware
  if (enableLogger) {
    app.use('*', logger());
  }

  app.use(
    '*',
    cors({
      origin: process.env.CORS_ORIGIN ?? '*',
      credentials: true,
    }),
  );

  // Root endpoint
  app.get('/', (c) => {
    return c.json({
      message: 'Mantle API',
      version: '0.1.0',
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
    });
  });

  // Health check routes
  app.route('/health', healthRoutes);

  // Example routes (demonstrates validation patterns)
  app.route('/example', exampleRoutes);

  // Seed routes (dev/preview only - for QA verification)
  app.route('/seed', seedRoutes);

  // tRPC routes - type-safe RPC endpoints
  app.use(
    '/trpc/*',
    trpcServer({
      router: appRouter,
      endpoint: '/api/trpc',
      createContext: async ({ req }) => {
        return createContext({
          req,
          getDb,
          // TODO: Add user extraction from JWT
          getUser: async () => null,
        });
      },
    }),
  );

  // Global error handler
  app.onError((err, c) => {
    // Handle Zod validation errors
    if (err instanceof ZodError) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: err.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        400,
      );
    }

    // Handle HTTP exceptions
    if (err instanceof HTTPException) {
      return c.json(
        {
          error: {
            code: 'HTTP_ERROR',
            message: err.message,
          },
        },
        err.status,
      );
    }

    // Handle unexpected errors
    console.error('Unhandled error:', err);
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      500,
    );
  });

  return app;
}

// Default app instance for convenience
export const app = createApp();
