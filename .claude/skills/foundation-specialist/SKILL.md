---
name: foundation-specialist
description: |
  Handles Next.js project setup, Supabase configuration, Trigger.dev integration, and database
  schema/migrations for Reasoning Substrate. Invoke when working on: project initialization,
  environment configuration, database tables, migrations, TypeScript types from schema,
  Trigger.dev job scaffolding, or any files in supabase/migrations/, lib/db/, lib/supabase/,
  or trigger.config.ts.
license: MIT
compatibility: Next.js 14+, Supabase, Trigger.dev, TypeScript, Node.js 18+
allowed-tools: Read Write Bash(npm:*) Bash(npx:*) Bash(git:*) Glob Grep
metadata:
  role: domain-specialist
  task-count: 9
  critical-path: true
  phase: 1-2
---

# Foundation Specialist

## Purpose

Set up core infrastructure: Next.js, Supabase, Trigger.dev, and database schema. This is the foundational layer that all other specialists depend on.

## When to Activate This Skill

- Project initialization requests
- Database schema or migration work
- Environment configuration
- Trigger.dev job scaffolding
- Working on files in:
  - `supabase/migrations/*`
  - `lib/db/*`
  - `lib/supabase/*`
  - `trigger.config.ts`

## Prerequisites

Before starting, ensure:
- [ ] Supabase account and project created
- [ ] Vercel account created
- [ ] Trigger.dev account created
- [ ] Environment variables documented in `human-intervention-blockers.md`

## Tasks Owned

| Task ID | Description | Priority |
|---------|-------------|----------|
| task-1.1-nextjs-init | Initialize Next.js 14 project | P0 |
| task-1.2-supabase-setup | Configure Supabase clients | P0 |
| task-1.3-triggerdev-setup | Initialize Trigger.dev | P0 |
| task-1.6-core-schema | Create database schema | P0 |
| task-1.9-env-config | Environment configuration | P0 |
| task-6.1a-error-fields | Add error fields to status tables | P1 |
| task-6.2-retry-config | Configure retry logic | P1 |
| task-6.9-logging | Set up structured logging | P2 |

## Workflow

### Step 1: Project Initialization

1. Create Next.js 14 project with App Router:
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   ```

2. Configure TypeScript strict mode in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noUncheckedIndexedAccess": true,
       "forceConsistentCasingInFileNames": true
     }
   }
   ```

3. Install core dependencies:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr zod
   npm install @anthropic-ai/sdk @octokit/rest @octokit/auth-app
   npm install -D @types/node
   ```

4. Create base directory structure:
   ```
   src/
   ├── app/
   │   ├── api/
   │   ├── auth/
   │   └── (dashboard)/
   ├── components/
   │   └── ui/
   ├── lib/
   │   ├── api/
   │   ├── db/
   │   ├── errors/
   │   ├── supabase/
   │   └── types/
   ├── hooks/
   └── jobs/
   ```

### Step 2: Supabase Configuration

1. Create `lib/supabase/client.ts` (browser client):
   ```typescript
   import { createBrowserClient } from '@supabase/ssr';

   export function createClient() {
     return createBrowserClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     );
   }
   ```

2. Create `lib/supabase/server.ts` (server client):
   ```typescript
   import { createServerClient, type CookieOptions } from '@supabase/ssr';
   import { cookies } from 'next/headers';

   export async function createClient() {
     const cookieStore = await cookies();

     return createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           get(name: string) {
             return cookieStore.get(name)?.value;
           },
           set(name: string, value: string, options: CookieOptions) {
             cookieStore.set({ name, value, ...options });
           },
           remove(name: string, options: CookieOptions) {
             cookieStore.set({ name, value: '', ...options });
           },
         },
       }
     );
   }
   ```

3. Create `lib/supabase/admin.ts` (service role client):
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   export function createAdminClient() {
     return createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!,
       { auth: { persistSession: false } }
     );
   }
   ```

