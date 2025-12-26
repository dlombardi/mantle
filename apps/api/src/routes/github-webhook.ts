/**
 * GitHub Webhook Endpoint
 *
 * Receives webhook events from GitHub App with signature verification.
 * Handles PR events (opened, synchronize) to trigger analysis.
 *
 * @see https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
 */

import { Hono } from 'hono';
import { verify } from '@octokit/webhooks-methods';

// ============================================
// TYPES
// ============================================

/**
 * Supported GitHub webhook event types.
 */
type WebhookEventType =
  | 'ping'
  | 'pull_request'
  | 'installation'
  | 'installation_repositories';

/**
 * Pull request webhook payload (subset of fields we use).
 */
interface PullRequestPayload {
  action: string;
  number: number;
  pull_request: {
    id: number;
    number: number;
    title: string;
    state: string;
    head: {
      sha: string;
      ref: string;
    };
    base: {
      sha: string;
      ref: string;
    };
  };
  repository: {
    id: number;
    full_name: string;
  };
  installation?: {
    id: number;
  };
}

/**
 * Installation webhook payload.
 */
interface InstallationPayload {
  action: string;
  installation: {
    id: number;
    account: {
      login: string;
      id: number;
    };
  };
  repositories?: Array<{
    id: number;
    full_name: string;
  }>;
}

// ============================================
// HELPERS
// ============================================

/**
 * Get webhook secret from environment.
 * Throws if not configured (required for security).
 */
function getWebhookSecret(): string {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('GITHUB_WEBHOOK_SECRET is not configured');
  }
  return secret;
}

/**
 * Log security event for monitoring/alerting.
 */
function logSecurityEvent(
  event: 'signature_invalid' | 'signature_missing' | 'secret_missing',
  details: Record<string, unknown>,
): void {
  console.error(`[SECURITY] Webhook ${event}:`, JSON.stringify(details));
}

// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Handle ping event (sent when webhook is first configured).
 */
function handlePing(payload: { zen?: string; hook_id?: number }): {
  message: string;
} {
  console.log(`GitHub webhook ping received: ${payload.zen}`);
  return { message: 'pong' };
}

/**
 * Handle pull_request events.
 * Triggers analysis for opened/synchronize actions.
 */
async function handlePullRequest(
  payload: PullRequestPayload,
): Promise<{ message: string; queued?: boolean }> {
  const { action, number, pull_request, repository } = payload;

  console.log(`PR event: ${action} #${number} on ${repository.full_name}`);

  // Only process opened and synchronize (new commits pushed)
  if (action !== 'opened' && action !== 'synchronize') {
    return { message: `PR action '${action}' ignored`, queued: false };
  }

  // TODO: Trigger PR analysis job
  // await tasks.trigger('analyze-pr', {
  //   installationId: installation?.id,
  //   repoFullName: repository.full_name,
  //   prNumber: number,
  //   headSha: pull_request.head.sha,
  //   baseSha: pull_request.base.sha,
  // });

  console.log(
    `Would queue analysis for PR #${number} (${pull_request.head.sha})`,
  );

  return {
    message: `PR #${number} ${action} - analysis queued`,
    queued: true,
  };
}

/**
 * Handle installation events.
 * Logs when app is installed/uninstalled.
 */
async function handleInstallation(
  payload: InstallationPayload,
): Promise<{ message: string }> {
  const { action, installation, repositories } = payload;

  console.log(
    `Installation ${action}: ${installation.account.login} (${installation.id})`,
  );

  if (action === 'created' && repositories) {
    console.log(
      `Repositories added: ${repositories.map((r) => r.full_name).join(', ')}`,
    );

    // TODO: Trigger ingestion for each repository
    // for (const repo of repositories) {
    //   await tasks.trigger('ingest-repo', { ... });
    // }
  }

  return { message: `Installation ${action} processed` };
}

/**
 * Handle installation_repositories events.
 * Triggered when repos are added/removed from installation.
 */
async function handleInstallationRepositories(
  payload: InstallationPayload & {
    repositories_added?: Array<{ id: number; full_name: string }>;
    repositories_removed?: Array<{ id: number; full_name: string }>;
  },
): Promise<{ message: string }> {
  const { action, installation, repositories_added, repositories_removed } =
    payload;

  console.log(`Installation repos ${action}: ${installation.account.login}`);

  if (repositories_added?.length) {
    console.log(
      `Repos added: ${repositories_added.map((r) => r.full_name).join(', ')}`,
    );
    // TODO: Trigger ingestion for added repos
  }

  if (repositories_removed?.length) {
    console.log(
      `Repos removed: ${repositories_removed.map((r) => r.full_name).join(', ')}`,
    );
    // TODO: Mark repos as disconnected
  }

  return { message: `Repository ${action} processed` };
}

// ============================================
// ROUTE DEFINITION
// ============================================

export const githubWebhookRoutes = new Hono();

/**
 * POST /api/github/webhook
 *
 * Main webhook endpoint. Verifies signature and dispatches to handlers.
 */
githubWebhookRoutes.post('/', async (c) => {
  // Get raw body for signature verification
  const rawBody = await c.req.text();

  // Get signature from headers
  const signature = c.req.header('x-hub-signature-256');
  const eventType = c.req.header('x-github-event') as
    | WebhookEventType
    | undefined;
  const deliveryId = c.req.header('x-github-delivery');

  // Validate signature is present
  if (!signature) {
    logSecurityEvent('signature_missing', {
      deliveryId,
      eventType,
      ip: c.req.header('x-forwarded-for') ?? 'unknown',
    });
    return c.json({ error: 'Missing signature' }, 401);
  }

  // Get webhook secret
  let secret: string;
  try {
    secret = getWebhookSecret();
  } catch (error) {
    logSecurityEvent('secret_missing', { deliveryId, eventType });
    console.error('Webhook secret not configured:', error);
    return c.json({ error: 'Webhook not configured' }, 500);
  }

  // Verify signature
  const isValid = await verify(secret, rawBody, signature);
  if (!isValid) {
    logSecurityEvent('signature_invalid', {
      deliveryId,
      eventType,
      ip: c.req.header('x-forwarded-for') ?? 'unknown',
      signaturePrefix: signature.substring(0, 20) + '...',
    });
    return c.json({ error: 'Invalid signature' }, 401);
  }

  // Parse payload
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  console.log(`Webhook received: ${eventType} (${deliveryId})`);

  // Dispatch to appropriate handler
  try {
    switch (eventType) {
      case 'ping':
        return c.json(
          handlePing(payload as { zen?: string; hook_id?: number }),
        );

      case 'pull_request':
        return c.json(await handlePullRequest(payload as PullRequestPayload));

      case 'installation':
        return c.json(await handleInstallation(payload as InstallationPayload));

      case 'installation_repositories':
        return c.json(
          await handleInstallationRepositories(
            payload as InstallationPayload & {
              repositories_added?: Array<{ id: number; full_name: string }>;
              repositories_removed?: Array<{ id: number; full_name: string }>;
            },
          ),
        );

      default:
        console.log(`Unhandled event type: ${eventType}`);
        return c.json({ message: `Event '${eventType}' not handled` });
    }
  } catch (error) {
    console.error(`Error handling ${eventType} webhook:`, error);
    return c.json({ error: 'Internal error processing webhook' }, 500);
  }
});
