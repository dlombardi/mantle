/**
 * Vercel Serverless Function entry point for Hono API.
 *
 * Exports the Hono app directly for Vercel's zero-config deployment.
 * See: https://hono.dev/docs/getting-started/vercel
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS middleware
app.use(
  '*',
  cors({
    origin: '*',
    credentials: true,
  }),
);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Mantle API',
    version: '0.1.0',
    environment: process.env.VERCEL_ENV ?? 'unknown',
  });
});

// Health check - liveness probe
app.get('/health/live', (c) => {
  return c.json({ status: 'ok' });
});

// Health check - readiness probe
app.get('/health/ready', (c) => {
  return c.json({
    status: 'ok',
    checks: {
      api: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

// Full health status
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    version: '0.1.0',
    environment: process.env.VERCEL_ENV ?? 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// Seed endpoint (for QA harness)
app.get('/seed', (c) => {
  const env = process.env.VERCEL_ENV;
  const isPreview = env === 'preview' || env === 'development';

  return c.json({
    scenarios: isPreview ? ['empty-repo', 'with-test-user', 'with-patterns'] : [],
    environment: env ?? 'unknown',
    enabled: isPreview,
  });
});

app.post('/seed', async (c) => {
  const env = process.env.VERCEL_ENV;
  if (env === 'production') {
    return c.json({ error: 'Seeding disabled in production' }, 403);
  }

  const body = await c.req.json().catch(() => ({}));
  return c.json({
    success: true,
    scenario: body.scenario ?? 'empty-repo',
    message: 'Seed placeholder - full implementation requires database',
  });
});

export default app;
