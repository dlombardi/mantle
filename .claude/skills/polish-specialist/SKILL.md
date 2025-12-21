---
name: polish-specialist
description: |
  Handles production polish for Reasoning Substrate: loading states, empty states, error UI,
  settings, impact digest, auto-archive jobs, and general UX refinements. Invoke when working on:
  loading spinners, skeleton loaders, empty states, error displays, settings pages, dashboard
  widgets, scheduled jobs, or files in components/ui/, app/settings/, jobs/auto-archive.ts.
license: MIT
compatibility: React 18+, Next.js 14+, Tailwind CSS, Trigger.dev
allowed-tools: Read Write Bash(npm:*) Glob Grep
metadata:
  role: domain-specialist
  task-count: 17
  critical-path: false
  phase: 6-7
  consults: frontend-architect
---

# Polish Specialist

## Purpose

Add production-ready UI polish and maintenance features. This skill runs after core features are complete, adding the finishing touches that make the application feel professional.

## When to Activate This Skill

- Loading states implementation
- Empty states design
- Settings pages
- Dashboard widgets
- Scheduled maintenance jobs
- Working on files in:
  - `components/ui/*`
  - `app/settings/*`
  - `jobs/auto-archive.ts`
  - `lib/metrics/*`

## Prerequisites

Before starting, ensure:
- [ ] All core features working (other domain specialists complete)
- [ ] Frontend patterns established (via frontend-architect)
- [ ] Patterns and violations exist in database

**Consult**: `frontend-architect` patterns in `docs/frontend/` before starting.

## Tasks Owned

| Task ID | Description | Priority |
|---------|-------------|----------|
| task-6.3-loading-states | Loading spinners and skeletons | P1 |
| task-6.4-empty-states | Helpful empty states with CTAs | P1 |
| task-6.6a-storage-cleanup | Cleanup on repo disconnect | P2 |
| task-6.7-impact-digest | Time saved metrics widget | P1 |
| task-6.8-settings-ui | Settings page | P1 |
| task-6.8a-evolution-badge | Pending evolution badge | P1 |
| task-6.10-auto-archive | Daily auto-archive job | P2 |

## Workflow

### Step 1: Loading Components

Create `components/ui/loading.tsx`:
```typescript
import { cn } from '@/lib/utils';

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200 border-t-blue-600',
        sizes[size],
        className
      )}
    />
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="lg" />
    </div>
  );
}

export function LoadingInline() {
  return (
    <span className="inline-flex items-center gap-2">
      <Spinner size="sm" />
      <span className="text-gray-500">Loading...</span>
    </span>
  );
}
```

Create `components/ui/skeleton.tsx`:
```typescript
import { cn } from '@/lib/utils';

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-gray-200',
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 flex gap-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 flex gap-4 border-t">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
```

### Step 2: Empty States

Create `components/ui/empty-state.tsx`:
```typescript
import Link from 'next/link';

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-6">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

// Pre-built empty states for common scenarios
export function NoReposEmptyState() {
  return (
    <EmptyState
      icon={<FolderIcon className="w-12 h-12" />}
      title="No repositories connected"
      description="Connect a GitHub repository to start extracting and enforcing patterns."
      action={{ label: 'Connect Repository', href: '/repos/connect' }}
    />
  );
}

export function NoPatternsEmptyState() {
  return (
    <EmptyState
      icon={<SparklesIcon className="w-12 h-12" />}
      title="No patterns found"
      description="Patterns will appear here after extraction completes. Try a different repository or wait for extraction to finish."
    />
  );
}

export function NoViolationsEmptyState() {
  return (
    <EmptyState
      icon={<CheckCircleIcon className="w-12 h-12" />}
      title="All clear!"
      description="No violations found. Your code follows all established patterns."
    />
  );
}

export function QueueEmptyState() {
  return (
    <EmptyState
      icon={<InboxIcon className="w-12 h-12" />}
      title="Triage queue is empty"
      description="All pattern candidates have been reviewed. New patterns will appear after the next extraction."
    />
  );
}

// Icon components (simplified)
function FolderIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
}

function SparklesIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
}

function CheckCircleIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function InboxIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>;
}
```

### Step 3: Impact Digest Widget

