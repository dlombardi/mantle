/**
 * Token Counter Utility
 *
 * Estimates token count for repository files to enforce extraction limits.
 * Uses a conservative 4 characters per token ratio.
 *
 * @see Decision D10 - 600k token limit (75% of 800k context window)
 */

import type { IndexedFile } from './file-indexer';

// ============================================
// CONSTANTS
// ============================================

/**
 * Maximum tokens allowed for extraction.
 * Set to 600k (75% of 800k limit) to provide safety buffer
 * for token estimation variance across languages.
 */
export const TOKEN_LIMIT = 600_000;

/**
 * Estimated characters per token.
 * 4 chars/token is conservative for code (provides safety margin).
 */
export const CHARS_PER_TOKEN = 4;

// ============================================
// TYPES
// ============================================

export interface TokenCountResult {
  /** Total bytes across all indexed files */
  totalBytes: number;
  /** Estimated token count using CHARS_PER_TOKEN ratio */
  estimatedTokens: number;
  /** Whether the token count exceeds TOKEN_LIMIT */
  exceedsLimit: boolean;
  /** The limit that was checked against */
  limit: number;
}

// ============================================
// FUNCTIONS
// ============================================

/**
 * Calculate estimated token count from indexed files.
 *
 * Formula: tokens = totalBytes / CHARS_PER_TOKEN
 *
 * @param files - Array of indexed files with sizeBytes
 * @returns Token count result with limit check
 *
 * @example
 * const files = [{ filePath: 'src/index.ts', language: 'typescript', sizeBytes: 1000 }];
 * const result = calculateTokenCount(files);
 * // { totalBytes: 1000, estimatedTokens: 250, exceedsLimit: false, limit: 600000 }
 */
export function calculateTokenCount(files: IndexedFile[]): TokenCountResult {
  const totalBytes = files.reduce((sum, file) => sum + file.sizeBytes, 0);
  const estimatedTokens = Math.ceil(totalBytes / CHARS_PER_TOKEN);

  return {
    totalBytes,
    estimatedTokens,
    exceedsLimit: estimatedTokens > TOKEN_LIMIT,
    limit: TOKEN_LIMIT,
  };
}

/**
 * Format token count for human-readable display.
 *
 * @param tokens - Number of tokens
 * @returns Formatted string (e.g., "50k", "1.5M")
 *
 * @example
 * formatTokenCount(500)       // "500"
 * formatTokenCount(50000)     // "50k"
 * formatTokenCount(1500000)   // "1.5M"
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    const millions = tokens / 1_000_000;
    // Use 1 decimal place if not a whole number
    return millions % 1 === 0
      ? `${millions}M`
      : `${millions.toFixed(1)}M`;
  }

  if (tokens >= 1_000) {
    const thousands = tokens / 1_000;
    // Round to nearest whole k for cleaner display
    return `${Math.round(thousands)}k`;
  }

  return tokens.toString();
}

/**
 * Create a human-readable error message for oversized repos.
 *
 * @param result - Token count result from calculateTokenCount
 * @returns Error message string
 *
 * @example
 * const result = { estimatedTokens: 750000, limit: 600000, exceedsLimit: true, totalBytes: 3000000 };
 * createOversizedMessage(result);
 * // "Repository too large: 750k tokens exceeds 600k limit"
 */
export function createOversizedMessage(result: TokenCountResult): string {
  const tokensStr = formatTokenCount(result.estimatedTokens);
  const limitStr = formatTokenCount(result.limit);
  return `Repository too large: ${tokensStr} tokens exceeds ${limitStr} limit`;
}
