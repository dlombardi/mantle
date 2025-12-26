/**
 * File Tree Indexer
 *
 * Transforms raw GitHub file tree data into indexed file records with:
 * - Language detection from file extensions
 * - Filtering of binary files and irrelevant paths
 * - Metadata enrichment for database storage
 *
 * @see packages/db/src/schema.ts - repoFiles table
 * @see packages/trpc/src/utils/github-content.ts - RepoFile input type
 */

import type { RepoFile } from './github-content';

// ============================================
// TYPES
// ============================================

export interface IndexerOptions {
  /** Additional path patterns to exclude (applied as substring match) */
  excludePatterns?: string[];
  /** Additional extensions to treat as binary (without leading dot) */
  binaryExtensions?: string[];
  /** Include hidden files/directories starting with . (default: true for .env, .gitignore) */
  includeHidden?: boolean;
  /** Maximum file size in bytes to include (default: 1MB) */
  maxFileSize?: number;
}

export interface IndexedFile {
  /** File path relative to repo root */
  filePath: string;
  /** Detected programming language (null if unknown) */
  language: string | null;
  /** File size in bytes */
  sizeBytes: number;
}

export interface IndexerStats {
  /** Total files in input (excluding directories) */
  totalFiles: number;
  /** Files that passed all filters */
  includedFiles: number;
  /** Files excluded by path pattern match */
  excludedByPath: number;
  /** Files excluded by binary extension */
  excludedByExtension: number;
  /** Files excluded by size limit */
  excludedBySize: number;
}

export interface IndexerResult {
  /** Indexed files ready for database storage */
  files: IndexedFile[];
  /** Statistics about filtering operations */
  stats: IndexerStats;
}

// ============================================
// EXCLUSION PATTERNS
// ============================================

/**
 * Directory and file path patterns to exclude.
 * These are checked as substring matches against the full path.
 */
const DEFAULT_PATH_EXCLUSIONS = [
  // Package managers
  'node_modules/',
  'vendor/',
  '.pnpm/',

  // Build outputs
  'dist/',
  'build/',
  'out/',
  '.next/',
  '.nuxt/',
  '.svelte-kit/',
  '.output/',
  '.vercel/',

  // Testing/coverage
  'coverage/',
  '__pycache__/',
  '.pytest_cache/',
  '.nyc_output/',

  // Virtual environments
  '.venv/',
  'venv/',
  'env/',
  '.virtualenv/',

  // IDE/Editor
  '.idea/',
  '.vscode/',

  // Version control
  '.git/',

  // Lock files (substring match)
  'package-lock.json',
  'yarn.lock',
  'bun.lockb',
  'pnpm-lock.yaml',
  'Gemfile.lock',
  'poetry.lock',
  'Cargo.lock',
  'composer.lock',

  // Generated files
  '.d.ts.map',
  '.js.map',
  '.css.map',
  'routeTree.gen.ts', // TanStack Router generated
];

/**
 * File extensions that indicate binary content.
 * Stored without leading dot for consistent matching.
 */
const BINARY_EXTENSIONS = new Set([
  // Images
  'png',
  'jpg',
  'jpeg',
  'gif',
  'ico',
  'svg',
  'webp',
  'bmp',
  'tiff',
  'avif',

  // Fonts
  'woff',
  'woff2',
  'ttf',
  'otf',
  'eot',

  // Media
  'mp3',
  'mp4',
  'wav',
  'avi',
  'mov',
  'webm',
  'ogg',
  'flac',

  // Archives
  'zip',
  'tar',
  'gz',
  'rar',
  '7z',
  'bz2',
  'xz',

  // Binaries
  'exe',
  'dll',
  'so',
  'dylib',
  'bin',
  'dmg',
  'msi',

  // Compiled
  'pyc',
  'pyo',
  'class',
  'o',
  'obj',
  'a',
  'lib',

  // Documents (often large/binary)
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',

  // Databases
  'db',
  'sqlite',
  'sqlite3',

  // Minified (often unreadable/large)
  'min.js',
  'min.css',
]);

// ============================================
// LANGUAGE DETECTION
// ============================================

