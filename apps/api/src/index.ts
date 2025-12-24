/**
 * Local development server entry point.
 *
 * This file runs the Hono app as a Bun server for local development.
 * For Vercel deployment, see api/[[...route]].ts in the repo root.
 */

import { closeDb } from './lib/db';
import { initTrigger } from './lib/trigger';
import { createApp } from './app';

// Initialize Trigger.dev SDK (only for local development)
initTrigger();

// Create app with logger enabled for local development
const app = createApp({ enableLogger: true });

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
