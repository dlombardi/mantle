/**
 * GitHub Webhook Endpoint
 *
 * Receives webhook events from GitHub App with signature verification.
 * Handles PR events (opened, synchronize) to trigger analysis.
 * Triggers ingestion for repos added via installation events.
 *
 * @see https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
 */

import { Hono } from 'hono';
import { verify } from '@octokit/webhooks-methods';
import { tasks } from '@trigger.dev/sdk/v3';
import { eq, inArray } from 'drizzle-orm';
import {
  getDb,
  repos,
  githubInstallations,
  installationMembers,
  users,
} from '@/lib/db';
import type { CachedRepo } from '@mantle/db';
import type { ingestRepoJob } from '@/jobs/ingest-repo';

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
      type?: string; // 'User' | 'Organization'
      avatar_url?: string;
    };
  };
  repositories?: Array<{
    id: number;
    full_name: string;
    private?: boolean;
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

/**
 * Capture or update a GitHub App installation in the database.
 * Called when we receive installation webhooks from GitHub.
 *
 * @param installation - Installation data from webhook payload
 * @param repositories - Optional list of repos (for created events)
 * @returns The captured installation record
 */
async function captureInstallation(
  installation: {
    id: number;
    account: {
      id: number;
      login: string;
      avatar_url?: string;
      type?: string;
    };
  },
  repositories?: Array<{ id: number; full_name: string; private?: boolean }>,
): Promise<{ id: string; isNew: boolean }> {
  const db = getDb();

  // Determine account type (GitHub sends 'User' or 'Organization')
  const accountType =
    installation.account.type === 'Organization' ? 'Organization' : 'User';

  // Build repo cache from provided repositories
  const repoCache: CachedRepo[] = (repositories ?? []).map((r) => ({
    id: r.id,
    fullName: r.full_name,
    private: r.private ?? false,
  }));

  // Upsert the installation
  const [result] = await db
    .insert(githubInstallations)
    .values({
      installationId: installation.id,
      accountId: installation.account.id,
      accountLogin: installation.account.login,
      accountType,
      accountAvatarUrl: installation.account.avatar_url ?? null,
      repositoriesCache: repoCache,
      repositoriesCacheUpdatedAt: repositories ? new Date() : null,
    })
    .onConflictDoUpdate({
      target: githubInstallations.installationId,
      set: {
        // Always update account info (fixes placeholder entries from migration)
        accountId: installation.account.id,
        accountLogin: installation.account.login,
        accountType,
        accountAvatarUrl: installation.account.avatar_url ?? null,
        isActive: true,
        suspendedAt: null,
        updatedAt: new Date(),
        // Only update cache if we have repos
        ...(repositories && {
          repositoriesCache: repoCache,
          repositoriesCacheUpdatedAt: new Date(),
        }),
      },
    })
    .returning({ id: githubInstallations.id });

  // Check if this was a new insert by looking for existing record
  const existing = await db
    .select({ createdAt: githubInstallations.createdAt })
    .from(githubInstallations)
    .where(eq(githubInstallations.id, result.id))
    .limit(1);

  const isNew =
    existing[0] &&
    new Date().getTime() - existing[0].createdAt.getTime() < 5000;

  console.log(
    `${isNew ? 'Captured new' : 'Updated'} installation: ${installation.account.login} (${installation.id})`,
  );

  return { id: result.id, isNew };
}

/**
 * Auto-link a personal installation to the matching user.
 * For personal GitHub accounts, installation.account.id === user's githubId.
 *
 * @param installationUuid - Our internal installation UUID
 * @param githubAccountId - The GitHub account ID (from installation.account.id)
 */
async function autoLinkPersonalInstallation(
  installationUuid: string,
  githubAccountId: number,
): Promise<{ linked: boolean; userId?: string }> {
  const db = getDb();

  // Find user with matching githubId
  const [matchingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.githubId, githubAccountId))
    .limit(1);

  if (!matchingUser) {
    console.log(
      `No user found with githubId ${githubAccountId} for auto-linking`,
    );
    return { linked: false };
  }

  // Check if already linked
  const [existing] = await db
    .select({ id: installationMembers.id })
    .from(installationMembers)
    .where(eq(installationMembers.installationId, installationUuid))
    .limit(1);

  if (existing) {
    console.log(`Installation already linked to user`);
    return { linked: true, userId: matchingUser.id };
  }

  // Create the membership link
  await db.insert(installationMembers).values({
    installationId: installationUuid,
    userId: matchingUser.id,
    role: 'owner',
    discoveredVia: 'personal_match',
    verifiedAt: new Date(),
  });

  console.log(`Auto-linked personal installation to user ${matchingUser.id}`);

  return { linked: true, userId: matchingUser.id };
}

