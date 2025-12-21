import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn(
        'Supabase credentials not configured. Database operations will fail.',
      );
      return;
    }

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log('Supabase client initialized');
  }

  /**
   * Get the Supabase client for database operations.
   * Uses service role key for full access (server-side only).
   */
  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase client not initialized');
    }
    return this.client;
  }

  /**
   * Health check for Supabase connection.
   */
  async healthCheck(): Promise<{ connected: boolean; error?: string }> {
    if (!this.client) {
      return { connected: false, error: 'Client not initialized' };
    }

    try {
      // Simple query to verify connection
      const { error } = await this.client.from('_health').select('*').limit(1);

      // Table doesn't exist is fine - we just want to verify connection
      if (error && !error.message.includes('does not exist')) {
        return { connected: false, error: error.message };
      }

      return { connected: true };
    } catch (err) {
      return { connected: false, error: String(err) };
    }
  }
}
