/**
 * @mantle/db - Shared database schema and types
 *
 * This package contains the Drizzle ORM schema definitions and
 * inferred TypeScript types used across the monorepo.
 */

// Re-export everything from types and schema
export * from './types';
export * from './schema';

// ============================================
// INFERRED INSERT/SELECT TYPES
// ============================================

import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type {
  users,
  repos,
  repoFiles,
  patterns,
  patternEvidence,
  filesystemPatternEvidence,
  contextFileConfigs,
  provenance,
  pullRequests,
  violations,
  backtestViolations,
  patternEvolutionRequests,
  githubInstallations,
  installationMembers,
} from './schema';

// User types
export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

// Repo types
export type Repo = InferSelectModel<typeof repos>;
export type InsertRepo = InferInsertModel<typeof repos>;

// RepoFile types
export type RepoFile = InferSelectModel<typeof repoFiles>;
export type InsertRepoFile = InferInsertModel<typeof repoFiles>;

// Pattern types
export type Pattern = InferSelectModel<typeof patterns>;
export type InsertPattern = InferInsertModel<typeof patterns>;

// PatternEvidence types
export type PatternEvidence = InferSelectModel<typeof patternEvidence>;
export type InsertPatternEvidence = InferInsertModel<typeof patternEvidence>;

// FilesystemPatternEvidence types
export type FilesystemPatternEvidence = InferSelectModel<typeof filesystemPatternEvidence>;
export type InsertFilesystemPatternEvidence = InferInsertModel<typeof filesystemPatternEvidence>;

// ContextFileConfig types
export type ContextFileConfig = InferSelectModel<typeof contextFileConfigs>;
export type InsertContextFileConfig = InferInsertModel<typeof contextFileConfigs>;

// Provenance types
export type Provenance = InferSelectModel<typeof provenance>;
export type InsertProvenance = InferInsertModel<typeof provenance>;

// PullRequest types
export type PullRequest = InferSelectModel<typeof pullRequests>;
export type InsertPullRequest = InferInsertModel<typeof pullRequests>;

// Violation types
export type Violation = InferSelectModel<typeof violations>;
export type InsertViolation = InferInsertModel<typeof violations>;

// BacktestViolation types
export type BacktestViolation = InferSelectModel<typeof backtestViolations>;
export type InsertBacktestViolation = InferInsertModel<typeof backtestViolations>;

// PatternEvolutionRequest types
export type PatternEvolutionRequest = InferSelectModel<typeof patternEvolutionRequests>;
export type InsertPatternEvolutionRequest = InferInsertModel<typeof patternEvolutionRequests>;

// GithubInstallation types
export type GithubInstallation = InferSelectModel<typeof githubInstallations>;
export type InsertGithubInstallation = InferInsertModel<typeof githubInstallations>;

// InstallationMember types
export type InstallationMember = InferSelectModel<typeof installationMembers>;
export type InsertInstallationMember = InferInsertModel<typeof installationMembers>;

// ============================================
// SEED DATA TYPE (for test-utils scenarios)
// ============================================

/**
 * Type-safe seed data structure for scenarios.
 * Uses Drizzle's inferred insert types to ensure compatibility.
 */
export interface SeedData {
  users?: InsertUser[];
  repos?: InsertRepo[];
  patterns?: InsertPattern[];
}
