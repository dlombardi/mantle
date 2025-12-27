/**
 * Installations Router - GitHub App installation management.
 *
 * Handles listing installations, discovering user memberships,
 * and aggregating repos across all linked installations.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq, and, inArray } from 'drizzle-orm';
import { router, protectedProcedure } from '../trpc';
import { getInstallationOctokit } from '../utils/github';
import {
  githubInstallations,
  installationMembers,
  repos,
} from '@mantle/db';
import type { CachedRepo } from '@mantle/db';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// Type for the database (context.db is typed as unknown)
type DrizzleDb = PostgresJsDatabase;

export const installationsRouter = router({
  /**
   * List all installations the user has access to.
   * Returns installations linked via installation_members.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = ctx.db as DrizzleDb;

    // Get all installations this user is linked to
    const memberships = await db
      .select({
        installationId: installationMembers.installationId,
        role: installationMembers.role,
        discoveredVia: installationMembers.discoveredVia,
        verifiedAt: installationMembers.verifiedAt,
      })
      .from(installationMembers)
      .where(eq(installationMembers.userId, ctx.user.id));

    if (memberships.length === 0) {
      return { installations: [] };
    }

    // Fetch the installation details
    const installationIds = memberships.map((m) => m.installationId);
    const installations = await db
      .select({
        id: githubInstallations.id,
        installationId: githubInstallations.installationId,
        accountId: githubInstallations.accountId,
        accountLogin: githubInstallations.accountLogin,
        accountType: githubInstallations.accountType,
        accountAvatarUrl: githubInstallations.accountAvatarUrl,
        isActive: githubInstallations.isActive,
        suspendedAt: githubInstallations.suspendedAt,
        repositoriesCache: githubInstallations.repositoriesCache,
        repositoriesCacheUpdatedAt: githubInstallations.repositoriesCacheUpdatedAt,
      })
      .from(githubInstallations)
      .where(
        and(
          inArray(githubInstallations.id, installationIds),
          eq(githubInstallations.isActive, true),
        ),
      );

    // Merge membership info with installation data
    const membershipMap = new Map(
      memberships.map((m) => [m.installationId, m]),
    );

    return {
      installations: installations.map((inst) => {
        const membership = membershipMap.get(inst.id);
        return {
          ...inst,
          role: membership?.role ?? 'member',
          discoveredVia: membership?.discoveredVia ?? 'unknown',
          verifiedAt: membership?.verifiedAt,
          repoCount: (inst.repositoriesCache as CachedRepo[]).length,
        };
      }),
    };
  }),

  /**
   * Discover and link installations for the authenticated user.
   * Called after OAuth - links personal installation automatically,
   * and can verify org membership via GitHub API.
   *
   * This is the key "reconciliation" step in Option C.
   */
  discoverInstallations: protectedProcedure.mutation(async ({ ctx }) => {
    const db = ctx.db as DrizzleDb;
    const userId = ctx.user.id;
    const githubId = ctx.user.githubId;

    if (!githubId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'User does not have a linked GitHub account',
      });
    }

    const linked: Array<{
      installationId: string;
      accountLogin: string;
      via: string;
    }> = [];

    // 1. Auto-link personal installations (accountId matches user's githubId)
    const personalInstallations = await db
      .select({
        id: githubInstallations.id,
        accountLogin: githubInstallations.accountLogin,
      })
      .from(githubInstallations)
      .where(
        and(
          eq(githubInstallations.accountId, githubId),
          eq(githubInstallations.accountType, 'User'),
          eq(githubInstallations.isActive, true),
        ),
      );

    for (const inst of personalInstallations) {
      // Check if already linked
      const existing = await db
        .select({ id: installationMembers.id })
        .from(installationMembers)
        .where(
          and(
            eq(installationMembers.installationId, inst.id),
            eq(installationMembers.userId, userId),
          ),
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(installationMembers).values({
          installationId: inst.id,
          userId,
          role: 'owner',
          discoveredVia: 'personal_match',
          verifiedAt: new Date(),
        });

        linked.push({
          installationId: inst.id,
          accountLogin: inst.accountLogin,
          via: 'personal_match',
        });
      }
    }

    // 2. Check org installations using GitHub API
    // For each org installation, verify user is a member
    const orgInstallations = await db
      .select({
        id: githubInstallations.id,
        installationId: githubInstallations.installationId,
        accountLogin: githubInstallations.accountLogin,
      })
      .from(githubInstallations)
      .where(
        and(
          eq(githubInstallations.accountType, 'Organization'),
          eq(githubInstallations.isActive, true),
        ),
      );

    for (const inst of orgInstallations) {
      // Skip if already linked
      const existing = await db
        .select({ id: installationMembers.id })
        .from(installationMembers)
        .where(
          and(
            eq(installationMembers.installationId, inst.id),
            eq(installationMembers.userId, userId),
          ),
        )
        .limit(1);

      if (existing.length > 0) continue;

      // Check membership via GitHub API
      try {
        const octokit = await getInstallationOctokit(inst.installationId);
        const username = ctx.user.githubUsername;

        if (!username) continue;

        // This returns 204 if member, 404 if not member
        await octokit.rest.orgs.checkMembershipForUser({
          org: inst.accountLogin,
          username,
        });

        // If we get here, user is a member
        await db.insert(installationMembers).values({
          installationId: inst.id,
          userId,
          role: 'member',
          discoveredVia: 'org_api_check',
          verifiedAt: new Date(),
        });

        linked.push({
          installationId: inst.id,
          accountLogin: inst.accountLogin,
          via: 'org_api_check',
        });
      } catch {
        // 404 = not a member, or other error - skip silently
        continue;
      }
    }

    return {
      discovered: linked.length,
      installations: linked,
    };
  }),

  /**
   * List all repos available across all user's installations.
   * Aggregates repos from cached installation data and marks which are connected.
   * This powers the multi-installation repo selector UI.
   */
  listAvailableRepos: protectedProcedure.query(async ({ ctx }) => {
    const db = ctx.db as DrizzleDb;

    // Get user's linked installations
    const memberships = await db
      .select({ installationId: installationMembers.installationId })
      .from(installationMembers)
      .where(eq(installationMembers.userId, ctx.user.id));

    if (memberships.length === 0) {
      return { repos: [], hasInstallations: false };
    }

    const installationIds = memberships.map((m) => m.installationId);

    // Fetch installations with their repo caches
    const installations = await db
      .select({
        id: githubInstallations.id,
        installationId: githubInstallations.installationId,
        accountLogin: githubInstallations.accountLogin,
        accountType: githubInstallations.accountType,
        accountAvatarUrl: githubInstallations.accountAvatarUrl,
        repositoriesCache: githubInstallations.repositoriesCache,
      })
      .from(githubInstallations)
      .where(
        and(
          inArray(githubInstallations.id, installationIds),
          eq(githubInstallations.isActive, true),
        ),
      );

    // Get already connected repos for this user
    const connectedRepos = await db
      .select({ githubId: repos.githubId })
      .from(repos)
      .where(eq(repos.userId, ctx.user.id));

    const connectedIds = new Set(
      connectedRepos.map((r) => Number(r.githubId)),
    );

    // Aggregate repos across all installations
    const allRepos: Array<{
      githubId: number;
      fullName: string;
      private: boolean;
      isConnected: boolean;
      installationId: number;
      installationUuid: string;
      installationAccount: string;
      installationType: string;
      installationAvatarUrl: string | null;
    }> = [];

    for (const inst of installations) {
      const cache = inst.repositoriesCache as CachedRepo[];
      for (const repo of cache) {
        allRepos.push({
          githubId: repo.id,
          fullName: repo.fullName,
          private: repo.private,
          isConnected: connectedIds.has(repo.id),
          installationId: inst.installationId,
          installationUuid: inst.id,
          installationAccount: inst.accountLogin,
          installationType: inst.accountType,
          installationAvatarUrl: inst.accountAvatarUrl,
        });
      }
    }

    // Sort by installation account, then repo name
    allRepos.sort((a, b) => {
      if (a.installationAccount !== b.installationAccount) {
        return a.installationAccount.localeCompare(b.installationAccount);
      }
      return a.fullName.localeCompare(b.fullName);
    });

    return {
      repos: allRepos,
      hasInstallations: true,
      installationCount: installations.length,
    };
  }),

  /**
   * Refresh the repo cache for an installation from GitHub API.
   * Call this if the cache seems stale or user wants fresh data.
   */
  refreshInstallationRepos: protectedProcedure
    .input(
      z.object({
        installationUuid: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db as DrizzleDb;
      const { installationUuid } = input;

      // Verify user has access to this installation
      const membership = await db
        .select({ id: installationMembers.id })
        .from(installationMembers)
        .where(
          and(
            eq(installationMembers.installationId, installationUuid),
            eq(installationMembers.userId, ctx.user.id),
          ),
        )
        .limit(1);

      if (membership.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this installation',
        });
      }

      // Get installation details
      const [installation] = await db
        .select({
          installationId: githubInstallations.installationId,
        })
        .from(githubInstallations)
        .where(eq(githubInstallations.id, installationUuid))
        .limit(1);

      if (!installation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Installation not found',
        });
      }

      // Fetch fresh repo list from GitHub
      try {
        const octokit = await getInstallationOctokit(installation.installationId);
        const { data } = await octokit.rest.apps.listReposAccessibleToInstallation({
          per_page: 100,
        });

        // Build new cache
        const newCache: CachedRepo[] = data.repositories.map((repo) => ({
          id: repo.id,
          fullName: repo.full_name,
          private: repo.private,
        }));

        // Update the installation
        await db
          .update(githubInstallations)
          .set({
            repositoriesCache: newCache,
            repositoriesCacheUpdatedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(githubInstallations.id, installationUuid));

        return {
          refreshed: true,
          repoCount: newCache.length,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to refresh installation repos from GitHub',
        });
      }
    }),
});
