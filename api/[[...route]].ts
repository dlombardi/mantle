/**
 * Vercel Serverless Function entry point for Hono API.
 *
 * This catch-all route forwards all /api/* requests to the Hono app.
 * Uses Node.js runtime for full postgres/Drizzle database access.
 *
 * Note: Trigger.dev SDK is NOT initialized here - background jobs
 * are handled separately or via the local development server.
 */

import { handle } from 'hono/vercel';
import { createApp } from '../apps/api/src/app';

// Create app without logger (reduces cold start time)
const app = createApp({ enableLogger: false });

// Export the Vercel handler
export default handle(app);
