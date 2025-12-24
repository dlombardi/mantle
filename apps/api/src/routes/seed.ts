/**
 * Seed Routes - Load test data scenarios for QA verification
 *
 * SECURITY: Only available in development and preview environments.
 * Protected by environment check - will return 403 in production.
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

/**
 * Check if we're in a seedable environment (dev or preview)
 */
function isSeedableEnvironment(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;
  const nodeEnv = process.env.NODE_ENV;

  // Allow seeding in:
  // - Local development (no VERCEL_ENV, NODE_ENV !== 'production')
  // - Vercel preview deployments (VERCEL_ENV === 'preview')
  if (vercelEnv === 'preview') return true;
  if (!vercelEnv && nodeEnv !== 'production') return true;

  return false;
}

// Request schema
const seedRequestSchema = z.object({
  scenario: z.string().min(1).max(50),
});

// Response schemas
const seedResponseSchema = z.object({
  success: z.boolean(),
  scenario: z.string(),
  message: z.string().optional(),
});

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export const seedRoutes = new Hono();

/**
 * POST /api/seed - Load a seed scenario
 */
seedRoutes.post('/', zValidator('json', seedRequestSchema), async (c) => {
  // Security check: only allow in dev/preview
  if (!isSeedableEnvironment()) {
    return c.json(
      {
        error: {
          code: 'FORBIDDEN',
          message: 'Seed endpoint is only available in development and preview environments',
        },
      },
      403,
    );
  }

  const { scenario } = c.req.valid('json');

  try {
    // Dynamic import to avoid bundling test-utils in production
    const { getScenario } = await import('@mantle/test-utils');

    const scenarioInstance = getScenario(scenario);

    // TODO: Pass actual db and supabase clients when available
    const result = await scenarioInstance.seed({
      db: null,
      supabase: null,
    });

    if (!result.success) {
      return c.json(
        {
          error: {
            code: 'SEED_FAILED',
            message: result.error ?? 'Scenario seed failed',
          },
        },
        500,
      );
    }

    return c.json({
      success: true,
      scenario,
      message: `Scenario '${scenario}' loaded successfully`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return c.json(
      {
        error: {
          code: 'SEED_ERROR',
          message,
        },
      },
      400,
    );
  }
});

/**
 * GET /api/seed - List available scenarios
 */
seedRoutes.get('/', async (c) => {
  // Security check
  if (!isSeedableEnvironment()) {
    return c.json(
      {
        error: {
          code: 'FORBIDDEN',
          message: 'Seed endpoint is only available in development and preview environments',
        },
      },
      403,
    );
  }

  try {
    const { listScenarios } = await import('@mantle/test-utils');
    const scenarios = listScenarios();

    return c.json({
      scenarios,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
    });
  } catch (error) {
    return c.json(
      {
        error: {
          code: 'LIST_ERROR',
          message: 'Failed to list scenarios',
        },
      },
      500,
    );
  }
});

/**
 * DELETE /api/seed - Reset to empty state
 */
seedRoutes.delete('/', async (c) => {
  // Security check
  if (!isSeedableEnvironment()) {
    return c.json(
      {
        error: {
          code: 'FORBIDDEN',
          message: 'Seed endpoint is only available in development and preview environments',
        },
      },
      403,
    );
  }

  try {
    const { getScenario } = await import('@mantle/test-utils');

    const emptyScenario = getScenario('empty-repo');

    await emptyScenario.seed({
      db: null,
      supabase: null,
    });

    return c.json({
      success: true,
      message: 'Database reset to empty state',
    });
  } catch (error) {
    return c.json(
      {
        error: {
          code: 'RESET_ERROR',
          message: 'Failed to reset database',
        },
      },
      500,
    );
  }
});

// Export schemas for testing
export { seedRequestSchema, seedResponseSchema, errorResponseSchema };
