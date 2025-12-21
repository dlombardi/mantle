import { Controller, Get } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { TriggerService } from '../trigger/trigger.service';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    supabase: { connected: boolean; error?: string };
    trigger: { configured: boolean };
  };
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly triggerService: TriggerService,
  ) {}

  @Get()
  async getHealth(): Promise<HealthStatus> {
    const [supabaseHealth, triggerHealth] = await Promise.all([
      this.supabaseService.healthCheck(),
      this.triggerService.healthCheck(),
    ]);

    const allHealthy =
      supabaseHealth.connected && triggerHealth.configured;
    const anyUnhealthy =
      !supabaseHealth.connected && !triggerHealth.configured;

    return {
      status: allHealthy ? 'healthy' : anyUnhealthy ? 'unhealthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      services: {
        supabase: supabaseHealth,
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
    const supabaseHealth = await this.supabaseService.healthCheck();
    return { ready: supabaseHealth.connected };
  }
}
