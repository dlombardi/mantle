/**
 * Base Scenario - Abstract class for seed scenarios
 *
 * Extend this class to create new seed scenarios for QA verification.
 */

/**
 * Context passed to scenario methods
 */
export interface ScenarioContext {
  /** Database client (Drizzle or raw SQL) */
  db: unknown;
  /** Supabase admin client for auth operations */
  supabase: unknown;
}

/**
 * Result of running a scenario
 */
export interface ScenarioResult {
  success: boolean;
  /** IDs of created resources for cleanup */
  createdIds: {
    users?: string[];
    repos?: string[];
    patterns?: string[];
  };
  error?: string;
}

/**
 * Abstract base class for seed scenarios
 */
export abstract class BaseScenario {
  /** Unique name for this scenario */
  abstract readonly name: string;

  /** Human-readable description */
  abstract readonly description: string;

  /**
   * Seed the database with test data
   * @param ctx - Database and Supabase clients
   * @returns Result with created resource IDs
   */
  abstract seed(ctx: ScenarioContext): Promise<ScenarioResult>;

  /**
   * Clean up resources created by this scenario
   * @param ctx - Database and Supabase clients
   * @param createdIds - IDs returned from seed()
   */
  abstract cleanup(ctx: ScenarioContext, createdIds: ScenarioResult['createdIds']): Promise<void>;

  /**
   * Validate that the scenario was seeded correctly
   * @param ctx - Database and Supabase clients
   * @returns true if validation passes
   */
  async validate(ctx: ScenarioContext): Promise<boolean> {
    // Default: no validation
    return true;
  }
}
