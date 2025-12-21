import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configure } from '@trigger.dev/sdk/v3';

@Injectable()
export class TriggerService implements OnModuleInit {
  private readonly logger = new Logger(TriggerService.name);
  private configured = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const secretKey = this.configService.get<string>('TRIGGER_SECRET_KEY');

    if (!secretKey) {
      this.logger.warn(
        'Trigger.dev secret key not configured. Background jobs will fail.',
      );
      return;
    }

    configure({
      secretKey,
    });

    this.configured = true;
    this.logger.log('Trigger.dev client configured');
  }

  /**
   * Check if Trigger.dev is properly configured.
   */
  isConfigured(): boolean {
    return this.configured;
  }

  /**
   * Health check for Trigger.dev connection.
   */
  async healthCheck(): Promise<{ configured: boolean }> {
    return { configured: this.configured };
  }
}
