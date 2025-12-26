/**
 * File Tree Indexer Tests
 *
 * Tests filtering, language detection, and metadata enrichment.
 */

import { describe, it, expect } from 'vitest';
import {
  indexFileTree,
  detectLanguage,
  DEFAULT_PATH_EXCLUSIONS,
  BINARY_EXTENSIONS,
  EXTENSION_TO_LANGUAGE,
  DEFAULT_MAX_FILE_SIZE,
} from './file-indexer';
import type { RepoFile } from './github-content';

// ============================================
// HELPER FUNCTIONS
// ============================================

function createRepoFile(
  path: string,
  size: number = 1000,
  type: 'blob' | 'tree' = 'blob',
): RepoFile {
  return {
    path,
    sha: 'abc123',
    size,
    type,
    mode: '100644',
  };
}

// ============================================
// LANGUAGE DETECTION TESTS
// ============================================

describe('detectLanguage', () => {
  describe('TypeScript files', () => {
    it('detects .ts files', () => {
      expect(detectLanguage('src/index.ts')).toBe('typescript');
    });

    it('detects .tsx files', () => {
      expect(detectLanguage('src/App.tsx')).toBe('typescript');
    });

    it('detects .mts files', () => {
      expect(detectLanguage('src/utils.mts')).toBe('typescript');
    });

    it('handles .d.ts declaration files', () => {
      expect(detectLanguage('types/global.d.ts')).toBe('typescript');
    });

    it('handles test files with compound extensions', () => {
      expect(detectLanguage('src/utils.test.ts')).toBe('typescript');
      expect(detectLanguage('src/utils.spec.tsx')).toBe('typescript');
    });
  });

  describe('JavaScript files', () => {
    it('detects .js files', () => {
      expect(detectLanguage('src/index.js')).toBe('javascript');
    });

    it('detects .jsx files', () => {
      expect(detectLanguage('src/App.jsx')).toBe('javascript');
    });

    it('detects .mjs files', () => {
      expect(detectLanguage('src/utils.mjs')).toBe('javascript');
    });

    it('detects .cjs files', () => {
      expect(detectLanguage('config/jest.cjs')).toBe('javascript');
    });
  });

  describe('Python files', () => {
    it('detects .py files', () => {
      expect(detectLanguage('app/main.py')).toBe('python');
    });

    it('detects .pyi stub files', () => {
      expect(detectLanguage('stubs/numpy.pyi')).toBe('python');
    });
  });

  describe('Go files', () => {
    it('detects .go files', () => {
      expect(detectLanguage('cmd/server/main.go')).toBe('go');
    });

    it('handles test files', () => {
      expect(detectLanguage('pkg/utils_test.go')).toBe('go');
    });
  });

  describe('Rust files', () => {
    it('detects .rs files', () => {
      expect(detectLanguage('src/lib.rs')).toBe('rust');
    });
  });

  describe('Config files', () => {
    it('detects .json files', () => {
      expect(detectLanguage('package.json')).toBe('json');
    });

    it('detects .yaml files', () => {
      expect(detectLanguage('docker-compose.yaml')).toBe('yaml');
    });

    it('detects .yml files', () => {
      expect(detectLanguage('.github/workflows/ci.yml')).toBe('yaml');
    });

    it('detects .toml files', () => {
      expect(detectLanguage('Cargo.toml')).toBe('toml');
    });
  });

  describe('Special filenames', () => {
    it('detects Dockerfile', () => {
      expect(detectLanguage('Dockerfile')).toBe('dockerfile');
      expect(detectLanguage('docker/Dockerfile')).toBe('dockerfile');
    });

    it('detects Makefile', () => {
      expect(detectLanguage('Makefile')).toBe('makefile');
    });

    it('detects Gemfile', () => {
      expect(detectLanguage('Gemfile')).toBe('ruby');
    });
  });

  describe('Unknown files', () => {
    it('returns null for unknown extensions', () => {
      expect(detectLanguage('data/file.xyz')).toBeNull();
    });

    it('returns null for files without extension', () => {
      expect(detectLanguage('LICENSE')).toBeNull();
      expect(detectLanguage('README')).toBeNull();
    });
  });

  describe('Case handling', () => {
    it('handles uppercase extensions', () => {
      // getExtension lowercases, so this should work
      expect(detectLanguage('docs/GUIDE.MD')).toBe('markdown');
    });
  });
});

// ============================================
// PATH EXCLUSION TESTS
// ============================================

