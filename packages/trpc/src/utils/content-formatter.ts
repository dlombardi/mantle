/**
 * Content Formatter
 *
 * Prepares file contents for LLM context with consistent formatting.
 * Supports budget-aware chunking for large repositories.
 *
 * @see packages/trpc/src/utils/github-content.ts - FileContent input type
 * @see packages/trpc/src/utils/token-counter.ts - Token estimation
 */

import type { FileContent } from './github-content';
import { CHARS_PER_TOKEN, TOKEN_LIMIT } from './token-counter';

// ============================================
// TYPES
// ============================================

/**
 * A file formatted for LLM context.
 */
export interface FormattedFile {
  /** File path relative to repo root */
  path: string;
  /** Detected programming language */
  language: string | null;
  /** Raw file content */
  content: string;
  /** Formatted content ready for LLM (with headers and code fences) */
  formattedContent: string;
  /** Estimated tokens for this formatted content */
  tokenEstimate: number;
}

/**
 * Options for content formatting and chunking.
 */
export interface FormatOptions {
  /** Maximum tokens per chunk (default: TOKEN_LIMIT = 600k) */
  tokenBudget?: number;
}

/**
 * A chunk of files that fits within the token budget.
 */
export interface ContextChunk {
  /** Files included in this chunk */
  files: FormattedFile[];
  /** Combined formatted content for all files */
  formattedContent: string;
  /** Total estimated tokens for this chunk */
  totalTokens: number;
  /** Index of this chunk (0-based) */
  chunkIndex: number;
}

/**
 * Result of chunking files for LLM context.
 */
export interface ChunkingResult {
  /** Array of chunks, each fitting within budget */
  chunks: ContextChunk[];
  /** Number of files successfully included */
  totalFiles: number;
  /** Total tokens across all chunks */
  totalTokens: number;
  /** True if content required multiple chunks */
  exceedsBudget: boolean;
  /** Files that were skipped (individually too large) */
  skippedFiles: string[];
}

// ============================================
// SINGLE FILE FORMATTING
// ============================================

/**
 * Format a single file for LLM context.
 *
 * Creates a markdown block with:
 * - File path header
 * - Language metadata
 * - Code-fenced content
 *
 * @param content - File content from fetchFileContent()
 * @param language - Language identifier (from file-indexer)
 * @returns Formatted file with token estimate
 *
 * @example
 * ```typescript
 * const content = await fetchFileContent(octokit, owner, repo, 'src/index.ts');
 * const formatted = formatFileForContext(content, 'typescript');
 *
 * console.log(formatted.formattedContent);
 * // ## File: src/index.ts
 * // Language: typescript
 * //
 * // ```typescript
 * // ... content ...
 * // ```
 * ```
 */
export function formatFileForContext(
  content: FileContent,
  language: string | null,
): FormattedFile {
  const langTag = language ?? 'text';

  // Format with markdown headers and code fence
  const formatted = `## File: ${content.path}
Language: ${langTag}

\`\`\`${langTag}
${content.content}
\`\`\`
`;

  return {
    path: content.path,
    language,
    content: content.content,
    formattedContent: formatted,
    tokenEstimate: Math.ceil(formatted.length / CHARS_PER_TOKEN),
  };
}

// ============================================
// CHUNK CREATION HELPER
// ============================================

/**
 * Create a ContextChunk from an array of formatted files.
 */
function createChunk(files: FormattedFile[], chunkIndex: number): ContextChunk {
  const formattedContent = files
    .map((f) => f.formattedContent)
    .join('\n---\n\n');

  const totalTokens = files.reduce((sum, f) => sum + f.tokenEstimate, 0);

  return {
    files,
    formattedContent,
    totalTokens,
    chunkIndex,
  };
}

// ============================================
// CHUNKING FUNCTION
// ============================================

/**
 * Chunk files for LLM context, respecting token budget.
 *
 * Files are added to chunks until the budget is reached,
 * then a new chunk is started. Files that individually
 * exceed the budget are skipped.
 *
 * @param contents - File contents from fetchMultipleFiles()
 * @param languages - Map of file path to language (from IndexedFile[])
 * @param options - Chunking options (token budget)
 * @returns Chunking result with chunks and metadata
 *
 * @example
 * ```typescript
 * const contents = await fetchMultipleFiles(octokit, owner, repo, paths);
 * const languages = new Map(indexedFiles.map(f => [f.filePath, f.language]));
 *
 * const result = chunkFilesForContext(
 *   Array.from(contents.values()).filter(c => !(c instanceof Error)),
 *   languages,
 * );
 *
 * if (result.exceedsBudget) {
 *   // Handle multi-chunk extraction
 *   for (const chunk of result.chunks) {
 *     await extractPatterns(chunk.formattedContent);
 *   }
 * }
 * ```
 */
export function chunkFilesForContext(
  contents: FileContent[],
  languages: Map<string, string | null>,
  options: FormatOptions = {},
): ChunkingResult {
  const budget = options.tokenBudget ?? TOKEN_LIMIT;
  const chunks: ContextChunk[] = [];
  const skippedFiles: string[] = [];

  let currentChunkFiles: FormattedFile[] = [];
  let currentTokens = 0;
  let chunkIndex = 0;

  for (const content of contents) {
    const language = languages.get(content.path) ?? null;
    const formatted = formatFileForContext(content, language);

    // Skip files that alone exceed budget
    if (formatted.tokenEstimate > budget) {
      skippedFiles.push(content.path);
      continue;
    }

    // Start new chunk if current would exceed budget
    if (currentTokens + formatted.tokenEstimate > budget && currentChunkFiles.length > 0) {
      chunks.push(createChunk(currentChunkFiles, chunkIndex++));
      currentChunkFiles = [];
      currentTokens = 0;
    }

    currentChunkFiles.push(formatted);
    currentTokens += formatted.tokenEstimate;
  }

  // Don't forget the last chunk
  if (currentChunkFiles.length > 0) {
    chunks.push(createChunk(currentChunkFiles, chunkIndex));
  }

  const totalTokens = chunks.reduce((sum, c) => sum + c.totalTokens, 0);
  const totalFiles = contents.length - skippedFiles.length;

  return {
    chunks,
    totalFiles,
    totalTokens,
    exceedsBudget: chunks.length > 1,
    skippedFiles,
  };
}
