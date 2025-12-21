---
name: context-files-specialist
description: |
  Handles AI agent context file generation for Reasoning Substrate: transforming patterns to
  markdown, format adapters (Claude, Cursor), marker-based append, and debounced sync. Invoke
  when working on: CLAUDE.md generation, .cursorrules generation, context file configuration,
  marker handling, or any files in lib/context-files/, app/repos/[id]/context/,
  components/context/, jobs/sync-context-files.ts.
license: MIT
compatibility: Next.js 14+, Trigger.dev, Markdown
allowed-tools: Read Write Bash(npm:*) Glob Grep
metadata:
  role: domain-specialist
  task-count: 9
  critical-path: true
  phase: 5-6
  consults: backend-architect
---

# Context Files Specialist

## Purpose

Generate AI agent context files from authoritative patterns. This enables patterns to be enforced not just through PR review, but also by informing AI coding assistants about established conventions.

## When to Activate This Skill

- CLAUDE.md generation
- .cursorrules generation
- Context file configuration
- Marker-based file append
- Working on files in:
  - `lib/context-files/*`
  - `app/repos/[id]/context/*`
  - `components/context/*`
  - `jobs/sync-context-files.ts`

## Prerequisites

Before starting, ensure:
- [ ] Authoritative patterns exist with aiContextEnabled=true (via validation-ui-specialist)
- [ ] Database schema exists (via foundation-specialist)
- [ ] Trigger.dev configured

**Consult**: `backend-architect` patterns in `docs/backend/` before starting.

## Tasks Owned

| Task ID | Description | Priority |
|---------|-------------|----------|
| task-5a.1-context-config | Context file configuration model | P0 |
| task-5a.2-context-setup-ui | Setup/configuration UI | P0 |
| task-5a.3-pattern-transformer | Pattern to markdown transformer | P0 |
| task-5a.4-format-adapters | Claude and Cursor format adapters | P0 |
| task-5a.5-filesystem-transformer | Filesystem pattern transformer | P1 |
| task-5a.6-marker-append | Marker-based file append | P0 |
| task-5a.7-debounced-sync | Debounced regeneration job | P0 |
| task-5a.8-download-ui | Download/copy UI | P1 |
| task-5a.9-sync-dashboard | Sync status dashboard widget | P1 |

## Workflow

### Step 1: Pattern Transformer

Create `lib/context-files/transform.ts`:
```typescript
import type { Pattern } from '@/lib/db/types';

export type TransformedPattern = {
  name: string;
  description: string;
  type: 'code' | 'file-naming' | 'file-structure';
  severity: 'error' | 'warning' | 'info';
  rationale: string;
  examples?: string[];
};

export function transformPatterns(patterns: Pattern[]): TransformedPattern[] {
  return patterns
    .filter((p) => p.status === 'authoritative' && p.aiContextEnabled)
    .map((p) => ({
      name: p.name,
      description: p.description,
      type: p.type,
      severity: p.severity || 'warning',
      rationale: p.rationale || '',
      examples: [], // Would be populated from evidence
    }));
}

export function groupPatternsByType(
  patterns: TransformedPattern[]
): Record<string, TransformedPattern[]> {
  return patterns.reduce((acc, p) => {
    if (!acc[p.type]) acc[p.type] = [];
    acc[p.type].push(p);
    return acc;
  }, {} as Record<string, TransformedPattern[]>);
}
```

### Step 2: Claude Format Adapter

Create `lib/context-files/adapters/claude.ts`:
```typescript
import type { TransformedPattern } from '../transform';
import { groupPatternsByType } from '../transform';

export function generateClaudeFormat(
  patterns: TransformedPattern[],
  repoName: string
): string {
  const grouped = groupPatternsByType(patterns);
  const sections: string[] = [];

  sections.push(`# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: ${repoName}

The following patterns have been identified and validated in this codebase. Follow these conventions to maintain consistency.
`);

  // Code patterns
  if (grouped.code?.length) {
    sections.push(`## Code Patterns

${grouped.code.map(formatCodePattern).join('\n\n')}`);
  }

  // File naming patterns
  if (grouped['file-naming']?.length) {
    sections.push(`## File Naming Conventions

