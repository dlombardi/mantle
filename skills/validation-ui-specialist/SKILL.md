---
name: validation-ui-specialist
description: |
  Handles all validation workflow UI for Reasoning Substrate: pattern cards, triage queue,
  confidence visualization, validation actions (Promote/Reject/Defer), evidence management,
  and backtest display. Invoke when working on: pattern list/detail views, confidence cards,
  dimension bars, triage queue, keyboard shortcuts, modals, or any files in app/patterns/,
  app/repos/[id]/patterns/, components/patterns/, or hooks/use-keyboard-navigation.ts.
license: MIT
compatibility: React 18+, Next.js 14+ App Router, Tailwind CSS
allowed-tools: Read Write Bash(npm:*) Glob Grep
metadata:
  role: domain-specialist
  task-count: 16
  critical-path: true
  phase: 4-5
  consults: frontend-architect
---

# Validation UI Specialist

## Purpose

Build the human validation workflow: triage queue, pattern cards, and validation actions. This is the primary user interface where humans review and promote extracted patterns.

## When to Activate This Skill

- Pattern list/detail views
- Confidence card visualization
- Triage queue implementation
- Validation actions (Promote/Reject/Defer)
- Evidence management
- Working on files in:
  - `app/patterns/*`
  - `app/repos/[id]/patterns/*`
  - `components/patterns/*`
  - `hooks/use-keyboard-navigation.ts`

## Prerequisites

Before starting, ensure:
- [ ] Frontend patterns established (via frontend-architect)
- [ ] Patterns extracted with confidence scores (via extraction-specialist)
- [ ] Backtest data available
- [ ] Database schema exists

**Consult**: `frontend-architect` patterns in `docs/frontend/` before starting.

## Tasks Owned

| Task ID | Description | Priority |
|---------|-------------|----------|
| task-3.12-candidate-list-ui | Pattern candidate list | P0 |
| task-4.1-confidence-card | Confidence dimension visualization | P0 |
| task-4.2-insight-display | Contextual insights display | P1 |
| task-4.3-validation-actions | Promote/Reject/Defer buttons | P0 |
| task-4.4-promote-action | Promote modal with severity | P0 |
| task-4.5-rationale-field | Rationale text input | P0 |
| task-4.6-provenance-linking | Link to original evidence | P1 |
| task-4.7-pattern-detail | Full pattern detail page | P1 |
| task-4.8-pattern-dashboard | Pattern dashboard with filters | P1 |
| task-4.9-backtest | Trigger backtest on promote | P1 |
| task-4.10-backtest-display | Show violation preview | P1 |
| task-4.11-queue-ux | Keyboard-driven triage queue | P0 |
| task-4.12-repo-progress | Repo extraction progress | P1 |
| task-4.13-evidence-management | Add/remove/mark evidence | P1 |
| task-4.14-merge-action | Merge duplicate patterns | P2 |
| task-4.15-filesystem-card | 2-dimension filesystem card | P2 |
| task-4.16-enforcement-toggles | PR review + AI context toggles | P1 |

## Workflow

### Step 1: Confidence Card Component

