/**
 * Tests for GitHub webhook endpoint.
 *
 * Tests signature verification, event handling, job triggering, and security logging.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { githubWebhookRoutes } from './github-webhook';

// Mock @octokit/webhooks-methods
vi.mock('@octokit/webhooks-methods', () => ({
  verify: vi.fn(),
}));

// Mock @trigger.dev/sdk/v3
vi.mock('@trigger.dev/sdk/v3', () => ({
  tasks: {
    trigger: vi.fn().mockResolvedValue({ id: 'test-run-id' }),
  },
}));

// Mock database - getDb returns a mock db with various operations
const mockDbSelect = vi.fn();
const mockDbFrom = vi.fn();
const mockDbWhere = vi.fn();
const mockDbLimit = vi.fn();

// Mock for insert operations (used by captureInstallation, autoLinkPersonalInstallation)
const mockDbInsertReturning = vi.fn();
const mockDbInsertOnConflict = vi.fn();
const mockDbInsertValues = vi.fn();
const mockDbInsert = vi.fn();
const mockDbUpdate = vi.fn();
const mockDbUpdateSet = vi.fn();
const mockDbUpdateWhere = vi.fn();

// Create a mock that can be both awaited and has .limit()
const createWhereResult = (data: unknown[]) => {
  const result = Promise.resolve(data);
  (result as unknown as { limit: typeof mockDbLimit }).limit = mockDbLimit;
  return result;
};

vi.mock('@/lib/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/db')>();
  return {
    ...actual,
    getDb: vi.fn(() => ({
      select: mockDbSelect.mockReturnValue({
        from: mockDbFrom.mockReturnValue({
          where: mockDbWhere,
        }),
      }),
      insert: mockDbInsert.mockReturnValue({
        values: mockDbInsertValues.mockReturnValue({
          onConflictDoUpdate: mockDbInsertOnConflict.mockReturnValue({
            returning: mockDbInsertReturning,
          }),
          returning: mockDbInsertReturning,
        }),
      }),
      update: mockDbUpdate.mockReturnValue({
        set: mockDbUpdateSet.mockReturnValue({
          where: mockDbUpdateWhere,
        }),
      }),
    })),
  };
});

// Import the mocked modules
import { verify } from '@octokit/webhooks-methods';
import { tasks } from '@trigger.dev/sdk/v3';

// Create test app with webhook routes
const app = new Hono().route('/github/webhook', githubWebhookRoutes);

// Helper to create webhook request
function createWebhookRequest(
  payload: unknown,
  options: {
    signature?: string;
    eventType?: string;
    deliveryId?: string;
  } = {},
) {
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.signature !== undefined) {
    headers['x-hub-signature-256'] = options.signature;
  }
  if (options.eventType !== undefined) {
    headers['x-github-event'] = options.eventType;
  }
  if (options.deliveryId !== undefined) {
    headers['x-github-delivery'] = options.deliveryId;
  }

  return new Request('http://localhost/github/webhook', {
    method: 'POST',
    headers,
    body,
  });
}

describe('GitHub Webhook Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GITHUB_WEBHOOK_SECRET', 'test-webhook-secret');

    // Default mock returns for installation capture operations
    mockDbInsertReturning.mockResolvedValue([{ id: 'mock-installation-uuid' }]);
    mockDbLimit.mockResolvedValue([]);  // No existing installation members by default
    mockDbUpdateWhere.mockResolvedValue([]);

    // Default: mockDbWhere returns empty array (can be awaited AND has .limit())
    mockDbWhere.mockReturnValue(createWhereResult([]));
  });

  describe('Signature Verification', () => {
    it('should reject requests without signature', async () => {
      const req = createWebhookRequest(
        { zen: 'test' },
        { eventType: 'ping', deliveryId: 'test-123' },
      );

      const res = await app.request(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({ error: 'Missing signature' });
    });

    it('should reject requests with invalid signature', async () => {
      vi.mocked(verify).mockResolvedValue(false);

      const req = createWebhookRequest(
        { zen: 'test' },
        {
          signature: 'sha256=invalid',
          eventType: 'ping',
          deliveryId: 'test-123',
        },
      );

      const res = await app.request(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({ error: 'Invalid signature' });
    });

    it('should return 500 when webhook secret is not configured', async () => {
      vi.stubEnv('GITHUB_WEBHOOK_SECRET', '');

      const req = createWebhookRequest(
        { zen: 'test' },
        {
          signature: 'sha256=valid',
          eventType: 'ping',
          deliveryId: 'test-123',
        },
      );

      const res = await app.request(req);

      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data).toEqual({ error: 'Webhook not configured' });
    });

    it('should accept requests with valid signature', async () => {
      vi.mocked(verify).mockResolvedValue(true);

      const req = createWebhookRequest(
        { zen: 'Keep it simple' },
        {
          signature: 'sha256=valid',
          eventType: 'ping',
          deliveryId: 'test-123',
        },
      );

      const res = await app.request(req);

      expect(res.status).toBe(200);
      expect(verify).toHaveBeenCalledWith(
        'test-webhook-secret',
        '{"zen":"Keep it simple"}',
        'sha256=valid',
      );
    });
  });

  describe('Ping Event', () => {
    it('should respond with pong for ping events', async () => {
      vi.mocked(verify).mockResolvedValue(true);

      const req = createWebhookRequest(
        { zen: 'Responsive is better than fast', hook_id: 12345 },
        {
          signature: 'sha256=valid',
          eventType: 'ping',
          deliveryId: 'ping-123',
        },
      );

      const res = await app.request(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ message: 'pong' });
    });
  });

  describe('Pull Request Events', () => {
    const prPayload = {
      action: 'opened',
      number: 42,
      pull_request: {
        id: 123456,
        number: 42,
        title: 'Add new feature',
        state: 'open',
        head: { sha: 'abc123', ref: 'feature-branch' },
        base: { sha: 'def456', ref: 'main' },
      },
      repository: {
        id: 789,
        full_name: 'owner/repo',
      },
      installation: {
        id: 9999,
      },
    };

    it('should queue analysis for opened PR', async () => {
      vi.mocked(verify).mockResolvedValue(true);

      const req = createWebhookRequest(prPayload, {
        signature: 'sha256=valid',
        eventType: 'pull_request',
        deliveryId: 'pr-123',
      });

      const res = await app.request(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        message: 'PR #42 opened - analysis queued',
        queued: true,
      });
    });

    it('should queue analysis for synchronize (push) action', async () => {
      vi.mocked(verify).mockResolvedValue(true);

      const req = createWebhookRequest(
        { ...prPayload, action: 'synchronize' },
        {
          signature: 'sha256=valid',
          eventType: 'pull_request',
          deliveryId: 'pr-124',
        },
      );

      const res = await app.request(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        message: 'PR #42 synchronize - analysis queued',
        queued: true,
      });
    });

    it('should ignore other PR actions (closed, edited, etc.)', async () => {
      vi.mocked(verify).mockResolvedValue(true);

      const req = createWebhookRequest(
        { ...prPayload, action: 'closed' },
        {
          signature: 'sha256=valid',
          eventType: 'pull_request',
          deliveryId: 'pr-125',
        },
      );

      const res = await app.request(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        message: "PR action 'closed' ignored",
        queued: false,
      });
    });
  });

  describe('Installation Events', () => {
    const installationPayload = {
      action: 'created',
      installation: {
        id: 12345,
        account: {
          login: 'test-org',
          id: 67890,
        },
      },
      repositories: [
        { id: 1, full_name: 'test-org/repo1' },
        { id: 2, full_name: 'test-org/repo2' },
      ],
    };

    it('should trigger ingestion for repos found in database', async () => {
      vi.mocked(verify).mockResolvedValue(true);
      // Mock DB returning one matching repo (use createWhereResult for chainable mock)
      mockDbWhere.mockReturnValue(
        createWhereResult([
          { id: 'uuid-1', githubId: 1, fullName: 'test-org/repo1' },
        ]),
      );

      const req = createWebhookRequest(installationPayload, {
        signature: 'sha256=valid',
        eventType: 'installation',
        deliveryId: 'install-123',
      });

      const res = await app.request(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        message: 'Installation created and captured',
        installationId: 'mock-installation-uuid',
        autoLinked: false,
        triggered: 1,
        skipped: 1,
      });
      expect(tasks.trigger).toHaveBeenCalledWith('ingest-repo', {
        repoId: 'uuid-1',
      });
    });

    it('should skip repos not found in database', async () => {
      vi.mocked(verify).mockResolvedValue(true);
      // Mock DB returning no matching repos (use createWhereResult for chainable mock)
      mockDbWhere.mockReturnValue(createWhereResult([]));

      const req = createWebhookRequest(installationPayload, {
        signature: 'sha256=valid',
        eventType: 'installation',
        deliveryId: 'install-123',
      });

      const res = await app.request(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        message: 'Installation created and captured',
        installationId: 'mock-installation-uuid',
        autoLinked: false,
        triggered: 0,
        skipped: 2,
      });
      expect(tasks.trigger).not.toHaveBeenCalled();
    });

    it('should handle installation deleted event', async () => {
      vi.mocked(verify).mockResolvedValue(true);

      const req = createWebhookRequest(
        { ...installationPayload, action: 'deleted', repositories: undefined },
        {
          signature: 'sha256=valid',
          eventType: 'installation',
          deliveryId: 'install-124',
        },
      );

      const res = await app.request(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ message: 'Installation deleted processed' });
    });
  });

  describe('Installation Repositories Events', () => {
    const repoChangePayload = {
      action: 'added',
      installation: {
        id: 12345,
        account: {
          login: 'test-org',
          id: 67890,
        },
      },
      repositories_added: [{ id: 3, full_name: 'test-org/repo3' }],
      repositories_removed: [],
    };

    it('should trigger ingestion for added repos found in database', async () => {
      vi.mocked(verify).mockResolvedValue(true);
      // Mock DB returning matching repo (use createWhereResult for chainable mock)
      mockDbWhere.mockReturnValue(
        createWhereResult([
          { id: 'uuid-3', githubId: 3, fullName: 'test-org/repo3' },
        ]),
      );

      const req = createWebhookRequest(repoChangePayload, {
        signature: 'sha256=valid',
        eventType: 'installation_repositories',
        deliveryId: 'repos-123',
      });

      const res = await app.request(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        message: 'Repository added processed',
        cacheUpdated: true,
        triggered: 1,
        skipped: 0,
      });
      expect(tasks.trigger).toHaveBeenCalledWith('ingest-repo', {
        repoId: 'uuid-3',
      });
    });

    it('should skip added repos not found in database', async () => {
      vi.mocked(verify).mockResolvedValue(true);
      // Mock DB returning no matching repos (use createWhereResult for chainable mock)
      mockDbWhere.mockReturnValue(createWhereResult([]));

      const req = createWebhookRequest(repoChangePayload, {
        signature: 'sha256=valid',
        eventType: 'installation_repositories',
        deliveryId: 'repos-123',
      });

      const res = await app.request(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        message: 'Repository added processed',
        cacheUpdated: true,
        triggered: 0,
        skipped: 1,
      });
      expect(tasks.trigger).not.toHaveBeenCalled();
    });

    it('should handle repositories removed event', async () => {
      vi.mocked(verify).mockResolvedValue(true);

      const req = createWebhookRequest(
        {
          ...repoChangePayload,
          action: 'removed',
          repositories_added: [],
          repositories_removed: [{ id: 2, full_name: 'test-org/repo2' }],
        },
        {
          signature: 'sha256=valid',
          eventType: 'installation_repositories',
          deliveryId: 'repos-124',
        },
      );

      const res = await app.request(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        message: 'Repository removed processed',
        cacheUpdated: true,
      });
    });
  });

  describe('Unknown Events', () => {
    it('should acknowledge unknown event types gracefully', async () => {
      vi.mocked(verify).mockResolvedValue(true);

      const req = createWebhookRequest(
        { data: 'some data' },
        {
          signature: 'sha256=valid',
          eventType: 'push',
          deliveryId: 'push-123',
        },
      );

      const res = await app.request(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ message: "Event 'push' not handled" });
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid JSON payload', async () => {
      vi.mocked(verify).mockResolvedValue(true);

      const req = new Request('http://localhost/github/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hub-signature-256': 'sha256=valid',
          'x-github-event': 'ping',
          'x-github-delivery': 'test-123',
        },
        body: 'not-valid-json{',
      });

      const res = await app.request(req);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toEqual({ error: 'Invalid JSON payload' });
    });
  });
});
