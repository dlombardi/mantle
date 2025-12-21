---
name: foundation-specialist
description: |
  Handles Turborepo monorepo setup, NestJS API configuration, Drizzle ORM schema, Supabase migrations,
  and Trigger.dev integration for Mantle. Invoke when working on: project initialization, database
  schema/migrations, environment configuration, Drizzle types, NestJS modules, or files in
  supabase/migrations/, apps/api/src/lib/db/, apps/api/src/drizzle/, or trigger configuration.
license: MIT
compatibility: Next.js 14+, NestJS 10+, Drizzle ORM, Supabase, Trigger.dev, Bun, TypeScript
allowed-tools: Read Write Bash(bun:*) Bash(bunx:*) Bash(git:*) Glob Grep
metadata:
  role: domain-specialist
  task-count: 9
  critical-path: true
  phase: 1-2
  status: implemented
---

# Foundation Specialist

## Purpose

Set up core infrastructure: Turborepo monorepo with Next.js frontend and NestJS backend, Drizzle ORM for type-safe database access, Supabase for auth and Postgres, and Trigger.dev for background jobs. This is the foundational layer that all other specialists depend on.

## Current Implementation Status

**COMPLETED** - The following has been implemented:
- [x] Turborepo monorepo with `apps/web` (Next.js) and `apps/api` (NestJS)
- [x] Drizzle ORM with 12 tables and typed schema
- [x] 14 Postgres enums for type safety
- [x] RLS policies with `user_owns_repo()` helper
- [x] User sync trigger from auth.users
- [x] NestJS modules: DrizzleModule, SupabaseModule, TriggerModule, HealthModule
- [x] Environment configuration in `.env.local.example`

## When to Activate This Skill

- Database schema modifications or new migrations
- Adding new Drizzle tables or relations
- NestJS module configuration
- Trigger.dev job scaffolding
- Working on files in:
  - `supabase/migrations/*`
  - `apps/api/src/lib/db/*`
  - `apps/api/src/drizzle/*`
  - `apps/api/drizzle.config.ts`

## Architecture Overview

```
mantle/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── app/                # App Router pages
│   │   ├── components/         # React components
│   │   └── lib/                # Frontend utilities
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── drizzle/        # DrizzleModule + DrizzleService
│       │   ├── health/         # Health checks
│       │   ├── lib/db/         # Schema + types
│       │   ├── supabase/       # SupabaseModule (auth)
│       │   └── trigger/        # TriggerModule (jobs)
│       └── drizzle.config.ts   # Drizzle Kit config
├── supabase/
│   ├── config.toml             # Supabase CLI config
│   └── migrations/             # SQL migrations
├── turbo.json                  # Turborepo config
└── .env.local.example          # Environment template
```

## Database Schema (12 Tables)

### Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | Auth sync from Supabase | `id`, `github_id`, `github_username` |
| `repos` | Repository scope (D5) | `user_id`, `github_id`, `installation_id`, `ingestion_status` |
| `repo_files` | File inventory | `repo_id`, `file_path`, `language` |
| `patterns` | Core entity | `repo_id`, `type`, `status`, `confidence_score` (JSONB) |
| `pattern_evidence` | Code-level evidence | `pattern_id`, `file_path`, `snippet`, `author_username` |
| `filesystem_pattern_evidence` | Path-only evidence | `pattern_id`, `file_path`, `is_directory` |
| `context_file_configs` | AI context files | `repo_id`, `format`, `target_path` |
| `provenance` | Decision history | `pattern_id`, `type`, `url` |
| `pull_requests` | PR tracking | `repo_id`, `github_pr_number`, `analysis_status` |
| `violations` | PR violations | `pull_request_id`, `pattern_id`, `severity` |
| `backtest_violations` | Historical impact | `pattern_id`, `pr_number` |
| `pattern_evolution_requests` | Evolution tracking | `pattern_id`, `pull_request_id`, `status` |

### Enums (14 Total)

```typescript
// Status enums
ingestion_status: 'pending' | 'ingesting' | 'ingested' | 'failed'
extraction_status: 'pending' | 'extracting' | 'extracted' | 'failed'
analysis_status: 'pending' | 'analyzing' | 'analyzed' | 'failed' | 'skipped'
pattern_evolution_status: 'pending' | 'accepted' | 'rejected' | 'historical' | 'cancelled'

// Pattern enums
pattern_type: 'structural' | 'behavioral' | 'api' | 'testing' | 'naming' | 'dependency' | 'file-naming' | 'file-structure' | 'other'
pattern_status: 'candidate' | 'authoritative' | 'rejected' | 'deprecated' | 'deferred'
confidence_model: 'code' | 'filesystem'
confidence_tier: 'strong' | 'emerging' | 'moderate' | 'weak' | 'legacy'

// Other enums
violation_severity: 'error' | 'warning' | 'info'
violation_resolution: 'open' | 'fixed' | 'dismissed'
provenance_type: 'pull_request' | 'commit' | 'issue' | 'document' | 'slack' | 'adr' | 'other'
code_category: 'core' | 'feature' | 'frontend' | 'backend' | 'test' | 'config' | 'helper'
context_file_format: 'claude' | 'cursor'
context_file_sync_status: 'never' | 'synced' | 'pending'
evidence_source: 'extraction' | 'human'
```

### JSONB Types

