/**
 * Pattern test data factory.
 *
 * Generates realistic pattern data for tests.
 */

import { faker } from '@faker-js/faker';

export type PatternType = 'code' | 'structure' | 'naming' | 'testing';
export type PatternTier = 'candidate' | 'authoritative' | 'rejected';

export interface Pattern {
  id: string;
  repoId: string;
  name: string;
  description: string;
  type: PatternType;
  tier: PatternTier;
  confidence: number;
  evidenceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatternOptions {
  id?: string;
  repoId?: string;
  name?: string;
  description?: string;
  type?: PatternType;
  tier?: PatternTier;
  confidence?: number;
  evidenceCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

const PATTERN_TYPES: PatternType[] = ['code', 'structure', 'naming', 'testing'];
const PATTERN_TIERS: PatternTier[] = ['candidate', 'authoritative', 'rejected'];

const PATTERN_NAMES = [
  'Use async/await over callbacks',
  'Prefer composition over inheritance',
  'Early return pattern',
  'Error boundary wrapping',
  'Co-locate tests with source',
  'Use typed responses',
  'Validate at boundaries',
  'Single responsibility components',
];

/**
 * Create a test pattern with realistic fake data.
 *
 * @example
 * ```ts
 * const pattern = createPattern(); // Random pattern
 * const authoritativePattern = createPattern({ tier: 'authoritative' });
 * ```
 */
export function createPattern(overrides: CreatePatternOptions = {}): Pattern {
  const now = new Date().toISOString();

  return {
    id: faker.string.uuid(),
    repoId: faker.string.uuid(),
    name: faker.helpers.arrayElement(PATTERN_NAMES),
    description: faker.lorem.sentence(),
    type: faker.helpers.arrayElement(PATTERN_TYPES),
    tier: faker.helpers.arrayElement(PATTERN_TIERS),
    confidence: faker.number.float({ min: 0.5, max: 1.0, fractionDigits: 2 }),
    evidenceCount: faker.number.int({ min: 1, max: 50 }),
    createdAt: faker.date.past().toISOString(),
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create multiple test patterns.
 */
export function createPatterns(count: number, overrides: CreatePatternOptions = {}): Pattern[] {
  return Array.from({ length: count }, () => createPattern(overrides));
}