Create `components/patterns/confidence-card.tsx`:
```typescript
'use client';

import type { Confidence, PatternTier } from '@/lib/db/types';
import { DimensionBar } from './dimension-bar';
import { TierBadge } from './tier-badge';
import { HealthWarnings } from './health-warnings';

type Props = {
  confidence: Confidence;
  tier: PatternTier;
  healthSignals?: Array<{ category: string; message: string }>;
};

export function ConfidenceCard({ confidence, tier, healthSignals }: Props) {
  return (
    <div className="rounded-lg border bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Confidence</h3>
        <TierBadge tier={tier} />
      </div>

      <div className="space-y-3">
        <DimensionBar
          label="Evidence"
          value={confidence.evidence.instanceCount}
          max={10}
          sublabel={`${confidence.evidence.instanceCount} instances, ${Math.round(confidence.evidence.consistency * 100)}% consistent`}
        />

        <DimensionBar
          label="Adoption"
          value={confidence.adoption.uniqueAuthors}
          max={10}
          sublabel={`${confidence.adoption.uniqueAuthors} unique authors`}
        />

        <DimensionBar
          label="Establishment"
          value={getEstablishmentValue(confidence.establishment.ageCategory)}
          max={4}
          sublabel={confidence.establishment.ageCategory}
        />

        <DimensionBar
          label="Location"
          value={getLocationValue(confidence.location.codeCategory)}
          max={4}
          sublabel={confidence.location.codeCategory}
        />
      </div>

      {healthSignals && healthSignals.length > 0 && (
        <HealthWarnings signals={healthSignals} />
      )}
    </div>
  );
}

function getEstablishmentValue(age: string): number {
  const values: Record<string, number> = { new: 1, recent: 2, established: 3, legacy: 4 };
  return values[age] || 2;
}

function getLocationValue(category: string): number {
  const values: Record<string, number> = { test: 1, utility: 2, feature: 3, core: 4 };
  return values[category] || 2;
}
```

### Step 2: Dimension Bar

Create `components/patterns/dimension-bar.tsx`:
```typescript
type Props = {
  label: string;
  value: number;
  max: number;
  sublabel?: string;
};

export function DimensionBar({ label, value, max, sublabel }: Props) {
  const percentage = Math.min((value / max) * 100, 100);
  const color = percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        {sublabel && <span className="text-gray-500">{sublabel}</span>}
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

### Step 3: Tier Badge

Create `components/patterns/tier-badge.tsx`:
```typescript
import type { PatternTier } from '@/lib/db/types';

const tierStyles: Record<PatternTier, string> = {
  strong: 'bg-green-100 text-green-800 border-green-300',
  emerging: 'bg-blue-100 text-blue-800 border-blue-300',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  legacy: 'bg-orange-100 text-orange-800 border-orange-300',
  weak: 'bg-red-100 text-red-800 border-red-300',
};

