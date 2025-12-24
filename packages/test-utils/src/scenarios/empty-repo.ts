/**
 * Empty Repo Scenario - Clean state with no data
 *
 * Use this scenario when you need a fresh database state
 * with no user data, repos, or patterns.
 */

import { BaseScenario, type ScenarioContext, type ScenarioResult } from './base-scenario';

export class EmptyRepoScenario extends BaseScenario {
  readonly name = 'empty-repo';
  readonly description = 'Clean database state with no test data';

  async seed(_ctx: ScenarioContext): Promise<ScenarioResult> {
    // This scenario intentionally creates nothing
    // It's used to reset to a clean state
    return {
      success: true,
      createdIds: {},
    };
  }

  async cleanup(_ctx: ScenarioContext, _createdIds: ScenarioResult['createdIds']): Promise<void> {
    // Nothing to clean up
  }

  async validate(_ctx: ScenarioContext): Promise<boolean> {
    // Validation: database should have no user-created data
    // For now, always return true
    return true;
  }
}
