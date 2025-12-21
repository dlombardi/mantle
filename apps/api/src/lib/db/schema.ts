import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  bigint,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type {
  PatternConfidence,
  FilesystemPatternConfidence,
  PatternHealthSignals,
  PatternBacktestSummary,
  PatternEnforcement,
} from './types';
import {
  ingestionStatusEnum,
  extractionStatusEnum,
  patternTypeEnum,
  patternStatusEnum,
  confidenceModelEnum,
  violationSeverityEnum,
  violationResolutionEnum,
  analysisStatusEnum,
  provenanceTypeEnum,
  codeCategoryEnum,
  contextFileFormatEnum,
  contextFileSyncStatusEnum,
  patternEvolutionStatusEnum,
  evidenceSourceEnum,
} from './types';

// ============================================
// POSTGRES ENUMS
// ============================================

export const ingestionStatus = pgEnum('ingestion_status', ingestionStatusEnum);
export const extractionStatus = pgEnum(
  'extraction_status',
  extractionStatusEnum,
);
export const patternType = pgEnum('pattern_type', patternTypeEnum);
export const patternStatus = pgEnum('pattern_status', patternStatusEnum);
export const confidenceModel = pgEnum('confidence_model', confidenceModelEnum);
export const violationSeverity = pgEnum(
  'violation_severity',
  violationSeverityEnum,
);
export const violationResolution = pgEnum(
  'violation_resolution',
  violationResolutionEnum,
);
export const analysisStatus = pgEnum('analysis_status', analysisStatusEnum);
export const provenanceType = pgEnum('provenance_type', provenanceTypeEnum);
export const codeCategory = pgEnum('code_category', codeCategoryEnum);
export const contextFileFormat = pgEnum(
  'context_file_format',
  contextFileFormatEnum,
);
export const contextFileSyncStatus = pgEnum(
  'context_file_sync_status',
  contextFileSyncStatusEnum,
);
export const patternEvolutionStatus = pgEnum(
  'pattern_evolution_status',
  patternEvolutionStatusEnum,
);
export const evidenceSource = pgEnum('evidence_source', evidenceSourceEnum);

// ============================================
// TABLE 1: USERS
// ============================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Matches auth.users.id
  githubId: bigint('github_id', { mode: 'number' }).notNull().unique(),
  githubUsername: text('github_username').notNull(),
  email: text('email'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ============================================
// TABLE 2: REPOS
// ============================================

export const repos = pgTable(
  'repos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    githubId: bigint('github_id', { mode: 'number' }).notNull().unique(),
    githubFullName: text('github_full_name').notNull(),
    defaultBranch: text('default_branch').notNull().default('main'),
    private: boolean('private').notNull().default(false),

    // GitHub App installation (D15)
    installationId: bigint('installation_id', { mode: 'number' }).notNull(),

    // Ingestion state
    ingestionStatus: ingestionStatus('ingestion_status')
      .notNull()
      .default('pending'),
    lastIngestedAt: timestamp('last_ingested_at', { withTimezone: true }),
    lastIngestedCommitSha: text('last_ingested_commit_sha'),
    fileCount: integer('file_count'),
    tokenCount: integer('token_count'),

    // Extraction state
    extractionStatus: extractionStatus('extraction_status')
      .notNull()
      .default('pending'),
    lastExtractedAt: timestamp('last_extracted_at', { withTimezone: true }),
    patternCount: integer('pattern_count'),

    // Error tracking
    lastError: text('last_error'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('idx_repos_user').on(table.userId)],
);

// ============================================
// TABLE 3: REPO_FILES
// ============================================

export const repoFiles = pgTable(
  'repo_files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    repoId: uuid('repo_id')
      .notNull()
      .references(() => repos.id, { onDelete: 'cascade' }),
    filePath: text('file_path').notNull(),
    language: text('language'),
    sizeBytes: integer('size_bytes').notNull(),
    tokenEstimate: integer('token_estimate'),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_repo_files_unique').on(table.repoId, table.filePath),
    index('idx_repo_files_repo').on(table.repoId),
  ],
);

