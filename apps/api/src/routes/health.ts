/**
 * Health check endpoints for monitoring and container orchestration.
 *
 * Endpoints:
 * - GET /api/health - Full health status with all service checks
 * - GET /api/health/live - Liveness probe (always returns ok)
 * - GET /api/health/ready - Readiness probe (checks database connectivity)
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { dbHealthCheck } from '../lib/db';
import { isTriggerConfigured } from '../lib/trigger';

// Response schemas - single source of truth for types
export const liveResponseSchema = z.object({
  status: z.literal('ok'),
});

export const readyResponseSchema = z.object({
  ready: z.boolean(),
  error: z.string().optional(),
});

export const healthResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string(),
  version: z.string(),
  services: z.object({
    database: z.object({
      connected: z.boolean(),
      error: z.string().optional(),
    }),
    trigger: z.object({
      configured: z.boolean(),
    }),
  }),
});

export const versionResponseSchema = z.object({
  version: z.string(),
  environment: z.string(),
  commit: z.string(),
});

// Infer types from schemas
export type LiveResponse = z.infer<typeof liveResponseSchema>;
export type ReadyResponse = z.infer<typeof readyResponseSchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type VersionResponse = z.infer<typeof versionResponseSchema>;

export const healthRoutes = new Hono();

/**
 * Full health check with all service statuses.
 * Returns 'healthy' if all services are up, 'degraded' if some are down,
 * 'unhealthy' if critical services are down.
 */
healthRoutes.get('/', async (c) => {
  const [dbHealth, triggerHealth] = await Promise.all([
    dbHealthCheck(),
    Promise.resolve({ configured: isTriggerConfigured() }),
  ]);

  // Database is critical, Trigger.dev is optional
  const status = dbHealth.connected
    ? triggerHealth.configured
      ? 'healthy'
      : 'degraded'
    : 'unhealthy';

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    services: {
      database: dbHealth,
      trigger: triggerHealth,
    },
  };

  return c.json(response);
});

/**
 * Liveness probe - indicates the process is running.
 * Always returns ok unless the process has crashed.
 */
healthRoutes.get('/live', (c) => {
  const response: LiveResponse = { status: 'ok' };
  return c.json(response);
});

/**
 * Readiness probe - indicates the service can handle requests.
 * Checks database connectivity before reporting ready.
 */
healthRoutes.get('/ready', async (c) => {
  const dbHealth = await dbHealthCheck();

  if (!dbHealth.connected) {
    const response: ReadyResponse = { ready: false, error: dbHealth.error };
    return c.json(response, 503);
  }

  const response: ReadyResponse = { ready: true };
  return c.json(response);
});

/**
 * Version endpoint - returns app version and deployment metadata.
 * Useful for debugging and verifying deployments.
 */
healthRoutes.get('/version', (c) => {
  const response: VersionResponse = {
    version: process.env.npm_package_version ?? '0.0.0',
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
  };
  return c.json(response);
});