### Step 3: Database Schema

Create migration file `supabase/migrations/001_initial_schema.sql`:

```sql
-- Users (synced from Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Repositories
CREATE TABLE repos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  installation_id BIGINT NOT NULL,
  ingestion_status TEXT DEFAULT 'pending' CHECK (ingestion_status IN ('pending', 'ingesting', 'ingested', 'failed')),
  ingestion_error TEXT,
  extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'extracting', 'extracted', 'failed')),
  extraction_error TEXT,
  token_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patterns
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('code', 'file-naming', 'file-structure')),
  status TEXT DEFAULT 'candidate' CHECK (status IN ('candidate', 'authoritative', 'rejected', 'archived')),
  tier TEXT CHECK (tier IN ('strong', 'moderate', 'weak', 'emerging', 'legacy')),
  confidence JSONB NOT NULL,
  health_signals JSONB,
  severity TEXT CHECK (severity IN ('error', 'warning', 'info')),
  rationale TEXT,
  promoted_by UUID REFERENCES users(id),
  promoted_at TIMESTAMPTZ,
  rejection_reason TEXT,
  pr_review_enabled BOOLEAN DEFAULT FALSE,
  ai_context_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pattern Evidence
CREATE TABLE pattern_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID REFERENCES patterns(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  start_line INTEGER,
  end_line INTEGER,
  content_hash TEXT,
  author TEXT,
  commit_sha TEXT,
  commit_date TIMESTAMPTZ,
  is_canonical BOOLEAN DEFAULT FALSE,
  is_stale BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Repo Files (for autocomplete)
CREATE TABLE repo_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  language TEXT,
  size_bytes INTEGER,
  UNIQUE(repo_id, path)
);

-- Pull Requests
CREATE TABLE pull_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
  github_pr_id INTEGER NOT NULL,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  state TEXT NOT NULL,
  diff_storage_path TEXT,
  analysis_status TEXT DEFAULT 'pending',
  analysis_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repo_id, github_pr_id)
);

-- Violations
CREATE TABLE violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pull_request_id UUID REFERENCES pull_requests(id) ON DELETE CASCADE,
  pattern_id UUID REFERENCES patterns(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  line_number INTEGER,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_by UUID REFERENCES users(id),
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pattern Evolution Requests
CREATE TABLE pattern_evolution_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID REFERENCES patterns(id) ON DELETE CASCADE,
  pull_request_id UUID REFERENCES pull_requests(id) ON DELETE CASCADE,
  evidence_id UUID REFERENCES pattern_evidence(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  diff_summary TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Context File Configs
CREATE TABLE context_file_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('claude', 'cursor')),
  file_path TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ,
  UNIQUE(repo_id, format)
);

-- Provenance
CREATE TABLE provenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID REFERENCES patterns(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES users(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_repos_user ON repos(user_id);
CREATE INDEX idx_patterns_repo ON patterns(repo_id);
CREATE INDEX idx_patterns_status ON patterns(status);
CREATE INDEX idx_pattern_evidence_pattern ON pattern_evidence(pattern_id);
CREATE INDEX idx_violations_pr ON violations(pull_request_id);
CREATE INDEX idx_violations_pattern ON violations(pattern_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE repo_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE pull_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_evolution_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_file_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE provenance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own repos" ON repos FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own repos" ON repos FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view patterns in own repos" ON patterns FOR SELECT
  USING (repo_id IN (SELECT id FROM repos WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage patterns in own repos" ON patterns FOR ALL
  USING (repo_id IN (SELECT id FROM repos WHERE user_id = auth.uid()));

-- Similar policies for other tables...
```

### Step 4: Generate TypeScript Types