Create `lib/metrics/impact.ts`:
```typescript
import { createAdminClient } from '@/lib/supabase/admin';

// Decision D12: Time saved = violations × 15 min
const MINUTES_SAVED_PER_VIOLATION = 15;

export type ImpactMetrics = {
  violationsLast7Days: number;
  timeSavedMinutes: number;
  timeSavedFormatted: string;
  topPatterns: Array<{ name: string; count: number }>;
};

export async function calculateImpact(repoId?: string): Promise<ImpactMetrics> {
  const supabase = createAdminClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let query = supabase
    .from('violations')
    .select('id, pattern_id, patterns(name)')
    .gte('created_at', sevenDaysAgo.toISOString());

  if (repoId) {
    query = query.eq('patterns.repo_id', repoId);
  }

  const { data: violations } = await query;

  if (!violations || violations.length === 0) {
    return {
      violationsLast7Days: 0,
      timeSavedMinutes: 0,
      timeSavedFormatted: '0 minutes',
      topPatterns: [],
    };
  }

  const timeSavedMinutes = violations.length * MINUTES_SAVED_PER_VIOLATION;

  // Calculate top patterns
  const patternCounts = violations.reduce((acc, v) => {
    const name = (v as any).patterns?.name || 'Unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPatterns = Object.entries(patternCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  return {
    violationsLast7Days: violations.length,
    timeSavedMinutes,
    timeSavedFormatted: formatTimeSaved(timeSavedMinutes),
    topPatterns,
  };
}

function formatTimeSaved(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours} hours`;
  return `${hours}h ${remainingMinutes}m`;
}
```

Create `components/dashboard/impact-digest.tsx`:
```typescript
import { calculateImpact } from '@/lib/metrics/impact';