export function TierBadge({ tier }: { tier: PatternTier }) {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${tierStyles[tier]}`}>
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  );
}
```

### Step 4: Triage Queue with Keyboard Navigation

Create `hooks/use-keyboard-navigation.ts`:
```typescript
'use client';

import { useCallback, useEffect, useState } from 'react';

type Actions = {
  onPromote?: () => void;
  onReject?: () => void;
  onDefer?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
};

export function useKeyboardNavigation<T>(
  items: T[],
  actions: Actions
) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'j':
          event.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
          actions.onNext?.();
          break;
        case 'k':
          event.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          actions.onPrev?.();
          break;
        case 'p':
          event.preventDefault();
          actions.onPromote?.();
          break;
        case 'r':
          event.preventDefault();
          actions.onReject?.();
          break;
        case 'd':
          event.preventDefault();
          actions.onDefer?.();
          break;
      }
    },
    [items.length, actions]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    selectedIndex,
    selectedItem: items[selectedIndex],
    setSelectedIndex,
  };
}
```

Create `components/patterns/triage-queue.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import { PatternCard } from './pattern-card';
import { PromoteModal } from './actions/promote-modal';
import { RejectModal } from './actions/reject-modal';
import type { Pattern } from '@/lib/db/types';

type Props = {
  patterns: Pattern[];
  onPromote: (id: string, data: { severity: string; rationale: string }) => void;
  onReject: (id: string, reason?: string) => void;
  onDefer: (id: string) => void;
};

export function TriageQueue({ patterns, onPromote, onReject, onDefer }: Props) {
  const [promoteModal, setPromoteModal] = useState<Pattern | null>(null);
  const [rejectModal, setRejectModal] = useState<Pattern | null>(null);

  const { selectedIndex, selectedItem } = useKeyboardNavigation(patterns, {
    onPromote: () => selectedItem && setPromoteModal(selectedItem),
    onReject: () => selectedItem && setRejectModal(selectedItem),
    onDefer: () => selectedItem && onDefer(selectedItem.id),
  });

  // Decision D17: Queue sorting
  const sortedPatterns = [...patterns].sort((a, b) => {
    const tierPriority = { strong: 5, emerging: 4, moderate: 3, legacy: 2, weak: 1 };
    const scoreA = (tierPriority[a.tier || 'weak'] || 1) * 10000;
    const scoreB = (tierPriority[b.tier || 'weak'] || 1) * 10000;
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500">
        Use <kbd>j</kbd>/<kbd>k</kbd> to navigate, <kbd>p</kbd>romote, <kbd>r</kbd>eject, <kbd>d</kbd>efer
      </div>

      <div className="space-y-2">
        {sortedPatterns.map((pattern, index) => (
          <PatternCard
            key={pattern.id}
            pattern={pattern}
            isSelected={index === selectedIndex}
            onClick={() => {}}
          />
        ))}
      </div>

      {promoteModal && (
        <PromoteModal
          pattern={promoteModal}
          onConfirm={(data) => {
            onPromote(promoteModal.id, data);
            setPromoteModal(null);
          }}
          onCancel={() => setPromoteModal(null)}
        />
      )}

      {rejectModal && (
        <RejectModal
          pattern={rejectModal}
          onConfirm={(reason) => {
            onReject(rejectModal.id, reason);
            setRejectModal(null);
          }}
          onCancel={() => setRejectModal(null)}
        />
      )}
    </div>
  );
}
```

### Step 5: Promote Modal

Create `components/patterns/actions/promote-modal.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import type { Pattern } from '@/lib/db/types';

type Props = {
  pattern: Pattern;
  onConfirm: (data: { severity: string; rationale: string }) => void;
  onCancel: () => void;
};

export function PromoteModal({ pattern, onConfirm, onCancel }: Props) {
  const [severity, setSeverity] = useState<'error' | 'warning' | 'info'>('warning');
  const [rationale, setRationale] = useState('');
  const [prReview, setPrReview] = useState(true);
  const [aiContext, setAiContext] = useState(true);

  return (
    <Modal title={`Promote: ${pattern.name}`} onClose={onCancel}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as any)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="error">Error (blocks merge)</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Rationale <span className="text-gray-500">(shown in PR comments)</span>
          </label>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Why is this pattern important?"
            className="w-full border rounded px-3 py-2 h-24"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={prReview}
              onChange={(e) => setPrReview(e.target.checked)}
            />
            <span className="text-sm">Enable PR review comments</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={aiContext}
              onChange={(e) => setAiContext(e.target.checked)}
            />
            <span className="text-sm">Include in AI context files</span>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onConfirm({ severity, rationale })}>
            Promote Pattern
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

### Step 6: Pattern List Page

Create `app/patterns/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server';
import { PatternGrid } from '@/components/patterns/pattern-grid';
import { FilterBar } from '@/components/patterns/filter-bar';

export default async function PatternsPage({
  searchParams,
}: {
  searchParams: { status?: string; tier?: string; repo?: string };
}) {
  const supabase = await createClient();

  let query = supabase.from('patterns').select(`
    *,
    repos (name, full_name),
    pattern_evidence (count)
  `);

  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }
  if (searchParams.tier) {
    query = query.eq('tier', searchParams.tier);
  }
  if (searchParams.repo) {
    query = query.eq('repo_id', searchParams.repo);
  }

  const { data: patterns } = await query.order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patterns</h1>
        <a href="/patterns/triage" className="text-blue-600 hover:underline">
          Open Triage Queue →
        </a>
      </div>

      <FilterBar />

      <PatternGrid patterns={patterns || []} />
    </div>
  );
}
```

### Step 7: Triage Page

Create `app/patterns/triage/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server';
import { TriageQueueClient } from './triage-queue-client';