describe('indexFileTree path exclusions', () => {
  it('excludes node_modules', () => {
    const files = [
      createRepoFile('src/index.ts'),
      createRepoFile('node_modules/lodash/index.js'),
      createRepoFile('src/lib/node_modules/internal/mod.ts'),
    ];

    const result = indexFileTree(files);

    expect(result.files).toHaveLength(1);
    expect(result.files[0]!.filePath).toBe('src/index.ts');
    expect(result.stats.excludedByPath).toBe(2);
  });

  it('excludes .git directory', () => {
    const files = [
      createRepoFile('src/index.ts'),
      createRepoFile('.git/config'),
      createRepoFile('.git/objects/abc'),
    ];

    const result = indexFileTree(files);

    expect(result.files).toHaveLength(1);
    expect(result.stats.excludedByPath).toBe(2);
  });

  it('excludes build directories', () => {
    const files = [
      createRepoFile('src/index.ts'),
      createRepoFile('dist/index.js'),
      createRepoFile('build/output.js'),
      createRepoFile('.next/cache/data'),
    ];

    const result = indexFileTree(files);

    expect(result.files).toHaveLength(1);
    expect(result.files[0]!.filePath).toBe('src/index.ts');
  });

  it('excludes lock files', () => {
    const files = [
      createRepoFile('package.json'),
      createRepoFile('package-lock.json'),
      createRepoFile('yarn.lock'),
      createRepoFile('bun.lockb'),
      createRepoFile('pnpm-lock.yaml'),
    ];

    const result = indexFileTree(files);

    expect(result.files).toHaveLength(1);
    expect(result.files[0]!.filePath).toBe('package.json');
    expect(result.stats.excludedByPath).toBe(4);
  });

  it('excludes Python virtual environments', () => {
    const files = [
      createRepoFile('app/main.py'),
      createRepoFile('.venv/bin/python'),
      createRepoFile('venv/lib/site-packages/pkg.py'),
    ];

    const result = indexFileTree(files);

    expect(result.files).toHaveLength(1);
    expect(result.files[0]!.filePath).toBe('app/main.py');
  });

  it('excludes IDE directories', () => {
    const files = [
      createRepoFile('src/index.ts'),
      createRepoFile('.idea/workspace.xml'),
      createRepoFile('.vscode/settings.json'),
    ];

    const result = indexFileTree(files);

    expect(result.files).toHaveLength(1);
  });

  it('respects custom exclude patterns', () => {
    const files = [
      createRepoFile('src/index.ts'),
      createRepoFile('src/generated/types.ts'),
      createRepoFile('src/__generated__/schema.ts'),
    ];

    const result = indexFileTree(files, {
      excludePatterns: ['/generated/', '__generated__/'],
    });

    expect(result.files).toHaveLength(1);
    expect(result.files[0]!.filePath).toBe('src/index.ts');
  });
});

// ============================================
// BINARY EXTENSION TESTS
// ============================================

describe('indexFileTree binary exclusions', () => {
  it('excludes image files', () => {
    const files = [
      createRepoFile('src/index.ts'),
      createRepoFile('assets/logo.png'),
      createRepoFile('images/photo.jpg'),
      createRepoFile('icons/icon.svg'),
    ];

    const result = indexFileTree(files);

    expect(result.files).toHaveLength(1);
    expect(result.stats.excludedByExtension).toBe(3);
  });

  it('excludes font files', () => {
    const files = [
      createRepoFile('src/index.ts'),
      createRepoFile('fonts/inter.woff2'),
      createRepoFile('fonts/roboto.ttf'),
    ];

    const result = indexFileTree(files);

    expect(result.files).toHaveLength(1);
    expect(result.stats.excludedByExtension).toBe(2);
  });

  it('excludes compiled/binary files', () => {
    const files = [
      createRepoFile('main.go'),
      createRepoFile('main.exe'),
      createRepoFile('libfoo.so'),
      createRepoFile('cache.pyc'),
    ];

    const result = indexFileTree(files);

    expect(result.files).toHaveLength(1);
    expect(result.files[0]!.filePath).toBe('main.go');
  });

  it('excludes minified files', () => {
    const files = [
      createRepoFile('src/app.js'),
      createRepoFile('dist/app.min.js'),
      createRepoFile('dist/styles.min.css'),
    ];

    const result = indexFileTree(files);

    expect(result.files).toHaveLength(1);
    expect(result.files[0]!.filePath).toBe('src/app.js');
  });

  it('respects custom binary extensions', () => {
    const files = [
      createRepoFile('src/index.ts'),
      createRepoFile('data/model.onnx'),
      createRepoFile('data/weights.safetensors'),
    ];

    const result = indexFileTree(files, {
      binaryExtensions: ['onnx', 'safetensors'],
    });

    expect(result.files).toHaveLength(1);
    expect(result.stats.excludedByExtension).toBe(2);
  });
});

