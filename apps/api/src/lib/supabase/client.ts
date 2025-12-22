/**
 * Supabase client singleton for server-side access.
 *
 * Uses service role key for full database access (bypasses RLS).
 * Session management is disabled since this is a backend service.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance
let client: SupabaseClient | null = null;

/**
 * Get or create the Supabase client instance.
 * Uses service role key for server-side access.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) {
      throw new Error('SUPABASE_URL environment variable is not configured');
    }

    if (!key) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY environment variable is not configured'
      );
    }

    client = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return client;
}

/**
 * Check if Supabase credentials are configured.
 * Returns configuration status for health endpoints.
 */
export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
