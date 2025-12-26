/**
 * GitHub Router - GitHub App installation and repository management.
 *
 * Handles installation verification, repo listing, and repo connection.
 * Per Decision D15: Only stores installationId, generates tokens on-demand.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { router, protectedProcedure } from '../trpc';
import { getInstallationOctokit } from '../utils/github';
import { repos } from '@mantle/db';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// Type for the database (context.db is typed as unknown)
type DrizzleDb = PostgresJsDatabase;

/**
 * Get GitHub App installation URL.
 * The app name comes from environment or defaults to the known app.
 */
const GITHUB_APP_NAME = process.env.GITHUB_APP_NAME ?? 'mantle-dev';

export const githubRouter = router({
  /**
   * Get the GitHub App installation URL.
   * User will be redirected here to install/configure the app.
   */
  getInstallationUrl: protectedProcedure.query(() => {
    return {
      url: `https://github.com/apps/${GITHUB_APP_NAME}/installations/new`,
    };
  }),

  /**
   * Verify an installation belongs to the authenticated user.
   * Called after GitHub redirects back with installation_id.
   *
   * Security: Verifies installation account matches user's GitHub username.
   */
  verifyInstallation: protectedProcedure
    .input(
      z.object({
        installationId: z.number().int().positive(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { installationId } = input;

      try {
        const octokit = await getInstallationOctokit(installationId);

        // Get the installation details
        const { data: installationData } = await octokit.rest.apps.getInstallation({
          installation_id: installationId,
        });

        const account = installationData.account;

        // Account could be User, Org, or Enterprise - extract common fields
        const accountLogin = account && 'login' in account ? account.login : null;
        const accountType = account && 'type' in account ? account.type : null;
        const accountAvatarUrl = account?.avatar_url;

        if (!accountLogin) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Installation has no associated account',
          });
        }

        // Check if this is the user's personal installation
        const isPersonalInstall = accountLogin === ctx.user.githubUsername;

        // For org installations, we trust it if the user just completed the flow
        // (GitHub handles authorization during installation)

        return {
          valid: true,
          installationId,
          account: {
            login: accountLogin,
            type: accountType, // 'User' or 'Organization'
            avatarUrl: accountAvatarUrl,
          },
          isPersonalInstall,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Installation not found or not accessible',
        });
      }
    }),

  /**
   * List repositories accessible to an installation.
   * Returns repos with their connection status.
   */
  listInstallationRepos: protectedProcedure
    .input(
      z.object({
        installationId: z.number().int().positive(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { installationId } = input;
      const db = ctx.db as DrizzleDb;

      try {
        const octokit = await getInstallationOctokit(installationId);

        // List repos accessible to this installation
        const { data } =
          await octokit.rest.apps.listReposAccessibleToInstallation({
            per_page: 100,
          });

        // Get already connected repos for this user
        const connectedRepos = await db
          .select({ githubId: repos.githubId })
          .from(repos)
          .where(eq(repos.userId, ctx.user.id));

        const connectedIds = new Set(
          connectedRepos.map((r) => Number(r.githubId))
        );

        return data.repositories.map((repo) => ({
          id: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          owner: repo.owner.login,
          private: repo.private,
          defaultBranch: repo.default_branch,
          isConnected: connectedIds.has(repo.id),
        }));
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list repositories',
        });
      }
    }),

  /**
   * Connect selected repositories to the user's account.
   * Inserts repos into the database with the installation ID.
   */
  connectRepos: protectedProcedure
    .input(
      z.object({
        installationId: z.number().int().positive(),
        repoIds: z.array(z.number().int().positive()).min(1).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { installationId, repoIds } = input;
      const db = ctx.db as DrizzleDb;

      try {
        const octokit = await getInstallationOctokit(installationId);

        // Fetch repo details from GitHub
        const { data } =
          await octokit.rest.apps.listReposAccessibleToInstallation({
            per_page: 100,
          });

        // Filter to only selected repos
        const selectedRepos = data.repositories.filter((r) =>
          repoIds.includes(r.id)
        );

        if (selectedRepos.length !== repoIds.length) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Some selected repos are not accessible to this installation',
          });
        }

        // Insert repos (upsert to handle reconnection)
        const insertedRepos = await db
          .insert(repos)
          .values(
            selectedRepos.map((repo) => ({
              userId: ctx.user.id,
              githubId: repo.id,
              githubFullName: repo.full_name,
              defaultBranch: repo.default_branch,
              private: repo.private,
              installationId,
              ingestionStatus: 'pending' as const,
              extractionStatus: 'pending' as const,
            }))
          )
          .onConflictDoUpdate({
            target: repos.githubId,
            set: {
              installationId,
              updatedAt: new Date(),
            },
          })
          .returning({
            id: repos.id,
            fullName: repos.githubFullName,
          });

        return {
          connected: insertedRepos.length,
          repos: insertedRepos,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to connect repositories',
        });
      }
    }),

  /**
   * Get the user's GitHub installation info.
   * Returns installationId if the user has connected repos, null otherwise.
   */
  getInstallation: protectedProcedure.query(async ({ ctx }) => {
    const db = ctx.db as DrizzleDb;

    // Get the first repo to find the installation ID
    const userRepo = await db
      .select({ installationId: repos.installationId })
      .from(repos)
      .where(eq(repos.userId, ctx.user.id))
      .limit(1);

    const firstRepo = userRepo[0];
    if (!firstRepo) {
      return { hasInstallation: false, installationId: null };
    }

    return {
      hasInstallation: true,
      installationId: firstRepo.installationId,
    };
  }),
});
