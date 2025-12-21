import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DrizzleService.name);
  private client: ReturnType<typeof postgres> | null = null;
  private db: DrizzleDB | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      this.logger.warn(
        'DATABASE_URL not configured. Database operations will fail.',
      );
      return;
    }

    // Create postgres client
    this.client = postgres(databaseUrl, {
      max: 10, // Connection pool size
      idle_timeout: 20,
      connect_timeout: 10,
    });

    // Create Drizzle instance with schema
    this.db = drizzle(this.client, { schema });

    this.logger.log('Drizzle database client initialized');
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.end();
      this.logger.log('Database connection closed');
    }
  }

  /**
   * Get the typed Drizzle database instance.
   * @throws Error if database is not initialized
   */
  getDb(): DrizzleDB {
    if (!this.db) {
      throw new Error(
        'Database not initialized. Check DATABASE_URL configuration.',
      );
    }
    return this.db;
  }

  /**
   * Check if the database connection is healthy.
   */
  async healthCheck(): Promise<{ connected: boolean; error?: string }> {
    if (!this.db || !this.client) {
      return { connected: false, error: 'Database not initialized' };
    }

    try {
      // Simple query to verify connection
      await this.client`SELECT 1`;
      return { connected: true };
    } catch (err) {
      return { connected: false, error: String(err) };
    }
  }
}
