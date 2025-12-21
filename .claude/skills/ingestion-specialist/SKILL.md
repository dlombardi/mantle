---
name: ingestion-specialist
description: |
  Handles repository content fetching, file indexing, git history extraction, and PR history
  retrieval for Reasoning Substrate. Invoke when working on: repo ingestion pipeline, file tree
  building, git blame data, PR diff storage, token counting, or any files in lib/ingestion/,
  lib/github/content.ts, jobs/ingest-repo.ts, or components/repos/file-tree.tsx.
license: MIT
compatibility: GitHub API, Supabase Storage, Trigger.dev, Next.js 14+
allowed-tools: Read Write Bash(npm:*) Glob Grep
metadata:
  role: domain-specialist
  task-count: 11
  critical-path: true
  phase: 2-3
---

# Ingestion Specialist

## Purpose

Fetch repository content, build file index, extract git metadata, and store PR history. This creates the data foundation that the extraction-specialist uses to identify patterns.

## When to Activate This Skill

- Repo ingestion pipeline work
- File tree building
- Git blame extraction
- PR diff storage
- Token counting
- Working on files in:
  - `lib/ingestion/*`
  - `lib/github/content.ts`
  - `lib/github/blame.ts`
  - `lib/github/diff.ts`
  - `jobs/ingest-repo.ts`
  - `components/repos/file-tree.tsx`
  - `components/repos/ingestion-status.tsx`

## Prerequisites

Before starting, ensure:
- [ ] GitHub token utility working (via github-integration-specialist)
- [ ] Database schema exists (via foundation-specialist)
- [ ] Supabase Storage bucket created (`pr_diffs`)
- [ ] Trigger.dev configured

## Tasks Owned

| Task ID | Description | Priority |
|---------|-------------|----------|
| task-2.1-repo-fetch | Fetch repository content | P0 |
| task-2.2-file-tree-indexer | Build hierarchical file tree | P0 |
| task-2.3-content-chunking | Content organization for LLM | P0 |
| task-2.4-ingest-job | Trigger.dev ingestion job | P0 |
| task-2.5-store-indexed-content | Store content efficiently | P1 |
| task-2.6-file-tree-ui | File tree visualization | P1 |
| task-2.7-git-history | Fetch commit history | P1 |
| task-2.8-git-blame | Extract file blame data | P0 |
| task-2.10-pr-history | Fetch historical PRs | P1 |
| task-2.11-progress-tracking | Realtime progress updates | P1 |
| task-2.12-token-count | Calculate token estimates | P0 |
| task-2.13-repo-files-table | Populate file autocomplete | P1 |
| task-2.14-stale-evidence-detection | Detect changed evidence files | P2 |
| task-6.1c-ingestion-errors | Error handling for ingestion | P1 |

## Workflow

### Step 1: Repository Fetch

Create `lib/ingestion/fetch.ts`:
```typescript
import { createInstallationOctokit } from '@/lib/github/octokit';
import { withRateLimit } from '@/lib/github/rate-limit';

type FileNode = {
  path: string;
  type: 'file' | 'dir';
  size: number;
  sha: string;
  content?: string;
};

export async function fetchRepoContent(
  installationId: number,
  owner: string,
  repo: string
): Promise<FileNode[]> {
  const octokit = await createInstallationOctokit(installationId);
  const files: FileNode[] = [];

  async function fetchTree(path: string = '') {
    const { data } = await withRateLimit(octokit, () =>
      octokit.rest.repos.getContent({ owner, repo, path })
    );

    if (Array.isArray(data)) {
      for (const item of data) {
        if (shouldIgnore(item.path)) continue;

        if (item.type === 'dir') {
          await fetchTree(item.path);
        } else if (item.type === 'file') {
          // Fetch file content for code files
          if (isCodeFile(item.path) && item.size < 100000) {
            const content = await fetchFileContent(octokit, owner, repo, item.path);
            files.push({
              path: item.path,
              type: 'file',
              size: item.size,
              sha: item.sha,
              content,
            });
          } else {
            files.push({
              path: item.path,
              type: 'file',
              size: item.size,
              sha: item.sha,
            });
          }
        }
      }
    }
  }

  await fetchTree();
  return files;
}

function shouldIgnore(path: string): boolean {
  const ignorePatterns = [
    /^\.git\//,
    /node_modules\//,
    /\.next\//,
    /dist\//,
    /build\//,
    /coverage\//,
    /\.env/,
    /package-lock\.json$/,
    /yarn\.lock$/,
    /pnpm-lock\.yaml$/,
  ];
  return ignorePatterns.some((p) => p.test(path));
}

function isCodeFile(path: string): boolean {
  const codeExtensions = [
    '.ts', '.tsx', '.js', '.jsx', '.py', '.rb', '.go',
    '.rs', '.java', '.kt', '.swift', '.vue', '.svelte',
    '.css', '.scss', '.html', '.json', '.yaml', '.yml',
    '.md', '.sql', '.graphql',
  ];
  return codeExtensions.some((ext) => path.endsWith(ext));
}

async function fetchFileContent(
  octokit: any,
  owner: string,
  repo: string,
  path: string
): Promise<string> {
  const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
  if ('content' in data) {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
  return '';
}
```