Create `lib/db/types.ts`:
```typescript
export type User = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Repo = {
  id: string;
  userId: string;
  name: string;
  fullName: string;
  installationId: number;
  ingestionStatus: 'pending' | 'ingesting' | 'ingested' | 'failed';
  ingestionError: string | null;
  extractionStatus: 'pending' | 'extracting' | 'extracted' | 'failed';
  extractionError: string | null;
  tokenCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PatternType = 'code' | 'file-naming' | 'file-structure';
export type PatternStatus = 'candidate' | 'authoritative' | 'rejected' | 'archived';
export type PatternTier = 'strong' | 'moderate' | 'weak' | 'emerging' | 'legacy';
export type Severity = 'error' | 'warning' | 'info';

export type Confidence = {
  evidence: { instanceCount: number; consistency: number };
  adoption: { uniqueAuthors: number };
  establishment: { ageCategory: 'new' | 'recent' | 'established' | 'legacy' };
  location: { codeCategory: 'core' | 'feature' | 'utility' | 'test' };
};

export type Pattern = {
  id: string;
  repoId: string;
  name: string;
  description: string;
  type: PatternType;
  status: PatternStatus;
  tier: PatternTier | null;
  confidence: Confidence;
  healthSignals: unknown | null;
  severity: Severity | null;
  rationale: string | null;
  promotedBy: string | null;
  promotedAt: string | null;
  rejectionReason: string | null;
  prReviewEnabled: boolean;
  aiContextEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

// ... additional types
```

### Step 5: Trigger.dev Setup

1. Install Trigger.dev:
   ```bash
   npm install @trigger.dev/sdk @trigger.dev/nextjs
   ```

2. Create `trigger.config.ts`:
   ```typescript
   import { defineConfig } from '@trigger.dev/sdk/v3';

   export default defineConfig({
     project: 'reasoning-substrate',
     runtime: 'node',
     logLevel: 'info',
     retries: {
       enabledInDev: true,
       default: {
         maxAttempts: 3,
         minTimeoutInMs: 1000,
         maxTimeoutInMs: 30000,
         factor: 2,
       },
     },
   });
   ```

3. Create `jobs/index.ts` scaffold:
   ```typescript
   // Job exports will be added by domain specialists
   export * from './ingest-repo';
   export * from './extract-patterns';
   export * from './analyze-pr';
   export * from './sync-context-files';
   ```

### Step 6: Environment Configuration

Create `.env.example`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# GitHub App
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Anthropic
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Trigger.dev
TRIGGER_SECRET_KEY=
```

## Output Specification

After running this skill, the following should exist:

### Project Structure
```
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   │   ├── db/types.ts
│   │   ├── supabase/client.ts
│   │   ├── supabase/server.ts
│   │   └── supabase/admin.ts
│   ├── hooks/
│   └── jobs/
├── supabase/
│   └── migrations/001_initial_schema.sql
├── trigger.config.ts
├── .env.example
└── package.json
```

### Validation Checks
- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] Migrations can be applied: `npx supabase db push`
- [ ] Supabase client connects: verify in browser console
- [ ] Trigger.dev initialized: `npx trigger.dev dev`

## Error Handling

| Error | Resolution |
|-------|------------|
| Missing environment variables | Check `.env.example`, verify all required vars set |
| Migration conflicts | Provide rollback SQL, check for conflicting changes |
| Supabase connection fails | Verify project URL and keys, check project status |
| TypeScript errors | Run `npx tsc --noEmit` to identify issues |

## Key Decisions Referenced

| ID | Decision | Impact |
|----|----------|--------|
| D5 | Multi-repo from day 1 | `repoId` is FK on all tables |
| D6 | Own database | Using Supabase Postgres |
| D7 | Tech stack selection | Next.js + Supabase + Trigger.dev |
| D15 | No token storage | Only store `installationId` |

## Handoffs

- **After schema complete** → github-integration-specialist can implement auth
- **After Trigger.dev ready** → ingestion/extraction specialists can create jobs
- **Patterns from** → backend-architect for error handling, logging patterns