// ============================================
// SIZE FILTERING TESTS
// ============================================

describe('indexFileTree size filtering', () => {
  it('excludes files exceeding default max size (1MB)', () => {
    const files = [
      createRepoFile('src/small.ts', 1000),
      createRepoFile('src/medium.ts', 500_000),
      createRepoFile('src/large.ts', 2_000_000),
    ];

    const result = indexFileTree(files);

    expect(result.files).toHaveLength(2);
    expect(result.stats.excludedBySize).toBe(1);
  });

  it('respects custom max size', () => {
    const files = [
      createRepoFile('src/tiny.ts', 100),
      createRepoFile('src/small.ts', 1000),
      createRepoFile('src/medium.ts', 5000),
    ];

    const result = indexFileTree(files, { maxFileSize: 500 });

    expect(result.files).toHaveLength(1);
    expect(result.files[0]!.filePath).toBe('src/tiny.ts');
    expect(result.stats.excludedBySize).toBe(2);
  });

  it('includes files at exactly max size', () => {
    const files = [createRepoFile('src/exact.ts', DEFAULT_MAX_FILE_SIZE)];

    const result = indexFileTree(files);

    expect(result.files).toHaveLength(1);
  });
});

// ============================================
// DIRECTORY HANDLING TESTS
// ============================================

describe('indexFileTree directory handling', () => {
  it('skips directories (type=tree)', () => {
    const files = [
      createRepoFile('src/index.ts', 1000, 'blob'),
      createRepoFile('src/', 0, 'tree'),
      createRepoFile('src/utils/', 0, 'tree'),
    ];

    const result = indexFileTree(files);

    expect(result.files).toHaveLength(1);
    expect(result.stats.totalFiles).toBe(1); // Trees don't count toward total
  });
});

// ============================================
// HIDDEN FILE HANDLING TESTS
// ============================================

describe('indexFileTree hidden file handling', () => {
  it('includes hidden files by default', () => {
    const files = [
      createRepoFile('src/index.ts'),
      createRepoFile('.env'),
      createRepoFile('.gitignore'),
      createRepoFile('.eslintrc.js'),
    ];

    const result = indexFileTree(files);

    expect(result.files).toHaveLength(4);
  });

  it('excludes hidden files when configured', () => {
    const files = [
      createRepoFile('src/index.ts'),
      createRepoFile('.env'),
      createRepoFile('.gitignore'),
    ];

    const result = indexFileTree(files, { includeHidden: false });

    expect(result.files).toHaveLength(1);
    expect(result.files[0]!.filePath).toBe('src/index.ts');
    expect(result.stats.excludedByPath).toBe(2);
  });
});

// ============================================
// STATISTICS TESTS
// ============================================

describe('indexFileTree statistics', () => {
  it('accurately counts all exclusion types', () => {
    const files = [
      // Included
      createRepoFile('src/index.ts', 1000),
      createRepoFile('src/utils.ts', 2000),
      // Excluded by path
      createRepoFile('node_modules/pkg/index.js', 500),
      createRepoFile('dist/output.js', 500),
      // Excluded by extension
      createRepoFile('assets/logo.png', 50000),
      createRepoFile('fonts/inter.woff2', 80000),
      // Excluded by size
      createRepoFile('data/large-file.json', 5_000_000),
      // Directory (not counted)
      createRepoFile('src/', 0, 'tree'),
    ];

    const result = indexFileTree(files);

    expect(result.stats).toEqual({
      totalFiles: 7, // Trees excluded from count
      includedFiles: 2,
      excludedByPath: 2,
      excludedByExtension: 2,
      excludedBySize: 1,
    });

    // Verify math: included + all exclusions = total
    expect(
      result.stats.includedFiles +
        result.stats.excludedByPath +
        result.stats.excludedByExtension +
        result.stats.excludedBySize,
    ).toBe(result.stats.totalFiles);
  });

  it('handles empty input', () => {
    const result = indexFileTree([]);

    expect(result.files).toHaveLength(0);
    expect(result.stats).toEqual({
      totalFiles: 0,
      includedFiles: 0,
      excludedByPath: 0,
      excludedByExtension: 0,
      excludedBySize: 0,
    });
  });
});