${grouped['file-naming'].map(formatFileNamingPattern).join('\n\n')}`);
  }

  // File structure patterns
  if (grouped['file-structure']?.length) {
    sections.push(`## Project Structure

${grouped['file-structure'].map(formatFileStructurePattern).join('\n\n')}`);
  }

  return sections.join('\n\n---\n\n');
}

function formatCodePattern(pattern: TransformedPattern): string {
  const severityBadge = pattern.severity === 'error' ? '**[Required]**' :
                        pattern.severity === 'warning' ? '[Recommended]' : '[Optional]';

  return `### ${pattern.name} ${severityBadge}

${pattern.description}

${pattern.rationale ? `**Why:** ${pattern.rationale}` : ''}`;
}

function formatFileNamingPattern(pattern: TransformedPattern): string {
  return `### ${pattern.name}

${pattern.description}`;
}

function formatFileStructurePattern(pattern: TransformedPattern): string {
  return `### ${pattern.name}

${pattern.description}`;
}
```

### Step 3: Cursor Format Adapter

Create `lib/context-files/adapters/cursor.ts`:
```typescript
import type { TransformedPattern } from '../transform';
import { groupPatternsByType } from '../transform';

export function generateCursorFormat(
  patterns: TransformedPattern[],
  repoName: string
): string {
  const grouped = groupPatternsByType(patterns);
  const rules: string[] = [];

  rules.push(`# Cursor Rules for ${repoName}

Follow these established patterns when writing code in this repository.
`);

  // All patterns as rules
  for (const pattern of patterns) {
    const prefix = pattern.severity === 'error' ? 'ALWAYS' :
                   pattern.severity === 'warning' ? 'PREFER' : 'CONSIDER';

    rules.push(`## ${pattern.name}

${prefix}: ${pattern.description}

${pattern.rationale ? `Reason: ${pattern.rationale}` : ''}`);
  }

  return rules.join('\n\n');
}
```

### Step 4: Filesystem Pattern Transformer

Create `lib/context-files/filesystem-transform.ts`:
```typescript
import type { Pattern } from '@/lib/db/types';

export function transformFilesystemPatterns(patterns: Pattern[]): string {
  const fsPatterns = patterns.filter(
    (p) => p.type === 'file-naming' || p.type === 'file-structure'
  );

  if (fsPatterns.length === 0) return '';

  const sections: string[] = [];

  sections.push(`## Filesystem Conventions

The following file and directory patterns are enforced in this codebase.
`);

  for (const pattern of fsPatterns) {
    if (pattern.type === 'file-naming') {
      sections.push(`### ${pattern.name}

${pattern.description}

**Pattern:** Follow this naming convention for consistency.`);
    } else {
      sections.push(`### ${pattern.name}

${pattern.description}

**Structure:** Organize files according to this pattern.`);
    }
  }

  return sections.join('\n\n');
}
```

### Step 5: Marker-Based Append

Create `lib/context-files/marker-append.ts`:
```typescript
const START_MARKER = '<!-- REASONING_SUBSTRATE_START -->';
const END_MARKER = '<!-- REASONING_SUBSTRATE_END -->';

export function appendWithMarkers(
  existingContent: string,
  generatedContent: string
): string {
  const startIndex = existingContent.indexOf(START_MARKER);
  const endIndex = existingContent.indexOf(END_MARKER);

  // No markers found - append at end
  if (startIndex === -1 || endIndex === -1) {
    return `${existingContent.trim()}

${START_MARKER}
${generatedContent}
${END_MARKER}
`;
  }

  // Replace content between markers
  const before = existingContent.slice(0, startIndex);
  const after = existingContent.slice(endIndex + END_MARKER.length);

  return `${before}${START_MARKER}
${generatedContent}
${END_MARKER}${after}`;
}

export function extractUserContent(content: string): string {
  const startIndex = content.indexOf(START_MARKER);

  if (startIndex === -1) {
    return content;
  }

  return content.slice(0, startIndex).trim();
}

export function hasMarkers(content: string): boolean {
  return content.includes(START_MARKER) && content.includes(END_MARKER);
}
```

### Step 6: Sync Job

