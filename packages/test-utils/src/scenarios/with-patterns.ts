/**
 * With Patterns Scenario - Creates a user with sample patterns
 *
 * Use this scenario when you need to test pattern-related
 * features like listing, filtering, or validation.
 */

import { BaseScenario, type ScenarioContext, type ScenarioResult } from './base-scenario';
import { createUser, createPatterns, createRepo } from '../factories';
import { TEST_USER } from './with-test-user';

export class WithPatternsScenario extends BaseScenario {
  readonly name = 'with-patterns';
  readonly description = 'Test user with 5 sample patterns and a connected repo';

  async seed(ctx: ScenarioContext): Promise<ScenarioResult> {
    try {
      // Create user
      const user = createUser({
        id: TEST_USER.id,
        email: TEST_USER.email,
        githubId: TEST_USER.githubId,
        githubUsername: TEST_USER.githubUsername,
      });

      // Create repo
      const repo = createRepo({
        userId: user.id,
        status: 'ready',
      });

      // Create 5 patterns with varied tiers
      const patterns = createPatterns(5, { repoId: repo.id });

      // TODO: Insert into database when db client is available
      // await ctx.db.insert(users).values(user);
      // await ctx.db.insert(repos).values(repo);
      // await ctx.db.insert(patterns).values(patterns);

      return {
        success: true,
        createdIds: {
          users: [user.id],
          repos: [repo.id],
          patterns: patterns.map((p) => p.id),
        },
      };
    } catch (error) {
      return {
        success: false,
        createdIds: {},
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async cleanup(ctx: ScenarioContext, createdIds: ScenarioResult['createdIds']): Promise<void> {
    // TODO: Delete in reverse order of creation (patterns, repos, users)
    // if (createdIds.patterns) {
    //   await ctx.db.delete(patterns).where(inArray(patterns.id, createdIds.patterns));
    // }
    // if (createdIds.repos) {
    //   await ctx.db.delete(repos).where(inArray(repos.id, createdIds.repos));
    // }
    // if (createdIds.users) {
    //   await ctx.db.delete(users).where(inArray(users.id, createdIds.users));
    // }
  }

  async validate(ctx: ScenarioContext): Promise<boolean> {
    // TODO: Verify all resources exist
    // const patterns = await ctx.db.select().from(patterns).where(eq(patterns.repoId, repo.id));
    // return patterns.length === 5;
    return true;
  }
}
