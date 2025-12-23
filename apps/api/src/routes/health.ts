/**
 * Health check endpoints for monitoring and container orchestration.
 *
 * Endpoints:
 * - GET /api/health - Full health status with all service checks
 * - GET /api/health/live - Liveness probe (always returns ok)
 * - GET /api/health/ready - Readiness probe (checks database connectivity)
 */

import { Hono } from 'hono';
import { dbHealthCheck } from '../lib/db';
import { isTriggerConfigured } from '../lib/trigger';

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

  return c.json({
    status,
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    services: {
      database: dbHealth,
      trigger: triggerHealth,
    },
  });
});

/**
 * Liveness probe - indicates the process is running.
 * Always returns ok unless the process has crashed.
 */
healthRoutes.get('/live', (c) => {
  return c.json({ status: 'ok' });
});

/**
 * Readiness probe - indicates the service can handle requests.
 * Checks database connectivity before reporting ready.
 */
healthRoutes.get('/ready', async (c) => {
  const dbHealth = await dbHealthCheck();

  if (!dbHealth.connected) {
    return c.json({ ready: false, error: dbHealth.error }, 503);
  }

  return c.json({ ready: true });
});
