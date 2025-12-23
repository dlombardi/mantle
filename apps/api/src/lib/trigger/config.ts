/**
 * Trigger.dev SDK configuration for background job processing.
 *
 * Configures the SDK at application startup.
 * Jobs are defined in separate files and registered with Trigger.dev.
 */

import { configure } from '@trigger.dev/sdk/v3';

let configured = false;

/**
 * Initialize Trigger.dev SDK.
 * Call this at application startup.
 */
export function initTrigger(): void {
  const secretKey = process.env.TRIGGER_SECRET_KEY;

  if (!secretKey) {
    console.warn(
      '⚠️  TRIGGER_SECRET_KEY not configured - background jobs disabled',
    );
    return;
  }

  configure({ secretKey });
  configured = true;
  console.log('✅ Trigger.dev SDK configured');
}

/**
 * Check if Trigger.dev is configured.
 * Returns configuration status for health endpoints.
 */
export function isTriggerConfigured(): boolean {
  return configured;
}