```typescript
// 4-dimensional confidence for code patterns (D11)
interface PatternConfidence {
  tier: ConfidenceTier;
  evidence: { instanceCount: number; consistency: 'high' | 'medium' | 'low'; consistencyNote: string | null };
  adoption: { uniqueAuthors: number; authorUsernames: string[] };
  establishment: { oldestInstanceDate: string; newestInstanceDate: string; ageCategory: 'established' | 'maturing' | 'emerging' };
  location: { breakdown: Record<CodeCategory, number>; primary: CodeCategory };
  insight: string;
  suggestedActions: string[];
}

// 2-dimensional confidence for filesystem patterns (D34)
interface FilesystemPatternConfidence {
  tier: Exclude<ConfidenceTier, 'legacy'>;
  evidence: number;
  adoption: number;
}

// Health signals (D11)
interface PatternHealthSignals {
  hasWarnings: boolean;
  signals: HealthSignal[];
}

// Enforcement settings (D30)
interface PatternEnforcement {
  prReview: boolean;
  aiContext: boolean;
}
```

## Key Files

### Drizzle Schema
**Location:** `apps/api/src/lib/db/schema.ts`

Defines all 12 tables with:
- Proper foreign key relationships with CASCADE deletes
- Indexes for common query patterns
- JSONB columns with TypeScript type annotations
- Drizzle relations for query builder

### Drizzle Types
**Location:** `apps/api/src/lib/db/types.ts`

Contains:
- Enum arrays with `as const` for type inference
- TypeScript types derived from enums
- JSONB interface definitions
- Confidence tier thresholds

### DrizzleService
**Location:** `apps/api/src/drizzle/drizzle.service.ts`

NestJS injectable providing:
- Typed Drizzle database instance via `getDb()`
- Health check via `healthCheck()`
- Connection lifecycle management

### Migrations
**Location:** `supabase/migrations/`

- `0000_*.sql` - Schema DDL generated by Drizzle Kit
- `0001_rls_policies.sql` - RLS policies + user sync trigger

## Workflows

### Adding a New Table

1. Define table in `apps/api/src/lib/db/schema.ts`:
   ```typescript
   export const newTable = pgTable('new_table', {
     id: uuid('id').primaryKey().defaultRandom(),
     repoId: uuid('repo_id').notNull().references(() => repos.id, { onDelete: 'cascade' }),
     // ... columns
   }, (table) => [
     index('idx_new_table_repo').on(table.repoId),
   ]);
   ```

2. Add relations if needed:
   ```typescript
   export const newTableRelations = relations(newTable, ({ one }) => ({
     repo: one(repos, { fields: [newTable.repoId], references: [repos.id] }),
   }));
   ```

3. Generate migration:
   ```bash
   cd apps/api && bunx drizzle-kit generate
   ```

4. Push to Supabase:
   ```bash
   bunx supabase db push
   ```

### Adding a New Enum

1. Add to `apps/api/src/lib/db/types.ts`:
   ```typescript
   export const newStatusEnum = ['pending', 'active', 'completed'] as const;
   export type NewStatus = (typeof newStatusEnum)[number];
   ```

2. Add to schema:
   ```typescript
   export const newStatus = pgEnum('new_status', newStatusEnum);
   ```

3. Generate and push migration.

### Testing Database Connection

```bash
# Start API in dev mode
cd apps/api && bun run dev

# Check health endpoint
curl http://localhost:3001/api/health | jq .
```

Expected response:
```json
{
  "status": "degraded",
  "services": {
    "database": { "connected": true },
    "trigger": { "configured": false }
  }
}
```

## Environment Variables

**Location:** `.env.local.example`

```env
# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000

# Supabase
SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Drizzle connection)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# GitHub App
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=

# Trigger.dev
TRIGGER_SECRET_KEY=
TRIGGER_API_URL=https://api.trigger.dev

# Anthropic
ANTHROPIC_API_KEY=

# API Server
PORT=3001
```

## Validation Commands

```bash
# TypeScript check
bun run typecheck

# Build both apps
bun run build

# Lint
bun run lint

# Push migrations
bunx supabase db push

# Generate new migration from schema changes
cd apps/api && bunx drizzle-kit generate
```

## Key Decisions Referenced

| ID | Decision | Impact |
|----|----------|--------|
| D5 | Multi-repo from day 1 | `repoId` is FK on all tables |
| D6 | Own database | Using Supabase Postgres with Drizzle ORM |
| D7 | Tech stack | Turborepo + Next.js + NestJS + Supabase + Trigger.dev |
| D11 | 4-dimension confidence | JSONB `confidence_score` with evidence, adoption, establishment, location |
| D15 | No token storage | Only store `installationId`, generate tokens on-demand |
| D34 | Filesystem confidence | 2-dimension scoring for file patterns |

## RLS Security Model

All tables have RLS enabled with:

1. **User ownership** - Users can only access their own data
2. **Repo scoping** - Data scoped through `user_owns_repo(repo_id)` helper function
3. **Service role bypass** - Backend jobs use service role for system operations
4. **User sync trigger** - Automatically creates user record from `auth.users`

## Handoffs

- **After schema complete** → `github-integration-specialist` can implement OAuth
- **After Trigger.dev ready** → `ingestion-specialist` and `extraction-specialist` can create jobs
- **Patterns from** → `backend-architect` for API conventions, error handling
