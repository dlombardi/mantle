/**
 * With Test User Scenario - Creates a test user for authentication testing
 *
 * Use this scenario when you need a logged-in user context
 * but no additional data (repos, patterns, etc.)
 */

import { BaseScenario, type ScenarioContext, type ScenarioResult } from './base-scenario';
import { createUser } from '../factories';

/** Well-known test user credentials */
export const TEST_USER = {
  id: 'test-user-123',
  email: 'test@example.com',
  githubId: 12345,
  githubUsername: 'testuser',
};

export class WithTestUserScenario extends BaseScenario {
  readonly name = 'with-test-user';
  readonly description = 'Single test user with known credentials';

  async seed(ctx: ScenarioContext): Promise<ScenarioResult> {
    try {
      // Create user in database
      const user = createUser({
        id: TEST_USER.id,
        email: TEST_USER.email,
        githubId: TEST_USER.githubId,
        githubUsername: TEST_USER.githubUsername,
      });

      // TODO: Insert user into database when db client is available
      // await ctx.db.insert(users).values(user);

      return {
        success: true,
        createdIds: {
          users: [user.id],
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
    // TODO: Delete user when db client is available
    // if (createdIds.users) {
    //   await ctx.db.delete(users).where(inArray(users.id, createdIds.users));
    // }
  }

  async validate(ctx: ScenarioContext): Promise<boolean> {
    // TODO: Verify user exists in database
    // const user = await ctx.db.select().from(users).where(eq(users.id, TEST_USER.id));
    // return user.length === 1;
    return true;
  }
}