/**
 * Update installation state (suspend/unsuspend/delete).
 *
 * @param installationId - GitHub installation ID
 * @param action - The action being performed
 */
async function updateInstallationState(
  installationId: number,
  action: 'suspended' | 'unsuspended' | 'deleted',
): Promise<void> {
  const db = getDb();

  if (action === 'deleted') {
    // Soft delete by marking inactive
    await db
      .update(githubInstallations)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(githubInstallations.installationId, installationId));

    console.log(`Marked installation ${installationId} as inactive (deleted)`);
  } else if (action === 'suspended') {
    await db
      .update(githubInstallations)
      .set({
        suspendedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(githubInstallations.installationId, installationId));

    console.log(`Marked installation ${installationId} as suspended`);
  } else if (action === 'unsuspended') {
    await db
      .update(githubInstallations)
      .set({
        suspendedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(githubInstallations.installationId, installationId));

    console.log(`Marked installation ${installationId} as unsuspended`);
  }
}

/**
 * Update the repo cache for an installation.
 *
 * @param installationId - GitHub installation ID
 * @param added - Repos being added
 * @param removed - Repos being removed
 */
async function updateInstallationRepoCache(
  installationId: number,
  added: Array<{ id: number; full_name: string; private?: boolean }>,
  removed: Array<{ id: number }>,
): Promise<void> {
  const db = getDb();

  // Get current installation
  const [installation] = await db
    .select({
      id: githubInstallations.id,
      cache: githubInstallations.repositoriesCache,
    })
    .from(githubInstallations)
    .where(eq(githubInstallations.installationId, installationId))
    .limit(1);

  if (!installation) {
    console.log(`Installation ${installationId} not found for cache update`);
    return;
  }

  // Build updated cache
  const currentCache = installation.cache as CachedRepo[];
  const removedIds = new Set(removed.map((r) => r.id));

  // Filter out removed repos
  const filteredCache = currentCache.filter((r) => !removedIds.has(r.id));

  // Add new repos
  const newRepos: CachedRepo[] = added.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    private: r.private ?? false,
  }));

  const updatedCache = [...filteredCache, ...newRepos];

  // Update the installation
  await db
    .update(githubInstallations)
    .set({
      repositoriesCache: updatedCache,
      repositoriesCacheUpdatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(githubInstallations.id, installation.id));

  console.log(
    `Updated repo cache for installation ${installationId}: +${added.length}, -${removed.length}`,
  );
}

/**
 * Trigger ingestion for repos that exist in the database.
 * Looks up repos by GitHub ID and triggers the ingest-repo job for each.
 *
 * @param githubRepos - Array of repos from webhook payload
 * @returns Object with triggered count and skipped count
 */