### Step 2: File Tree Building

Create `lib/ingestion/file-tree.ts`:
```typescript
type FileNode = {
  path: string;
  name: string;
  type: 'file' | 'dir';
  size: number;
  language?: string;
  tokenEstimate?: number;
  children?: FileNode[];
};

export function buildFileTree(files: Array<{ path: string; size: number }>): FileNode {
  const root: FileNode = {
    path: '',
    name: 'root',
    type: 'dir',
    size: 0,
    children: [],
  };

  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join('/');

      if (isFile) {
        current.children!.push({
          path,
          name,
          type: 'file',
          size: file.size,
          language: detectLanguage(name),
          tokenEstimate: estimateTokens(file.size),
        });
      } else {
        let child = current.children!.find((c) => c.name === name);
        if (!child) {
          child = {
            path,
            name,
            type: 'dir',
            size: 0,
            children: [],
          };
          current.children!.push(child);
        }
        current = child;
      }
    }
  }

  // Calculate directory sizes
  calculateDirSizes(root);
  return root;
}

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop() || '';
  const languages: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript',
    js: 'javascript', jsx: 'javascript',
    py: 'python', rb: 'ruby', go: 'go',
    rs: 'rust', java: 'java', kt: 'kotlin',
    swift: 'swift', vue: 'vue', svelte: 'svelte',
  };
  return languages[ext] || ext;
}

function estimateTokens(bytes: number): number {
  // ~0.25 tokens per character, ~1 character per byte for code
  return Math.ceil(bytes * 0.25);
}

function calculateDirSizes(node: FileNode): number {
  if (node.type === 'file') return node.size;
  node.size = node.children?.reduce((sum, child) => sum + calculateDirSizes(child), 0) || 0;
  return node.size;
}
```

### Step 3: Token Counting

Create `lib/ingestion/token-count.ts`:
```typescript
const TOKENS_PER_CHAR = 0.25;
const MAX_TOKENS = 600000; // Decision D10

export function countTokens(content: string): number {
  return Math.ceil(content.length * TOKENS_PER_CHAR);
}

export function sumFileTokens(files: Array<{ content?: string; size: number }>): number {
  return files.reduce((sum, file) => {
    if (file.content) {
      return sum + countTokens(file.content);
    }
    // Estimate from size if content not loaded
    return sum + Math.ceil(file.size * TOKENS_PER_CHAR);
  }, 0);
}

export function validateTokenLimit(tokenCount: number): {
  valid: boolean;
  message?: string;
} {
  if (tokenCount > MAX_TOKENS) {
    return {
      valid: false,
      message: `Repository exceeds token limit: ${tokenCount.toLocaleString()} tokens (max: ${MAX_TOKENS.toLocaleString()})`,
    };
  }
  return { valid: true };
}
```

### Step 4: Git Blame Extraction