// ============================================
// TABLE 4: PATTERNS
// ============================================

export const patterns = pgTable(
  'patterns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    repoId: uuid('repo_id')
      .notNull()
      .references(() => repos.id, { onDelete: 'cascade' }),

    // Core identity
    name: text('name').notNull(),
    description: text('description').notNull(),
    type: patternType('type').notNull(),
    suggestedType: text('suggested_type'),

    // Lifecycle
    status: patternStatus('status').notNull().default('candidate'),
    statusChangedAt: timestamp('status_changed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    statusChangedBy: uuid('status_changed_by').references(() => users.id),

    // AI extraction metadata
    extractedAt: timestamp('extracted_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    extractedByModel: text('extracted_by_model').notNull(),
    extractionReasoning: text('extraction_reasoning'),

    // Duplicate detection (D29)
    similarToPatternId: uuid('similar_to_pattern_id'),

    // Confidence model discriminator (D34)
    confidenceModel: confidenceModel('confidence_model')
      .notNull()
      .default('code'),
    confidenceScore: jsonb('confidence_score').$type<
      PatternConfidence | FilesystemPatternConfidence
    >(),

    // Health signals (D11)
    healthSignals: jsonb('health_signals').$type<PatternHealthSignals>(),

    // Backtest results (D12)
    backtestSummary: jsonb('backtest_summary').$type<PatternBacktestSummary>(),

    // Human validation
    rationale: text('rationale'),
    validatedAt: timestamp('validated_at', { withTimezone: true }),
    validatedBy: uuid('validated_by').references(() => users.id),

    // Ownership (D22)
    ownerId: uuid('owner_id').references(() => users.id),

    // Enforcement (D30)
    defaultSeverity: violationSeverity('default_severity')
      .notNull()
      .default('warning'),
    enforcement: jsonb('enforcement')
      .$type<PatternEnforcement>()
      .notNull()
      .default({ prReview: true, aiContext: true }),

    // Deferral tracking
    deferCount: integer('defer_count').notNull().default(0),
    deferredAt: timestamp('deferred_at', { withTimezone: true }),

    // Rejection tracking (D18)
    rejectionReason: text('rejection_reason'),

    // Filesystem pattern fields
    globPattern: text('glob_pattern'),
    antiPatternExamples: text('anti_pattern_examples').array(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_patterns_repo_status').on(table.repoId, table.status),
    index('idx_patterns_owner').on(table.ownerId),
  ],
);

// ============================================
// TABLE 5: PATTERN_EVIDENCE
// ============================================

export const patternEvidence = pgTable(
  'pattern_evidence',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patternId: uuid('pattern_id')
      .notNull()
      .references(() => patterns.id, { onDelete: 'cascade' }),

    filePath: text('file_path').notNull(),
    startLine: integer('start_line'),
    endLine: integer('end_line'),

    snippet: text('snippet'), // Max 500 chars, enforced in application

    // Metadata
    isCanonical: boolean('is_canonical').notNull().default(false),
    addedAt: timestamp('added_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    addedBy: evidenceSource('added_by').notNull().default('extraction'),

    // Git metadata for confidence scoring
    authorUsername: text('author_username'),
    commitDate: timestamp('commit_date', { withTimezone: true }),
    commitSha: text('commit_sha'),

    // Code classification (D25)
    codeCategory: codeCategory('code_category'),

    // Staleness tracking (D21)
    capturedAtSha: text('captured_at_sha').notNull(),
    isStale: boolean('is_stale').notNull().default(false),
    staleReason: text('stale_reason'),
  },
  (table) => [index('idx_pattern_evidence_pattern').on(table.patternId)],
);

// ============================================
// TABLE 6: FILESYSTEM_PATTERN_EVIDENCE
// ============================================

export const filesystemPatternEvidence = pgTable(
  'filesystem_pattern_evidence',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patternId: uuid('pattern_id')
      .notNull()
      .references(() => patterns.id, { onDelete: 'cascade' }),

    filePath: text('file_path').notNull(),
    isDirectory: boolean('is_directory').notNull().default(false),

    addedAt: timestamp('added_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    addedBy: evidenceSource('added_by').notNull().default('extraction'),
  },
  (table) => [index('idx_filesystem_evidence_pattern').on(table.patternId)],
);

// ============================================
// TABLE 7: CONTEXT_FILE_CONFIGS
// ============================================

export const contextFileConfigs = pgTable(
  'context_file_configs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    repoId: uuid('repo_id')
      .notNull()
      .references(() => repos.id, { onDelete: 'cascade' }),

    format: contextFileFormat('format').notNull(),
    targetPath: text('target_path').notNull(),

    syncEnabled: boolean('sync_enabled').notNull().default(true),
    autoCommit: boolean('auto_commit').notNull().default(false),

    syncStatus: contextFileSyncStatus('sync_status').notNull().default('never'),
    lastGeneratedAt: timestamp('last_generated_at', { withTimezone: true }),
    lastGeneratedContentHash: text('last_generated_content_hash'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_context_file_configs_unique').on(
      table.repoId,
      table.format,
    ),
    index('idx_context_file_configs_repo').on(table.repoId),
  ],
);

// ============================================
// TABLE 8: PROVENANCE
// ============================================

export const provenance = pgTable(
  'provenance',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patternId: uuid('pattern_id')
      .notNull()
      .references(() => patterns.id, { onDelete: 'cascade' }),

    type: provenanceType('type').notNull(),
    url: text('url').notNull(),
    title: text('title'),
    description: text('description'),

    addedAt: timestamp('added_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    addedBy: uuid('added_by')
      .notNull()
      .references(() => users.id),
  },
  (table) => [index('idx_provenance_pattern').on(table.patternId)],
);

// ============================================
// TABLE 9: PULL_REQUESTS
// ============================================

export const pullRequests = pgTable(
  'pull_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    repoId: uuid('repo_id')
      .notNull()
      .references(() => repos.id, { onDelete: 'cascade' }),

    githubPrId: bigint('github_pr_id', { mode: 'number' }).notNull(),
    githubPrNumber: integer('github_pr_number').notNull(),
    title: text('title').notNull(),
    authorGithubUsername: text('author_github_username').notNull(),

    baseBranch: text('base_branch').notNull(),
    headBranch: text('head_branch').notNull(),
    headSha: text('head_sha').notNull(),

    // Diff storage (D28)
    diffStoragePath: text('diff_storage_path'),

    // Analysis state
    analysisStatus: analysisStatus('analysis_status')
      .notNull()
      .default('pending'),
    lastAnalyzedAt: timestamp('last_analyzed_at', { withTimezone: true }),
    lastError: text('last_error'),

    // Aggregates
    violationCount: integer('violation_count').notNull().default(0),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_pull_requests_unique').on(
      table.repoId,
      table.githubPrNumber,
    ),
    index('idx_pull_requests_repo').on(table.repoId),
  ],
);

