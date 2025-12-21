// ============================================
// ENUM TYPES (matching Postgres enums)
// ============================================

export const ingestionStatusEnum = [
  'pending',
  'ingesting',
  'ingested',
  'failed',
] as const;
export type IngestionStatus = (typeof ingestionStatusEnum)[number];

export const extractionStatusEnum = [
  'pending',
  'extracting',
  'extracted',
  'failed',
] as const;
export type ExtractionStatus = (typeof extractionStatusEnum)[number];

export const patternTypeEnum = [
  'structural',
  'behavioral',
  'api',
  'testing',
  'naming',
  'dependency',
  'file-naming',
  'file-structure',
  'other',
] as const;
export type PatternType = (typeof patternTypeEnum)[number];

export const patternStatusEnum = [
  'candidate',
  'authoritative',
  'rejected',
  'deprecated',
  'deferred',
] as const;
export type PatternStatus = (typeof patternStatusEnum)[number];

export const confidenceModelEnum = ['code', 'filesystem'] as const;
export type ConfidenceModel = (typeof confidenceModelEnum)[number];

export const confidenceTierEnum = [
  'strong',
  'emerging',
  'moderate',
  'weak',
  'legacy',
] as const;
export type ConfidenceTier = (typeof confidenceTierEnum)[number];

export const violationSeverityEnum = ['error', 'warning', 'info'] as const;
export type ViolationSeverity = (typeof violationSeverityEnum)[number];

export const violationResolutionEnum = ['open', 'fixed', 'dismissed'] as const;
export type ViolationResolution = (typeof violationResolutionEnum)[number];

export const analysisStatusEnum = [
  'pending',
  'analyzing',
  'analyzed',
  'failed',
  'skipped',
] as const;
export type AnalysisStatus = (typeof analysisStatusEnum)[number];

export const provenanceTypeEnum = [
  'pull_request',
  'commit',
  'issue',
  'document',
  'slack',
  'adr',
  'other',
] as const;
export type ProvenanceType = (typeof provenanceTypeEnum)[number];

export const codeCategoryEnum = [
  'core',
  'feature',
  'frontend',
  'backend',
  'test',
  'config',
  'helper',
] as const;
export type CodeCategory = (typeof codeCategoryEnum)[number];

export const contextFileFormatEnum = ['claude', 'cursor'] as const;
export type ContextFileFormat = (typeof contextFileFormatEnum)[number];

export const contextFileSyncStatusEnum = [
  'never',
  'synced',
  'pending',
] as const;
export type ContextFileSyncStatus = (typeof contextFileSyncStatusEnum)[number];

export const patternEvolutionStatusEnum = [
  'pending',
  'accepted',
  'rejected',
  'historical',
  'cancelled',
] as const;
export type PatternEvolutionStatus =
  (typeof patternEvolutionStatusEnum)[number];

export const evidenceSourceEnum = ['extraction', 'human'] as const;
export type EvidenceSource = (typeof evidenceSourceEnum)[number];

// ============================================
// JSONB TYPES (stored as JSON in Postgres)
// ============================================

/**
 * 4-dimensional confidence scoring for code patterns (D11)
 */
export interface PatternConfidence {
  tier: ConfidenceTier;

  /** Dimension 1: Evidence quality */
  evidence: {
    instanceCount: number;
    consistency: 'high' | 'medium' | 'low';
    consistencyNote: string | null;
  };

  /** Dimension 2: Adoption breadth */
  adoption: {
    uniqueAuthors: number;
    authorUsernames: string[];
  };

  /** Dimension 3: Establishment over time */
  establishment: {
    oldestInstanceDate: string; // ISO date
    newestInstanceDate: string;
    ageCategory: 'established' | 'maturing' | 'emerging';
  };

  /** Dimension 4: Code location classification */
  location: {
    breakdown: Record<CodeCategory, number>;
    primary: CodeCategory;
  };

  insight: string;
  suggestedActions: string[];
}

/**
 * 2-dimensional confidence scoring for filesystem patterns (D34)
 */
export interface FilesystemPatternConfidence {
  tier: Exclude<ConfidenceTier, 'legacy'>;
  evidence: number; // Path count
  adoption: number; // Percentage
}

/**
 * Health signals for pattern quality (D11)
 */
export interface PatternHealthSignals {
  hasWarnings: boolean;
  signals: HealthSignal[];
}

export interface HealthSignal {
  category:
    | 'error-handling'
    | 'deprecated-api'
    | 'consistency'
    | 'security'
    | 'completeness';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  affectedInstances: number;
  totalInstances: number;
}

/**
 * Backtest summary stored on Pattern (D12)
 */
export interface PatternBacktestSummary {
  violationCount: number;
  prCount: number;
  windowDays: number;
  computedAt: string; // ISO date
}

/**
 * Enforcement settings for a pattern (D30)
 */
export interface PatternEnforcement {
  prReview: boolean;
  aiContext: boolean;
}

// ============================================
// CONFIDENCE TIER THRESHOLDS
// ============================================

export const CONFIDENCE_THRESHOLDS = {
  strong: {
    minInstances: 5,
    minAuthors: 3,
    requiredAge: 'established' as const,
    requiredConsistency: ['high', 'medium'] as const,
  },
  emerging: {
    minInstances: 3,
    maxAgeCategory: 'emerging' as const,
  },
} as const;

export const FILESYSTEM_TIER_THRESHOLDS = {
  strong: {
    minEvidence: 10,
    minAdoption: 80,
  },
  emerging: {
    minEvidence: 5,
    minAdoption: 60,
  },
  weak: {
    maxEvidence: 3,
    maxAdoption: 40,
  },
} as const;
