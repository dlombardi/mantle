/**
 * With Patterns Scenario - Creates a user with sample patterns
 *
 * Use this scenario when you need to test pattern-related
 * features like listing, filtering, or validation.
 */

import type { PatternType } from '@mantle/db';
import { BaseScenario, type ScenarioContext, type ScenarioResult, type SeedData } from './base-scenario';
import { TEST_USER } from './with-test-user';

/** Well-known test repo ID */
const TEST_REPO = {
  id: '00000000-0000-0000-0000-000000000002',
  githubId: 98765,
  githubFullName: 'testuser/test-repo',
  installationId: 11111,
};

/** Pattern types for variety - using actual schema enum values */
const PATTERN_TYPES: PatternType[] = [
  'naming',
  'structural',
  'api',
  'testing',
  'behavioral',
];

export class WithPatternsScenario extends BaseScenario {
  readonly name = 'with-patterns';
  readonly description = 'Test user with 5 sample patterns and a connected repo';

  async seed(_ctx: ScenarioContext): Promise<ScenarioResult> {
    try {
      // Generate 5 patterns with varied types
      const patternIds: string[] = [];
      const patterns: SeedData['patterns'] = [];

      for (let i = 0; i < 5; i++) {
        const id = `00000000-0000-0000-0000-00000000010${i + 1}`;
        patternIds.push(id);
        patterns.push({
          id,
          repoId: TEST_REPO.id,
          name: `Test Pattern ${i + 1}`,
          description: `Description for test pattern ${i + 1}`,
          type: PATTERN_TYPES[i],
          extractedByModel: 'claude-sonnet-4-5-20250929',
          status: i < 2 ? 'authoritative' : 'candidate',
        });
      }

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
          repos: [
            {
              id: TEST_REPO.id,
              userId: TEST_USER.id,
              githubId: TEST_REPO.githubId,
              githubFullName: TEST_REPO.githubFullName,
              installationId: TEST_REPO.installationId,
            },
          ],
          patterns,
        },
        createdIds: {
          users: [TEST_USER.id],
          repos: [TEST_REPO.id],
          patterns: patternIds,
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