// ============================================
// TABLE 10: VIOLATIONS
// ============================================

export const violations = pgTable(
  'violations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pullRequestId: uuid('pull_request_id')
      .notNull()
      .references(() => pullRequests.id, { onDelete: 'cascade' }),
    patternId: uuid('pattern_id')
      .notNull()
      .references(() => patterns.id, { onDelete: 'cascade' }),

    // Location
    filePath: text('file_path').notNull(),
    startLine: integer('start_line').notNull(),
    endLine: integer('end_line'),

    // Explanation
    description: text('description').notNull(),
    severity: violationSeverity('severity').notNull(),

    // Code context
    violatingSnippet: text('violating_snippet'),
    suggestedFix: text('suggested_fix'),

    // GitHub integration
    githubCommentId: bigint('github_comment_id', { mode: 'number' }),
    commentPostedAt: timestamp('comment_posted_at', { withTimezone: true }),

    // Resolution
    resolution: violationResolution('resolution').notNull().default('open'),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    resolvedBy: uuid('resolved_by').references(() => users.id),

    // Dismissal details (D26)
    dismissalReason: text('dismissal_reason'),
    isFalsePositive: boolean('is_false_positive').notNull().default(false),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('idx_violations_pr').on(table.pullRequestId)],
);

// ============================================
// TABLE 11: BACKTEST_VIOLATIONS
// ============================================

