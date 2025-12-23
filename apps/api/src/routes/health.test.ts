/**
 * Tests for health check endpoints.
 *
 * Tests the /api/health routes including liveness, readiness,
 * and full health status probes.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import {
  healthRoutes,
  liveResponseSchema,
  readyResponseSchema,
  healthResponseSchema,
} from './health';

// Import mocked modules
import { dbHealthCheck } from '../lib/db';
import { isTriggerConfigured } from '../lib/trigger';

// Create test app with health routes
const app = new Hono().route('/health', healthRoutes);

describe('Health Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /health/live', () => {
    it('should return ok status', async () => {
      const res = await app.request('/health/live');

      expect(res.status).toBe(200);
      const data = liveResponseSchema.parse(await res.json());
      expect(data).toEqual({ status: 'ok' });
    });
  });

  describe('GET /health/ready', () => {
    it('should return ready when database is connected', async () => {
      vi.mocked(dbHealthCheck).mockResolvedValue({ connected: true });

      const res = await app.request('/health/ready');

      expect(res.status).toBe(200);
      const data = readyResponseSchema.parse(await res.json());
      expect(data).toEqual({ ready: true });
    });

    it('should return 503 when database is not connected', async () => {
      vi.mocked(dbHealthCheck).mockResolvedValue({
        connected: false,
        error: 'Connection refused',
      });

      const res = await app.request('/health/ready');

      expect(res.status).toBe(503);
      const data = readyResponseSchema.parse(await res.json());
      expect(data).toEqual({ ready: false, error: 'Connection refused' });
    });
  });

  describe('GET /health', () => {
    it('should return healthy when all services are up', async () => {
      vi.mocked(dbHealthCheck).mockResolvedValue({ connected: true });
      vi.mocked(isTriggerConfigured).mockReturnValue(true);

      const res = await app.request('/health');

      expect(res.status).toBe(200);
      const data = healthResponseSchema.parse(await res.json());
      expect(data.status).toBe('healthy');
      expect(data.services.database.connected).toBe(true);
      expect(data.services.trigger.configured).toBe(true);
      expect(data.timestamp).toBeDefined();
      expect(data.version).toBe('0.1.0');
    });

    it('should return degraded when trigger is not configured', async () => {
      vi.mocked(dbHealthCheck).mockResolvedValue({ connected: true });
      vi.mocked(isTriggerConfigured).mockReturnValue(false);

      const res = await app.request('/health');

      const data = healthResponseSchema.parse(await res.json());
      expect(data.status).toBe('degraded');
      expect(data.services.database.connected).toBe(true);
      expect(data.services.trigger.configured).toBe(false);
    });

    it('should return unhealthy when database is down', async () => {
      vi.mocked(dbHealthCheck).mockResolvedValue({
        connected: false,
        error: 'ECONNREFUSED',
      });
      vi.mocked(isTriggerConfigured).mockReturnValue(true);

      const res = await app.request('/health');

      const data = healthResponseSchema.parse(await res.json());
      expect(data.status).toBe('unhealthy');
      expect(data.services.database.connected).toBe(false);
    });
  });
});
