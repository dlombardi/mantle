import { Controller, Get } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { TriggerService } from '../trigger/trigger.service';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: { connected: boolean; error?: string };
    trigger: { configured: boolean };
  };
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly triggerService: TriggerService,
  ) {}

  @Get()
  async getHealth(): Promise<HealthStatus> {
    const [databaseHealth, triggerHealth] = await Promise.all([
      this.drizzleService.healthCheck(),
      this.triggerService.healthCheck(),
    ]);

    const allHealthy = databaseHealth.connected && triggerHealth.configured;
    const anyUnhealthy = !databaseHealth.connected && !triggerHealth.configured;

    return {
      status: allHealthy ? 'healthy' : anyUnhealthy ? 'unhealthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      services: {
        database: databaseHealth,
        trigger: triggerHealth,
      },
    };
  }

  @Get('live')
  getLiveness(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('ready')
  async getReadiness(): Promise<{ ready: boolean }> {
    const databaseHealth = await this.drizzleService.healthCheck();
    return { ready: databaseHealth.connected };
  }
}