export default async function TriagePage() {
  const supabase = await createClient();

  const { data: patterns } = await supabase
    .from('patterns')
    .select('*, pattern_evidence (*)')
    .eq('status', 'candidate')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Pattern Triage Queue</h1>
      <TriageQueueClient initialPatterns={patterns || []} />
    </div>
  );
}
```

### Step 8: Evidence Manager

Create `components/patterns/evidence-manager.tsx`:
```typescript
'use client';

import { useState } from 'react';
import type { Evidence } from '@/lib/db/types';

type Props = {
  patternId: string;
  evidence: Evidence[];
  onAdd: (filePath: string) => void;
  onRemove: (evidenceId: string) => void;
  onMarkCanonical: (evidenceId: string) => void;
};

export function EvidenceManager({
  patternId,
  evidence,
  onAdd,
  onRemove,
  onMarkCanonical,
}: Props) {
  const [newPath, setNewPath] = useState('');

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Evidence Files</h3>

      <div className="space-y-2">
        {evidence.map((e) => (
          <div
            key={e.id}
            className={`flex items-center justify-between p-2 rounded border ${
              e.isCanonical ? 'border-green-500 bg-green-50' : ''
            } ${e.isStale ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{e.filePath}</span>
              {e.startLine && (
                <span className="text-xs text-gray-500">
                  L{e.startLine}-{e.endLine}
                </span>
              )}
              {e.isStale && (
                <span className="text-xs text-orange-600">stale</span>
              )}
              {e.isCanonical && (
                <span className="text-xs text-green-600">canonical</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!e.isCanonical && (
                <button
                  onClick={() => onMarkCanonical(e.id)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark canonical
                </button>
              )}
              <button
                onClick={() => onRemove(e.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newPath}
          onChange={(e) => setNewPath(e.target.value)}
          placeholder="path/to/file.ts"
          className="flex-1 border rounded px-3 py-1 text-sm"
        />
        <button
          onClick={() => {
            onAdd(newPath);
            setNewPath('');
          }}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          Add Evidence
        </button>
      </div>
    </div>
  );
}
```

## Output Specification

After running this skill, the following should exist:

### Files Created
```
app/patterns/
├── page.tsx              # Pattern dashboard
├── triage/
│   ├── page.tsx          # Triage queue page
│   └── triage-queue-client.tsx
└── [id]/
    └── page.tsx          # Pattern detail

app/repos/[id]/patterns/
└── page.tsx              # Repo-specific patterns

components/patterns/
├── pattern-list.tsx
├── pattern-card.tsx
├── pattern-grid.tsx
├── confidence-card.tsx
├── dimension-bar.tsx
├── tier-badge.tsx
├── health-warnings.tsx
├── insight-panel.tsx
├── triage-queue.tsx
├── filter-bar.tsx
├── evidence-list.tsx
├── evidence-manager.tsx
├── backtest-preview.tsx
├── filesystem-card.tsx
├── duplicate-card.tsx
└── actions/
    ├── promote-modal.tsx
    └── reject-modal.tsx

hooks/
├── use-keyboard-navigation.ts
└── use-extraction-progress.ts
```

### Validation Checks
- [ ] Triage queue navigable with j/k keys
- [ ] p/r/d shortcuts trigger correct actions
- [ ] Confidence dimensions display correctly
- [ ] Promote/Reject/Defer update database
- [ ] Backtest violations display

## Key Decisions Referenced

| ID | Decision | Impact |
|----|----------|--------|
| D11 | Confidence visualization | 4 dimension bars |
| D12 | Backtest engagement | Show violation preview before promote |
| D13 | Progressive disclosure | Expand details on demand |
| D17 | Queue sorting | tier × 10000 + backtestViolations |
| D18 | Rejection modal | Optional reason, quick action |
| D19 | Severity dropdown | error/warning/info options |
| D21 | Evidence management | Add/remove/mark canonical |
| D30 | Enforcement toggles | prReview + aiContext checkboxes |

## Handoffs

- **Pattern promoted** → enforcement-specialist checks future PRs
- **Pattern promoted** → context-files-specialist regenerates context
- **Backtest data** → Comes from extraction-specialist violation module