/**
 * Maps file extensions to language identifiers.
 * Extensions stored without leading dot.
 */
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  // TypeScript
  ts: 'typescript',
  tsx: 'typescript',
  mts: 'typescript',
  cts: 'typescript',

  // JavaScript
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',

  // Python
  py: 'python',
  pyw: 'python',
  pyi: 'python',

  // Ruby
  rb: 'ruby',
  rake: 'ruby',
  gemspec: 'ruby',

  // Go
  go: 'go',

  // Rust
  rs: 'rust',

  // Java
  java: 'java',

  // Kotlin
  kt: 'kotlin',
  kts: 'kotlin',

  // Swift
  swift: 'swift',

  // C
  c: 'c',
  h: 'c',

  // C++
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  hh: 'cpp',
  hxx: 'cpp',

  // C#
  cs: 'csharp',

  // PHP
  php: 'php',

  // SQL
  sql: 'sql',

  // Markdown
  md: 'markdown',
  mdx: 'markdown',

  // JSON
  json: 'json',
  jsonc: 'json',

  // YAML
  yaml: 'yaml',
  yml: 'yaml',

  // TOML
  toml: 'toml',

  // HTML
  html: 'html',
  htm: 'html',

  // CSS
  css: 'css',

  // SCSS/Sass
  scss: 'scss',
  sass: 'scss',

  // Less
  less: 'less',

  // GraphQL
  graphql: 'graphql',
  gql: 'graphql',

  // Protocol Buffers
  proto: 'protobuf',

  // Shell
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  fish: 'shell',

  // Lua
  lua: 'lua',

  // Perl
  pl: 'perl',
  pm: 'perl',

  // R
  r: 'r',
  R: 'r',

  // Scala
  scala: 'scala',
  sc: 'scala',

  // Clojure
  clj: 'clojure',
  cljs: 'clojure',
  cljc: 'clojure',

  // Elixir
  ex: 'elixir',
  exs: 'elixir',

  // Erlang
  erl: 'erlang',
  hrl: 'erlang',

  // Haskell
  hs: 'haskell',
  lhs: 'haskell',

  // OCaml
  ml: 'ocaml',
  mli: 'ocaml',

  // F#
  fs: 'fsharp',
  fsi: 'fsharp',
  fsx: 'fsharp',

  // Dart
  dart: 'dart',

  // Vue
  vue: 'vue',

  // Svelte
  svelte: 'svelte',

  // XML
  xml: 'xml',
  xsl: 'xml',
  xslt: 'xml',

  // Config files
  ini: 'ini',
  cfg: 'ini',
  conf: 'config',
  env: 'dotenv',

  // Terraform
  tf: 'terraform',
  tfvars: 'terraform',

  // Docker
  dockerfile: 'dockerfile',

  // Nix
  nix: 'nix',

  // Zig
  zig: 'zig',

  // V
  v: 'v',

  // Nim
  nim: 'nim',

  // Crystal
  cr: 'crystal',

  // Julia
  jl: 'julia',
};

/**
 * Special filename mappings (exact match, case-sensitive).
 */
const FILENAME_TO_LANGUAGE: Record<string, string> = {
  Dockerfile: 'dockerfile',
  Makefile: 'makefile',
  Rakefile: 'ruby',
  Gemfile: 'ruby',
  Brewfile: 'ruby',
  CMakeLists: 'cmake',
  Justfile: 'just',
  Vagrantfile: 'ruby',
  '.gitignore': 'gitignore',
  '.gitattributes': 'gitattributes',
  '.editorconfig': 'editorconfig',
  '.prettierrc': 'json',
  '.eslintrc': 'json',
  '.babelrc': 'json',
  'tsconfig.json': 'json',
  'package.json': 'json',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract the file extension from a path.
 * Handles multi-part extensions like ".test.ts" → "ts"
 *
 * @returns Extension without leading dot, lowercase
 */
function getExtension(path: string): string {
  const filename = path.split('/').pop() ?? '';

  // Handle files like ".gitignore" (hidden files with no extension)
  if (filename.startsWith('.') && !filename.includes('.', 1)) {
    return '';
  }

  // Handle compound extensions like ".min.js" or ".d.ts"
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.endsWith('.min.js')) return 'min.js';
  if (lowerFilename.endsWith('.min.css')) return 'min.css';
  if (lowerFilename.endsWith('.d.ts')) return 'ts';
  if (lowerFilename.endsWith('.d.ts.map')) return 'd.ts.map';
  if (lowerFilename.endsWith('.js.map')) return 'js.map';
  if (lowerFilename.endsWith('.css.map')) return 'css.map';

  // Standard extension extraction
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) return '';

  return filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Get the filename from a path.
 */
function getFilename(path: string): string {
  return path.split('/').pop() ?? '';
}

/**
 * Detect the programming language from a file path.
 *
 * @returns Language identifier or null if unknown
 */
export function detectLanguage(path: string): string | null {
  const filename = getFilename(path);

  // Check exact filename matches first
  if (FILENAME_TO_LANGUAGE[filename]) {
    return FILENAME_TO_LANGUAGE[filename]!;
  }

  // Then check extension
  const ext = getExtension(path);
  if (ext && EXTENSION_TO_LANGUAGE[ext]) {
    return EXTENSION_TO_LANGUAGE[ext]!;
  }

  return null;
}

/**
 * Check if a path should be excluded based on path patterns.
 */