// ============================================
// INTEGRATION TESTS
// ============================================

describe('indexFileTree integration', () => {
  it('processes a realistic file tree', () => {
    const files = [
      // Source files
      createRepoFile('src/index.ts', 2000),
      createRepoFile('src/utils/helpers.ts', 1500),
      createRepoFile('src/components/Button.tsx', 3000),
      createRepoFile('src/styles/global.css', 500),
      createRepoFile('src/types/index.d.ts', 800),

      // Config files
      createRepoFile('package.json', 1200),
      createRepoFile('tsconfig.json', 500),
      createRepoFile('.eslintrc.js', 300),
      createRepoFile('.env.example', 100),

      // Docs
      createRepoFile('README.md', 5000),
      createRepoFile('docs/api.md', 10000),

      // Tests
      createRepoFile('src/__tests__/helpers.test.ts', 2500),
      createRepoFile('vitest.config.ts', 400),

      // Should be excluded
      createRepoFile('node_modules/lodash/index.js', 50000),
      createRepoFile('dist/index.js', 30000),
      createRepoFile('package-lock.json', 500000),
      createRepoFile('assets/logo.png', 25000),
      createRepoFile('.git/config', 200),
    ];

    const result = indexFileTree(files);

    // Verify included files
    expect(result.stats.includedFiles).toBe(13);
    expect(result.files.map((f) => f.filePath)).toContain('src/index.ts');
    expect(result.files.map((f) => f.filePath)).toContain('README.md');

    // Verify exclusions
    expect(result.files.map((f) => f.filePath)).not.toContain(
      'node_modules/lodash/index.js',
    );
    expect(result.files.map((f) => f.filePath)).not.toContain(
      'package-lock.json',
    );
    expect(result.files.map((f) => f.filePath)).not.toContain('assets/logo.png');

    // Verify language detection
    const indexFile = result.files.find((f) => f.filePath === 'src/index.ts');
    expect(indexFile?.language).toBe('typescript');

    const cssFile = result.files.find(
      (f) => f.filePath === 'src/styles/global.css',
    );
    expect(cssFile?.language).toBe('css');

    const readmeFile = result.files.find((f) => f.filePath === 'README.md');
    expect(readmeFile?.language).toBe('markdown');
  });

  it('handles monorepo structure', () => {
    const files = [
      // Root config
      createRepoFile('package.json', 500),
      createRepoFile('turbo.json', 300),

      // Apps
      createRepoFile('apps/api/src/index.ts', 2000),
      createRepoFile('apps/api/package.json', 400),
      createRepoFile('apps/web/src/App.tsx', 3000),
      createRepoFile('apps/web/package.json', 600),

      // Packages
      createRepoFile('packages/db/src/schema.ts', 5000),
      createRepoFile('packages/trpc/src/router.ts', 4000),

      // Excluded
      createRepoFile('apps/api/node_modules/hono/index.js', 10000),
      createRepoFile('apps/web/.next/cache/data', 50000),
    ];

    const result = indexFileTree(files);

    expect(result.stats.includedFiles).toBe(8);
    expect(result.stats.excludedByPath).toBe(2);
  });
});

// ============================================
// CONSTANT VERIFICATION TESTS
// ============================================

describe('constants', () => {
  it('has sensible default path exclusions', () => {
    expect(DEFAULT_PATH_EXCLUSIONS).toContain('node_modules/');
    expect(DEFAULT_PATH_EXCLUSIONS).toContain('.git/');
    expect(DEFAULT_PATH_EXCLUSIONS).toContain('dist/');
  });

  it('includes common binary extensions', () => {
    expect(BINARY_EXTENSIONS.has('png')).toBe(true);
    expect(BINARY_EXTENSIONS.has('exe')).toBe(true);
    expect(BINARY_EXTENSIONS.has('woff2')).toBe(true);
  });

  it('has extensive language mappings', () => {
    expect(Object.keys(EXTENSION_TO_LANGUAGE).length).toBeGreaterThan(50);
    expect(EXTENSION_TO_LANGUAGE['ts']).toBe('typescript');
    expect(EXTENSION_TO_LANGUAGE['py']).toBe('python');
    expect(EXTENSION_TO_LANGUAGE['go']).toBe('go');
  });

  it('has reasonable default max file size', () => {
    expect(DEFAULT_MAX_FILE_SIZE).toBe(1024 * 1024); // 1MB
  });
});
