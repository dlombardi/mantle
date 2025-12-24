/**
 * With Test User Scenario - Creates a test user for authentication testing
 *
 * Use this scenario when you need a logged-in user context
 * but no additional data (repos, patterns, etc.)
 */

import { BaseScenario, type ScenarioContext, type ScenarioResult } from './base-scenario';

/** Well-known test user credentials - use a valid UUID format */
export const TEST_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@example.com',
  githubId: 12345,
  githubUsername: 'testuser',
};

export class WithTestUserScenario extends BaseScenario {
  readonly name = 'with-test-user';
  readonly description = 'Single test user with known credentials';

  async seed(_ctx: ScenarioContext): Promise<ScenarioResult> {
    try {
      // Return data to be inserted by the seed route
      return {
        success: true,
        data: {
          users: [
            {
              id: TEST_USER.id,
              githubId: TEST_USER.githubId,
              githubUsername: TEST_USER.githubUsername,
              email: TEST_USER.email,
            },
          ],
        },
        createdIds: {
          users: [TEST_USER.id],
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

  async cleanup(_ctx: ScenarioContext, _createdIds: ScenarioResult['createdIds']): Promise<void> {
    // Cleanup is handled by the seed route using createdIds
  }

  async validate(_ctx: ScenarioContext): Promise<boolean> {
    // Validation is handled by the seed route
    return true;
  }
}