Create `lib/github/blame.ts`:
```typescript
import { createInstallationOctokit } from './octokit';

export type BlameData = {
  author: string;
  authorEmail: string;
  commitSha: string;
  commitDate: string;
  lineStart: number;
  lineEnd: number;
};

export async function fetchBlame(
  installationId: number,
  owner: string,
  repo: string,
  path: string
): Promise<BlameData[]> {
  const octokit = await createInstallationOctokit(installationId);

  // GitHub doesn't have a direct blame API, use GraphQL
  const query = `
    query($owner: String!, $repo: String!, $path: String!) {
      repository(owner: $owner, name: $repo) {
        object(expression: "HEAD") {
          ... on Commit {
            blame(path: $path) {
              ranges {
                startingLine
                endingLine
                commit {
                  oid
                  author {
                    name
                    email
                    date
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const { repository } = await octokit.graphql(query, { owner, repo, path });

  if (!repository?.object?.blame?.ranges) {
    return [];
  }

  return repository.object.blame.ranges.map((range: any) => ({
    author: range.commit.author.name,
    authorEmail: range.commit.author.email,
    commitSha: range.commit.oid,
    commitDate: range.commit.author.date,
    lineStart: range.startingLine,
    lineEnd: range.endingLine,
  }));
}

export function extractBlameMetrics(blameData: BlameData[]): {
  uniqueAuthors: number;
  oldestCommitDate: string | null;
  newestCommitDate: string | null;
} {
  const authors = new Set(blameData.map((b) => b.authorEmail));
  const dates = blameData.map((b) => new Date(b.commitDate).getTime());

  return {
    uniqueAuthors: authors.size,
    oldestCommitDate: dates.length ? new Date(Math.min(...dates)).toISOString() : null,
    newestCommitDate: dates.length ? new Date(Math.max(...dates)).toISOString() : null,
  };
}
```

### Step 5: PR History Fetching

Create `lib/github/diff.ts`:
```typescript
import { createInstallationOctokit } from './octokit';
import { createAdminClient } from '@/lib/supabase/admin';

export async function fetchPRHistory(
  installationId: number,
  owner: string,
  repo: string,
  limit: number = 100
): Promise<Array<{ prNumber: number; title: string; diffStoragePath: string }>> {
  const octokit = await createInstallationOctokit(installationId);
  const supabase = createAdminClient();

  // Fetch merged PRs
  const { data: prs } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: 'closed',
    sort: 'updated',
    direction: 'desc',
    per_page: limit,
  });

  const mergedPRs = prs.filter((pr) => pr.merged_at);
  const results = [];

  for (const pr of mergedPRs) {
    // Fetch diff
    const { data: diff } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: pr.number,
      mediaType: { format: 'diff' },
    });

    // Store in Supabase Storage
    const storagePath = `${owner}/${repo}/${pr.number}.diff`;
    const { error } = await supabase.storage
      .from('pr_diffs')
      .upload(storagePath, diff as unknown as string, {
        contentType: 'text/plain',
        upsert: true,
      });

    if (!error) {
      results.push({
        prNumber: pr.number,
        title: pr.title,
        diffStoragePath: storagePath,
      });
    }
  }

  return results;
}
```

### Step 6: Ingestion Job

Create `jobs/ingest-repo.ts`:
```typescript
import { task, logger } from '@trigger.dev/sdk/v3';
import { fetchRepoContent } from '@/lib/ingestion/fetch';
import { buildFileTree } from '@/lib/ingestion/file-tree';
import { sumFileTokens, validateTokenLimit } from '@/lib/ingestion/token-count';
import { fetchBlame } from '@/lib/github/blame';
import { fetchPRHistory } from '@/lib/github/diff';
import { createAdminClient } from '@/lib/supabase/admin';

export const ingestRepoJob = task({
  id: 'ingest-repo',
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 60000,
    factor: 2,
  },
  run: async (payload: {
    repoId: string;
    installationId: number;
    owner: string;
    repo: string;
  }) => {
    const supabase = createAdminClient();
    const { repoId, installationId, owner, repo } = payload;

    try {
      // Update status to ingesting
      await supabase
        .from('repos')
        .update({ ingestion_status: 'ingesting' })
        .eq('id', repoId);

      // Step 1: Fetch content
      logger.info('Fetching repository content');
      const files = await fetchRepoContent(installationId, owner, repo);
      logger.info(`Fetched ${files.length} files`);

      // Step 2: Calculate token count
      const tokenCount = sumFileTokens(files);
      const validation = validateTokenLimit(tokenCount);

      if (!validation.valid) {
        await supabase
          .from('repos')
          .update({
            ingestion_status: 'failed',
            ingestion_error: validation.message,
            token_count: tokenCount,
          })
          .eq('id', repoId);
        return { success: false, error: validation.message };
      }

      // Step 3: Build file tree
      const fileTree = buildFileTree(files);

      // Step 4: Store repo files for autocomplete
      const repoFiles = files.map((f) => ({
        repo_id: repoId,
        path: f.path,
        language: f.type === 'file' ? detectLanguage(f.path) : null,
        size_bytes: f.size,
      }));

      await supabase.from('repo_files').upsert(repoFiles, {
        onConflict: 'repo_id,path',
      });

      // Step 5: Fetch PR history
      logger.info('Fetching PR history');
      const prHistory = await fetchPRHistory(installationId, owner, repo);

      // Store PR records
      for (const pr of prHistory) {
        await supabase.from('pull_requests').upsert({
          repo_id: repoId,
          github_pr_id: pr.prNumber,
          number: pr.prNumber,
          title: pr.title,
          state: 'closed',
          diff_storage_path: pr.diffStoragePath,
        }, { onConflict: 'repo_id,github_pr_id' });
      }

      // Step 6: Update status
      await supabase
        .from('repos')
        .update({
          ingestion_status: 'ingested',
          ingestion_error: null,
          token_count: tokenCount,
        })
        .eq('id', repoId);

      logger.info('Ingestion complete', { tokenCount, fileCount: files.length });

      // Trigger extraction job
      // await extractPatternsJob.trigger({ repoId });

      return {
        success: true,
        fileCount: files.length,
        tokenCount,
        prCount: prHistory.length,
      };
    } catch (error: any) {
      logger.error('Ingestion failed', { error: error.message });

      await supabase
        .from('repos')
        .update({
          ingestion_status: 'failed',
          ingestion_error: error.message,
        })
        .eq('id', repoId);

      throw error;
    }
  },
});

function detectLanguage(path: string): string | null {
  const ext = path.split('.').pop();
  const languages: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript',
    js: 'javascript', jsx: 'javascript',
    py: 'python', rb: 'ruby', go: 'go',
  };
  return languages[ext || ''] || null;
}
```

### Step 7: Progress UI Component

Create `components/repos/ingestion-status.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Repo } from '@/lib/db/types';