export async function ImpactDigest({ repoId }: { repoId?: string }) {
  const metrics = await calculateImpact(repoId);

  if (metrics.violationsLast7Days === 0) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <h3 className="font-medium mb-2">Impact This Week</h3>
        <p className="text-gray-500 text-sm">
          No violations caught yet. Patterns will start saving time once PRs are analyzed.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6 space-y-4">
      <h3 className="font-medium">Impact This Week</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-3xl font-bold text-green-600">
            {metrics.timeSavedFormatted}
          </p>
          <p className="text-sm text-gray-500">estimated time saved</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-blue-600">
            {metrics.violationsLast7Days}
          </p>
          <p className="text-sm text-gray-500">violations caught</p>
        </div>
      </div>

      {metrics.topPatterns.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Top patterns</p>
          <div className="space-y-1">
            {metrics.topPatterns.map((p) => (
              <div key={p.name} className="flex justify-between text-sm">
                <span className="text-gray-600">{p.name}</span>
                <span className="text-gray-500">{p.count} violations</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Step 4: Evolution Badge

Create `hooks/use-pending-evolutions.ts`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function usePendingEvolutions() {
  const [count, setCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    supabase
      .from('pattern_evolution_requests')
      .select('id', { count: 'exact' })
      .eq('status', 'pending')
      .then(({ count }) => setCount(count || 0));

    // Subscribe to changes
    const channel = supabase
      .channel('evolution-count')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pattern_evolution_requests' },
        () => {
          supabase
            .from('pattern_evolution_requests')
            .select('id', { count: 'exact' })
            .eq('status', 'pending')
            .then(({ count }) => setCount(count || 0));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return count;
}
```

Create `components/nav/evolution-badge.tsx`:
```typescript
'use client';

import Link from 'next/link';
import { usePendingEvolutions } from '@/hooks/use-pending-evolutions';

export function EvolutionBadge() {
  const count = usePendingEvolutions();

  if (count === 0) return null;

  return (
    <Link
      href="/patterns/evolution"
      className="relative inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm hover:bg-orange-200"
    >
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 text-white text-xs items-center justify-center">
          {count}
        </span>
      </span>
      Evolution Reviews
    </Link>
  );
}
```

### Step 5: Settings Page

Create `app/settings/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: repos } = await supabase
    .from('repos')
    .select('*')
    .eq('user_id', user.id);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Account Section */}
      <section className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-medium">Account</h2>
        <div className="flex items-center gap-4">
          <img
            src={user.user_metadata?.avatar_url}
            alt=""
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-medium">{user.user_metadata?.full_name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </section>

      {/* Connected Repositories */}
      <section className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-medium">Connected Repositories</h2>

        {repos && repos.length > 0 ? (
          <div className="space-y-2">
            {repos.map((repo) => (
              <div key={repo.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{repo.full_name}</p>
                  <p className="text-sm text-gray-500">
                    {repo.ingestion_status} · {repo.token_count?.toLocaleString()} tokens
                  </p>
                </div>
                <form action={`/api/repos/${repo.id}/disconnect`} method="POST">
                  <button
                    type="submit"
                    className="text-sm text-red-600 hover:underline"
                  >
                    Disconnect
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No repositories connected.</p>
        )}

        <a
          href="/repos/connect"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded"
        >
          Connect Repository
        </a>
      </section>

      {/* Danger Zone */}
      <section className="bg-white rounded-lg border border-red-200 p-6 space-y-4">
        <h2 className="text-lg font-medium text-red-600">Danger Zone</h2>
        <p className="text-sm text-gray-600">
          Deleting your account will remove all data including repositories, patterns, and violations.
        </p>
        <button className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50">
          Delete Account
        </button>
      </section>
    </div>
  );
}
```

### Step 6: Storage Cleanup

Create `lib/storage/cleanup.ts`:
```typescript
import { createAdminClient } from '@/lib/supabase/admin';

export async function cleanupRepoStorage(repoId: string) {
  const supabase = createAdminClient();

  try {
    // Get repo info for storage path
    const { data: repo } = await supabase
      .from('repos')
      .select('full_name')
      .eq('id', repoId)
      .single();

    if (!repo) return;

    // List all files in the repo's storage folder
    const { data: files } = await supabase.storage
      .from('pr_diffs')
      .list(repo.full_name.replace('/', '/'));

    if (files && files.length > 0) {
      const paths = files.map((f) => `${repo.full_name.replace('/', '/')}/${f.name}`);
      await supabase.storage.from('pr_diffs').remove(paths);
    }

    console.log(`Cleaned up storage for repo ${repoId}`);
  } catch (error) {
    console.error(`Storage cleanup failed for repo ${repoId}:`, error);
    // Non-blocking - log but don't throw
  }
}
```

### Step 7: Auto-Archive Job

Create `jobs/auto-archive.ts`:
```typescript
import { schedules, logger } from '@trigger.dev/sdk/v3';
import { createAdminClient } from '@/lib/supabase/admin';

// Decision D13: Auto-archive after 60 days
const ARCHIVE_THRESHOLD_DAYS = 60;

export const autoArchiveJob = schedules.task({
  id: 'auto-archive',
  // Run daily at 03:00 UTC
  cron: '0 3 * * *',
  run: async () => {
    const supabase = createAdminClient();

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - ARCHIVE_THRESHOLD_DAYS);

    // Find weak patterns that haven't been reviewed
    const { data: patterns, error } = await supabase
      .from('patterns')
      .select('id, name, repo_id')
      .eq('status', 'candidate')
      .eq('tier', 'weak')
      .lt('created_at', thresholdDate.toISOString());

    if (error) {
      logger.error('Failed to fetch patterns for auto-archive', { error });
      throw error;
    }

    if (!patterns || patterns.length === 0) {
      logger.info('No patterns to auto-archive');
      return { archived: 0 };
    }

    logger.info(`Auto-archiving ${patterns.length} weak patterns`);

    // Update patterns to rejected
    const { error: updateError } = await supabase
      .from('patterns')
      .update({
        status: 'rejected',
        rejection_reason: 'Auto-dismissed: insufficient evidence after 60 days',
      })
      .in('id', patterns.map((p) => p.id));

    if (updateError) {
      logger.error('Failed to auto-archive patterns', { error: updateError });
      throw updateError;
    }

    // Log provenance for each
    for (const pattern of patterns) {
      await supabase.from('provenance').insert({
        pattern_id: pattern.id,
        action: 'auto-rejected',
        details: { reason: 'Weak tier, unreviewed for 60+ days' },
      });
    }

    logger.info(`Auto-archived ${patterns.length} patterns`);
    return { archived: patterns.length };
  },
});
```

## Output Specification

After running this skill, the following should exist:

### Files Created
```
components/ui/
├── loading.tsx          # Spinner, LoadingPage, LoadingInline
├── skeleton.tsx         # Skeleton, SkeletonCard, SkeletonList
└── empty-state.tsx      # EmptyState, pre-built variants

components/dashboard/
└── impact-digest.tsx    # Time saved widget

components/nav/
└── evolution-badge.tsx  # Pending reviews badge

lib/metrics/
└── impact.ts            # Impact calculation

lib/storage/
└── cleanup.ts           # Storage cleanup utility

hooks/
└── use-pending-evolutions.ts

app/settings/
└── page.tsx             # Settings page

jobs/
└── auto-archive.ts      # Daily cleanup job
```

### Validation Checks
- [ ] Loading states appear during data fetching
- [ ] Empty states show helpful CTAs
- [ ] Settings page displays correctly
- [ ] Impact metrics are accurate
- [ ] Evolution badge shows pending count
- [ ] Auto-archive job runs daily

## Key Decisions Referenced

| ID | Decision | Impact |
|----|----------|--------|
| D12 | Time saved formula | violations × 15 minutes |
| D13 | Auto-archive threshold | 60 days for weak patterns |
| D18 | Weak patterns auto-rejected | Automatic cleanup |

## Error Handling

| Error | Resolution |
|-------|------------|
| Metrics unavailable | Show fallback message |
| Cleanup fails | Log error, don't block |
| Auto-archive fails | Retry next day |

## Success Signals

- All states (loading, empty, error) handled gracefully
- Settings page functional
- Impact metrics displayed accurately
- Auto-archive running daily without errors
- Application feels polished and professional

## Handoffs

- **Final polish** → After all other specialists complete
- **Receives from** → All other specialists (polishing their features)
- **No downstream** → This is the final phase
