/**
 * Seed Scenarios for QA Verification
 *
 * Scenarios define test data states that can be loaded into
 * preview deployments for automated QA verification.
 */

export { BaseScenario, type ScenarioContext } from './base-scenario';
export { EmptyRepoScenario } from './empty-repo';
export { WithTestUserScenario } from './with-test-user';
export { WithPatternsScenario } from './with-patterns';

import { BaseScenario } from './base-scenario';
import { EmptyRepoScenario } from './empty-repo';
import { WithTestUserScenario } from './with-test-user';
import { WithPatternsScenario } from './with-patterns';

/**
 * Registry of available scenarios by name
 */
export const scenarios: Record<string, new () => BaseScenario> = {
  'empty-repo': EmptyRepoScenario,
  'with-test-user': WithTestUserScenario,
  'with-patterns': WithPatternsScenario,
};

/**
 * Get a scenario by name
 */
export function getScenario(name: string): BaseScenario {
  const ScenarioClass = scenarios[name];
  if (!ScenarioClass) {
    throw new Error(`Unknown scenario: ${name}. Available: ${Object.keys(scenarios).join(', ')}`);
  }
  return new ScenarioClass();
}

/**
 * List all available scenario names
 */
export function listScenarios(): string[] {
  return Object.keys(scenarios);
}
