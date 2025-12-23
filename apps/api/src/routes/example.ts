/**
 * Example routes demonstrating Zod validation with Hono.
 *
 * This file shows the pattern for validated endpoints. Delete or modify
 * when building actual feature routes.
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  paginationSchema,
  idParamSchema,
  connectRepoSchema,
} from '../lib/validation';

export const exampleRoutes = new Hono();

/**
 * GET /api/example
 * Demonstrates query parameter validation with pagination.
 */
exampleRoutes.get('/', zValidator('query', paginationSchema), async (c) => {
  const { page, limit } = c.req.valid('query');

  return c.json({
    message: 'Paginated list example',
    pagination: { page, limit, total: 100 },
    items: [],
  });
});

/**
 * GET /api/example/:id
 * Demonstrates path parameter validation.
 */
exampleRoutes.get('/:id', zValidator('param', idParamSchema), async (c) => {
  const { id } = c.req.valid('param');

  return c.json({
    message: 'Single resource example',
    id,
  });
});

/**
 * POST /api/example/connect
 * Demonstrates request body validation.
 */
exampleRoutes.post(
  '/connect',
  zValidator('json', connectRepoSchema),
  async (c) => {
    const body = c.req.valid('json');

    return c.json({
      message: 'Validated request body',
      data: body,
    });
  },
);
