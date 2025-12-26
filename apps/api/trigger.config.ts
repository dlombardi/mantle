/**
 * Trigger.dev v3 Configuration
 *
 * This file tells the Trigger.dev CLI where to find task files.
 * Run `bun trigger:dev` to start the local worker.
 *
 * @see https://trigger.dev/docs/config/config-file
 */

import { defineConfig } from '@trigger.dev/sdk/v3';

export default defineConfig({
  // Project ID from Trigger.dev dashboard
  // Set via TRIGGER_PROJECT_ID env var or hardcode here
  project: process.env.TRIGGER_PROJECT_ID ?? 'mantle-dev',

  // Directories containing task files
  dirs: ['./src/jobs'],

  // Runtime configuration
  runtime: 'node',

  // Retry defaults for all tasks (can be overridden per-task)
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 30000,
      factor: 2,
    },
  },
});