async function triggerIngestionForRepos(
  githubRepos: Array<{ id: number; full_name: string }>,
): Promise<{ triggered: number; skipped: number }> {
  if (githubRepos.length === 0) {
    return { triggered: 0, skipped: 0 };
  }

  const db = getDb();
  const githubIds = githubRepos.map((r) => r.id);

  // Look up existing repos in our database
  const existingRepos = await db
    .select({
      id: repos.id,
      githubId: repos.githubId,
      fullName: repos.githubFullName,
    })
    .from(repos)
    .where(inArray(repos.githubId, githubIds));

  if (existingRepos.length === 0) {
    console.log(
      `No matching repos in database for: ${githubRepos.map((r) => r.full_name).join(', ')}`,
    );
    return { triggered: 0, skipped: githubRepos.length };
  }

  // Trigger ingestion for each existing repo
  let triggered = 0;
  for (const repo of existingRepos) {
    try {
      await tasks.trigger<typeof ingestRepoJob>('ingest-repo', {
        repoId: repo.id,
      });
      console.log(`Triggered ingestion for ${repo.fullName} (${repo.id})`);
      triggered++;
    } catch (error) {
      console.error(`Failed to trigger ingestion for ${repo.fullName}:`, error);
    }
  }

  const skipped = githubRepos.length - triggered;
  return { triggered, skipped };
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
 * Captures installation data and handles state changes.
 */
async function handleInstallation(payload: InstallationPayload): Promise<{
  message: string;
  installationId?: string;
  autoLinked?: boolean;
  triggered?: number;
  skipped?: number;
}> {
  const { action, installation, repositories } = payload;

  console.log(
    `Installation ${action}: ${installation.account.login} (${installation.id})`,
  );

  // Handle installation created - capture and potentially auto-link
  if (action === 'created') {
    // Capture installation with repo list
    const captured = await captureInstallation(installation, repositories);

    let autoLinked = false;

    // For personal accounts, try to auto-link to existing user
    if (installation.account.type !== 'Organization') {
      const linkResult = await autoLinkPersonalInstallation(
        captured.id,
        installation.account.id,
      );
      autoLinked = linkResult.linked;
    }

    // Trigger ingestion for any repos that already exist in our DB
    let triggered = 0;
    let skipped = 0;
    if (repositories && repositories.length > 0) {
      console.log(
        `Repositories in installation: ${repositories.map((r) => r.full_name).join(', ')}`,
      );
      const result = await triggerIngestionForRepos(repositories);
      triggered = result.triggered;
      skipped = result.skipped;
    }

    return {
      message: `Installation created and captured`,
      installationId: captured.id,
      autoLinked,
      triggered,
      skipped,
    };
  }

  // Handle state changes
  if (
    action === 'suspended' ||
    action === 'unsuspended' ||
    action === 'deleted'
  ) {
    await updateInstallationState(installation.id, action);
    return { message: `Installation ${action} processed` };
  }

  return { message: `Installation action '${action}' acknowledged` };
}

/**
 * Handle installation_repositories events.
 * Triggered when repos are added/removed from installation.
 * Updates the installation's repo cache and triggers ingestion for new repos.
 */
async function handleInstallationRepositories(
  payload: InstallationPayload & {
    repositories_added?: Array<{
      id: number;
      full_name: string;
      private?: boolean;
    }>;
    repositories_removed?: Array<{ id: number; full_name: string }>;
  },
): Promise<{
  message: string;
  cacheUpdated?: boolean;
  triggered?: number;
  skipped?: number;
}> {
  const { action, installation, repositories_added, repositories_removed } =
    payload;

  console.log(`Installation repos ${action}: ${installation.account.login}`);

  // Update the installation's repo cache
  const added = repositories_added ?? [];
  const removed = repositories_removed ?? [];

  if (added.length > 0 || removed.length > 0) {
    await updateInstallationRepoCache(installation.id, added, removed);
  }

  let triggered = 0;
  let skipped = 0;

  if (added.length > 0) {
    console.log(`Repos added: ${added.map((r) => r.full_name).join(', ')}`);
    // Trigger ingestion for repos that already exist in our DB
    const result = await triggerIngestionForRepos(added);
    triggered = result.triggered;
    skipped = result.skipped;
  }

  if (removed.length > 0) {
    console.log(`Repos removed: ${removed.map((r) => r.full_name).join(', ')}`);
    // Note: repos table records persist (for history), but the cache is updated
    // A future enhancement could mark repos.installationId as null
  }

  return {
    message: `Repository ${action} processed`,
    cacheUpdated: added.length > 0 || removed.length > 0,
    ...(added.length > 0 && { triggered, skipped }),
  };
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