Create `jobs/sync-context-files.ts`:
```typescript
import { task, logger } from '@trigger.dev/sdk/v3';
import { transformPatterns } from '@/lib/context-files/transform';
import { generateClaudeFormat } from '@/lib/context-files/adapters/claude';
import { generateCursorFormat } from '@/lib/context-files/adapters/cursor';
import { createAdminClient } from '@/lib/supabase/admin';

export const syncContextFilesJob = task({
  id: 'sync-context-files',
  // Decision D36: Debounced regeneration
  queue: {
    concurrencyLimit: 1,
  },
  run: async (payload: { repoId: string }) => {
    const supabase = createAdminClient();
    const { repoId } = payload;

    try {
      // Get repo info
      const { data: repo } = await supabase
        .from('repos')
        .select('name, full_name')
        .eq('id', repoId)
        .single();

      if (!repo) throw new Error('Repo not found');

      // Get enabled patterns
      const { data: patterns } = await supabase
        .from('patterns')
        .select('*')
        .eq('repo_id', repoId)
        .eq('status', 'authoritative')
        .eq('ai_context_enabled', true);

      if (!patterns || patterns.length === 0) {
        logger.info('No patterns with AI context enabled');
        return { generated: false };
      }

      // Transform patterns
      const transformed = transformPatterns(patterns);

      // Get context configs
      const { data: configs } = await supabase
        .from('context_file_configs')
        .select('*')
        .eq('repo_id', repoId)
        .eq('enabled', true);

      // Generate for each enabled format
      for (const config of configs || []) {
        let content: string;

        if (config.format === 'claude') {
          content = generateClaudeFormat(transformed, repo.name);
        } else if (config.format === 'cursor') {
          content = generateCursorFormat(transformed, repo.name);
        } else {
          continue;
        }

        // Store generated content (for download)
        await supabase
          .from('context_file_configs')
          .update({
            generated_content: content,
            last_synced_at: new Date().toISOString(),
          })
          .eq('id', config.id);

        logger.info(`Generated ${config.format} context file`);
      }

      return {
        generated: true,
        patternCount: transformed.length,
      };
    } catch (error: any) {
      logger.error('Context file sync failed', { error: error.message });
      throw error;
    }
  },
});

// Debounce wrapper - call this instead of the job directly
let pendingSync: NodeJS.Timeout | null = null;

export function scheduleSyncContextFiles(repoId: string) {
  if (pendingSync) {
    clearTimeout(pendingSync);
  }

  // Decision D36: 5-10 second debounce
  pendingSync = setTimeout(() => {
    syncContextFilesJob.trigger({ repoId });
    pendingSync = null;
  }, 5000);
}
```

### Step 7: Context Setup UI

Create `app/repos/[id]/context/setup/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server';
import { ContextSetupForm } from './context-setup-form';

export default async function ContextSetupPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: configs } = await supabase
    .from('context_file_configs')
    .select('*')
    .eq('repo_id', params.id);

  const { data: patterns } = await supabase
    .from('patterns')
    .select('id, name, ai_context_enabled')
    .eq('repo_id', params.id)
    .eq('status', 'authoritative');

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold">AI Context File Setup</h1>

      <p className="text-gray-600">
        Configure how patterns are exported to AI coding assistants like Claude Code
        and Cursor.
      </p>

      <ContextSetupForm
        repoId={params.id}
        configs={configs || []}
        patterns={patterns || []}
      />
    </div>
  );
}
```

