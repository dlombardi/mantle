import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono().basePath('/api');

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  })
);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Mantle API',
    version: '0.1.0',
  });
});

// Health routes will be added in TASK 1.5

const port = parseInt(process.env.PORT ?? '3001', 10);

console.log(`🚀 Mantle API running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