function isExcludedByPath(path: string, extraPatterns: string[]): boolean {
  const allPatterns = [...DEFAULT_PATH_EXCLUSIONS, ...extraPatterns];

  for (const pattern of allPatterns) {
    if (path.includes(pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a file should be excluded based on its extension.
 */
function isExcludedByExtension(
  path: string,
  extraExtensions: string[],
): boolean {
  const ext = getExtension(path);
  if (!ext) return false;

  if (BINARY_EXTENSIONS.has(ext)) return true;

  for (const extraExt of extraExtensions) {
    if (ext === extraExt.toLowerCase()) return true;
  }

  return false;
}

// ============================================
// MAIN FUNCTION
// ============================================

const DEFAULT_MAX_FILE_SIZE = 1024 * 1024; // 1MB

/**
 * Index a file tree from GitHub, filtering and enriching files with metadata.
 *
 * @param files - Raw file tree from fetchFileTree()
 * @param options - Configuration options
 * @returns Indexed files and filtering statistics
 *
 * @example
 * ```typescript
 * const tree = await fetchFileTree(octokit, owner, repo, 'main');
 * const { files, stats } = indexFileTree(tree.files);
 *
 * console.log(`Indexed ${stats.includedFiles} of ${stats.totalFiles} files`);
 *
 * // Insert into database
 * for (const file of files) {
 *   await db.insert(repoFiles).values({
 *     repoId,
 *     filePath: file.filePath,
 *     language: file.language,
 *     sizeBytes: file.sizeBytes,
 *   });
 * }
 * ```
 */
export function indexFileTree(
  files: RepoFile[],
  options: IndexerOptions = {},
): IndexerResult {
  const {
    excludePatterns = [],
    binaryExtensions = [],
    includeHidden = true,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
  } = options;

  const stats: IndexerStats = {
    totalFiles: 0,
    includedFiles: 0,
    excludedByPath: 0,
    excludedByExtension: 0,
    excludedBySize: 0,
  };

  const indexedFiles: IndexedFile[] = [];

  for (const file of files) {
    // Skip directories (trees)
    if (file.type === 'tree') {
      continue;
    }

    stats.totalFiles++;

    // Skip hidden files if configured
    const filename = getFilename(file.path);
    if (!includeHidden && filename.startsWith('.')) {
      stats.excludedByPath++;
      continue;
    }

    // Check path exclusions
    if (isExcludedByPath(file.path, excludePatterns)) {
      stats.excludedByPath++;
      continue;
    }

    // Check binary extensions
    if (isExcludedByExtension(file.path, binaryExtensions)) {
      stats.excludedByExtension++;
      continue;
    }

    // Check file size
    if (file.size > maxFileSize) {
      stats.excludedBySize++;
      continue;
    }

    // File passed all filters - index it
    const language = detectLanguage(file.path);

    indexedFiles.push({
      filePath: file.path,
      language,
      sizeBytes: file.size,
    });

    stats.includedFiles++;
  }

  return {
    files: indexedFiles,
    stats,
  };
}

// ============================================
// COMBINED WITH TOKEN COUNTING
// ============================================

import {
  calculateTokenCount,
  type TokenCountResult,
} from './token-counter';

/**
 * Result of indexing with token counting.
 */
export interface IndexerResultWithTokens extends IndexerResult {
  /** Token count calculation for limit checking */
  tokenCount: TokenCountResult;
}

/**
 * Index a file tree and calculate token count in one pass.
 *
 * This is the recommended entry point for ingestion jobs that need
 * to check token limits before proceeding with extraction.
 *
 * @param files - Raw file tree from fetchFileTree()
 * @param options - Configuration options
 * @returns Indexed files, statistics, and token count
 *
 * @example
 * ```typescript
 * const tree = await fetchFileTree(octokit, owner, repo, 'main');
 * const result = indexFileTreeWithTokens(tree.files);
 *
 * if (result.tokenCount.exceedsLimit) {
 *   await db.update(repos).set({
 *     ingestionStatus: 'failed',
 *     lastError: createOversizedMessage(result.tokenCount),
 *   });
 *   return;
 * }
 *
 * // Continue with ingestion...
 * ```
 */
export function indexFileTreeWithTokens(
  files: RepoFile[],
  options?: IndexerOptions,
): IndexerResultWithTokens {
  const result = indexFileTree(files, options);
  const tokenCount = calculateTokenCount(result.files);

  return {
    ...result,
    tokenCount,
  };
}

// ============================================
// EXPORTS
// ============================================

export {
  DEFAULT_PATH_EXCLUSIONS,
  BINARY_EXTENSIONS,
  EXTENSION_TO_LANGUAGE,
  FILENAME_TO_LANGUAGE,
  DEFAULT_MAX_FILE_SIZE,
};