Create `app/repos/[id]/context/setup/context-setup-form.tsx`:
```typescript
'use client';

import { useState } from 'react';

type Config = {
  id: string;
  format: 'claude' | 'cursor';
  file_path: string;
  enabled: boolean;
};

type Pattern = {
  id: string;
  name: string;
  ai_context_enabled: boolean;
};

export function ContextSetupForm({
  repoId,
  configs,
  patterns,
}: {
  repoId: string;
  configs: Config[];
  patterns: Pattern[];
}) {
  const [claudeEnabled, setClaudeEnabled] = useState(
    configs.some((c) => c.format === 'claude' && c.enabled)
  );
  const [cursorEnabled, setCursorEnabled] = useState(
    configs.some((c) => c.format === 'cursor' && c.enabled)
  );

  const handleSave = async () => {
    await fetch(`/api/repos/${repoId}/context-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        claude: { enabled: claudeEnabled, path: 'CLAUDE.md' },
        cursor: { enabled: cursorEnabled, path: '.cursorrules' },
      }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="font-medium">Output Formats</h2>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={claudeEnabled}
            onChange={(e) => setClaudeEnabled(e.target.checked)}
            className="w-5 h-5"
          />
          <div>
            <p className="font-medium">Claude Code (CLAUDE.md)</p>
            <p className="text-sm text-gray-500">
              Generate context for Claude Code AI assistant
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={cursorEnabled}
            onChange={(e) => setCursorEnabled(e.target.checked)}
            className="w-5 h-5"
          />
          <div>
            <p className="font-medium">Cursor (.cursorrules)</p>
            <p className="text-sm text-gray-500">
              Generate rules for Cursor AI editor
            </p>
          </div>
        </label>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="font-medium">Included Patterns</h2>
        <p className="text-sm text-gray-500">
          {patterns.filter((p) => p.ai_context_enabled).length} of {patterns.length} patterns
          have AI context enabled
        </p>

        <div className="space-y-2">
          {patterns.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-sm">
              <span className={p.ai_context_enabled ? 'text-green-600' : 'text-gray-400'}>
                {p.ai_context_enabled ? '✓' : '○'}
              </span>
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Save Configuration
      </button>
    </div>
  );
}
```

### Step 8: Download Modal

Create `components/context/download-modal.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';

type Props = {
  repoId: string;
  format: 'claude' | 'cursor';
  onClose: () => void;
};

export function DownloadModal({ repoId, format, onClose }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/repos/${repoId}/context-file?format=${format}`)
      .then((r) => r.json())
      .then((data) => setContent(data.content));
  }, [repoId, format]);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!content) return;

    const filename = format === 'claude' ? 'CLAUDE.md' : '.cursorrules';
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      title={format === 'claude' ? 'CLAUDE.md' : '.cursorrules'}
      onClose={onClose}
    >
      <div className="space-y-4">
        {content ? (
          <>
            <pre className="bg-gray-100 p-4 rounded text-sm max-h-96 overflow-auto">
              {content}
            </pre>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 border rounded"
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Download File
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        )}
      </div>
    </Modal>
  );
}
```

## Output Specification

After running this skill, the following should exist:

### Files Created
```
lib/context-files/
├── transform.ts              # Pattern transformer
├── filesystem-transform.ts   # Filesystem patterns
├── marker-append.ts          # Marker handling
└── adapters/
    ├── claude.ts             # CLAUDE.md format
    └── cursor.ts             # .cursorrules format

lib/db/
└── context-configs.ts        # Config queries

jobs/
└── sync-context-files.ts     # Sync job with debounce

app/repos/[id]/context/
└── setup/
    ├── page.tsx              # Setup page
    └── context-setup-form.tsx

app/api/repos/[id]/
├── context-config/route.ts   # Config endpoint
└── context-file/route.ts     # Download endpoint

components/context/
├── format-selector.tsx
├── download-modal.tsx
└── sync-status.tsx

components/dashboard/
└── context-sync-widget.tsx   # Dashboard widget
```

### Validation Checks
- [ ] Patterns transform to valid markdown
- [ ] CLAUDE.md format is readable and useful
- [ ] .cursorrules format follows Cursor conventions
- [ ] Markers preserved on regeneration
- [ ] Debounce batches rapid changes
- [ ] Download/copy works correctly

## Key Decisions Referenced

| ID | Decision | Impact |
|----|----------|--------|
| D30 | AI context channel | This is the aiContext enforcement channel |
| D32 | Claude + Cursor MVP | Two format adapters |
| D33 | Marker-based append | Preserve user content outside markers |
| D36 | Debounced regeneration | 5-10 second debounce window |

## Error Handling

| Error | Resolution |
|-------|------------|
| No patterns with aiContext | Empty output with message |
| Marker parsing error | Append at end (safe fallback) |
| Sync failure | Log error, retry on next change |

## Handoffs

- **Patterns from** → validation-ui-specialist (aiContextEnabled flag)
- **Sync triggers** → Called when patterns are promoted/updated
- **Dashboard widget** → Shows sync status for polish-specialist
