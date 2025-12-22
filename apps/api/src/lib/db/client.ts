/**
 * Database client singleton for Drizzle ORM with postgres-js driver.
 *
 * Connection pool configuration:
 * - max: 10 connections
 * - idle_timeout: 20 seconds
 * - connect_timeout: 10 seconds
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './schema';

// Singleton instances
let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Get or create the Drizzle database instance.
 * Uses a singleton pattern to ensure connection pooling works correctly.
 */
export function getDb() {
  if (!db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL environment variable is not configured');
    }

    client = postgres(url, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });

    db = drizzle(client, { schema });
  }

  return db;
}

/**
 * Close the database connection pool.
 * Call this during graceful shutdown.
 */
export async function closeDb(): Promise<void> {
  if (client) {
    await client.end();
    client = null;
    db = null;
  }
}

/**
 * Health check for the database connection.
 * Returns connection status for health endpoints.
 */
export async function dbHealthCheck(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    const database = getDb();
    await database.execute(sql`SELECT 1`);
    return { connected: true };
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
