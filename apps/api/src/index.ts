import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { closeDb } from './lib/db';
import { initTrigger } from './lib/trigger';
import { healthRoutes } from './routes/health';

// Initialize Trigger.dev SDK
initTrigger();

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

// Health check routes
app.route('/health', healthRoutes);

const port = parseInt(process.env.PORT ?? '3001', 10);

// Graceful shutdown
async function shutdown() {
  console.log('\n🛑 Shutting down gracefully...');
  await closeDb();
  console.log('✅ Database connections closed');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log(`🚀 Mantle API running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