export function IngestionStatus({ repoId }: { repoId: string }) {
  const [repo, setRepo] = useState<Repo | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    supabase
      .from('repos')
      .select('*')
      .eq('id', repoId)
      .single()
      .then(({ data }) => setRepo(data));

    // Subscribe to changes
    const channel = supabase
      .channel(`repo:${repoId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'repos', filter: `id=eq.${repoId}` },
        (payload) => setRepo(payload.new as Repo)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [repoId, supabase]);

  if (!repo) return <div>Loading...</div>;

  const statusColors = {
    pending: 'bg-gray-200 text-gray-800',
    ingesting: 'bg-blue-200 text-blue-800',
    ingested: 'bg-green-200 text-green-800',
    failed: 'bg-red-200 text-red-800',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-sm ${statusColors[repo.ingestionStatus]}`}>
          {repo.ingestionStatus}
        </span>
        {repo.ingestionStatus === 'ingesting' && (
          <span className="animate-spin">⏳</span>
        )}
      </div>

      {repo.tokenCount > 0 && (
        <div className="text-sm text-gray-600">
          {repo.tokenCount.toLocaleString()} tokens
        </div>
      )}

      {repo.ingestionError && (
        <div className="text-sm text-red-600">
          Error: {repo.ingestionError}
        </div>
      )}
    </div>
  );
}
```

## Output Specification

After running this skill, the following should exist:

### Files Created
```
lib/ingestion/
├── fetch.ts           # Repository content fetching
├── file-tree.ts       # File tree building
├── token-count.ts     # Token estimation
└── staleness-check.ts # Stale evidence detection

lib/github/
├── content.ts         # Content fetching helpers
├── blame.ts           # Git blame extraction
└── diff.ts            # PR diff fetching/storage

lib/storage/
└── pr-diffs.ts        # Supabase Storage helpers

lib/db/
└── repo-files.ts      # Repo files queries

jobs/
└── ingest-repo.ts     # Trigger.dev ingestion job

components/repos/
├── file-tree.tsx      # File tree visualization
├── ingestion-status.tsx # Status display
└── progress-tracker.tsx # Progress bar

hooks/
└── use-repo-status.ts # Realtime repo status
```

### Validation Checks
- [ ] File tree builds correctly for test repo
- [ ] Token count calculated accurately
- [ ] Git blame data extracted
- [ ] PR history stored in Supabase Storage
- [ ] Realtime status updates work

## Error Handling

| Error | Resolution |
|-------|------------|
| Token limit exceeded | Set status='failed' with message, don't proceed |
| GitHub API error | Retry with backoff (max 3 attempts) |
| Storage failure | Log error, continue (non-blocking) |
| Rate limit | Use rate limit handler from github-integration-specialist |

## Key Decisions Referenced

| ID | Decision | Impact |
|----|----------|--------|
| D9 | Extract-once with manual refresh | No automatic re-ingestion |
| D10 | 600k token limit | Validate before extraction |
| D21 | repo_files for autocomplete | Populate during ingestion |
| D28 | PR diff storage | Store in Supabase Storage bucket |

## Handoffs

- **On completion** → extraction-specialist takes over for pattern extraction
- **repo_files table** → Available for evidence autocomplete in validation-ui
- **Git blame data** → Used by extraction-specialist for confidence scoring