export const backtestViolations = pgTable(
  'backtest_violations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patternId: uuid('pattern_id')
      .notNull()
      .references(() => patterns.id, { onDelete: 'cascade' }),

    prNumber: integer('pr_number').notNull(),
    prTitle: text('pr_title').notNull(),
    prMergedAt: timestamp('pr_merged_at', { withTimezone: true }).notNull(),
    prAuthorUsername: text('pr_author_username').notNull(),
    prUrl: text('pr_url').notNull(),

    filePath: text('file_path').notNull(),
    startLine: integer('start_line').notNull(),
    endLine: integer('end_line'),

    summary: text('summary').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('idx_backtest_violations_pattern').on(table.patternId)],
);

// ============================================
// TABLE 12: PATTERN_EVOLUTION_REQUESTS
// ============================================

export const patternEvolutionRequests = pgTable(
  'pattern_evolution_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    patternId: uuid('pattern_id')
      .notNull()
      .references(() => patterns.id, { onDelete: 'cascade' }),
    pullRequestId: uuid('pull_request_id')
      .notNull()
      .references(() => pullRequests.id, { onDelete: 'cascade' }),
    evidenceId: uuid('evidence_id')
      .notNull()
      .references(() => patternEvidence.id, { onDelete: 'cascade' }),

    isCanonical: boolean('is_canonical').notNull().default(false),

    filePath: text('file_path').notNull(),
    diffSummary: text('diff_summary'),

    status: patternEvolutionStatus('status').notNull().default('pending'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    reviewedBy: uuid('reviewed_by').references(() => users.id),
    reviewNote: text('review_note'),

    closedAt: timestamp('closed_at', { withTimezone: true }),

    violationId: uuid('violation_id').references(() => violations.id),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_evolution_requests_pattern').on(table.patternId),
    index('idx_evolution_requests_pr').on(table.pullRequestId),
    index('idx_evolution_requests_status').on(table.status),
  ],
);

// ============================================
// RELATIONS (for Drizzle query builder)
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  repos: many(repos),
  ownedPatterns: many(patterns, { relationName: 'patternOwner' }),
}));

export const reposRelations = relations(repos, ({ one, many }) => ({
  user: one(users, { fields: [repos.userId], references: [users.id] }),
  files: many(repoFiles),
  patterns: many(patterns),
  pullRequests: many(pullRequests),
  contextFileConfigs: many(contextFileConfigs),
}));

export const patternsRelations = relations(patterns, ({ one, many }) => ({
  repo: one(repos, { fields: [patterns.repoId], references: [repos.id] }),
  owner: one(users, {
    fields: [patterns.ownerId],
    references: [users.id],
    relationName: 'patternOwner',
  }),
  evidence: many(patternEvidence),
  filesystemEvidence: many(filesystemPatternEvidence),
  provenance: many(provenance),
  backtestViolations: many(backtestViolations),
  evolutionRequests: many(patternEvolutionRequests),
}));

export const patternEvidenceRelations = relations(
  patternEvidence,
  ({ one }) => ({
    pattern: one(patterns, {
      fields: [patternEvidence.patternId],
      references: [patterns.id],
    }),
  }),
);

export const pullRequestsRelations = relations(
  pullRequests,
  ({ one, many }) => ({
    repo: one(repos, { fields: [pullRequests.repoId], references: [repos.id] }),
    violations: many(violations),
    evolutionRequests: many(patternEvolutionRequests),
  }),
);

export const violationsRelations = relations(violations, ({ one }) => ({
  pullRequest: one(pullRequests, {
    fields: [violations.pullRequestId],
    references: [pullRequests.id],
  }),
  pattern: one(patterns, {
    fields: [violations.patternId],
    references: [patterns.id],
  }),
}));
