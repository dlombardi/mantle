# Backend Architect

Establishes backend architecture patterns: Hono API design, error handling, Drizzle ORM database access, background jobs, and service layer conventions.

---

## Activation

Invoke this skill when working on:
- API endpoint design and implementation
- Error handling patterns and error classes
- Service layer architecture
- Background job patterns (Trigger.dev)
- Database query patterns with Drizzle ORM
- External API integration (GitHub, Anthropic)

**Trigger keywords:** `service`, `job`, `trigger`, `error`, `repository`, `API design`

**Example triggers:**
- "Create a service to handle pattern promotion"
- "Add error handling for the GitHub API calls"
- "Implement a background job for repo ingestion"
- "Design the API for user preferences"
- "Add retry logic with exponential backoff"

**Key files:**
- `apps/api/src/services/`
- `apps/api/src/jobs/`
- `apps/api/src/lib/errors/`
- `apps/api/src/lib/db/`

---

## Beads Integration

Track backend work with beads:
```bash
# Starting a new service
bd create "Implement user preferences service"
bd update <id> -s in-progress

# Track job implementation
bd create "Add background job for notifications"
bd dep add <job-id> <service-id>  # Job depends on service

# Complete when tested
bun run test && bd complete <id>
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Bun | Fast JS runtime |
| Framework | Hono | Lightweight web framework |
| ORM | Drizzle | Type-safe database queries |
| Validation | Zod + @hono/zod-validator | Runtime validation |
| Jobs | Trigger.dev | Background job processing |
| Auth/Realtime | Supabase client | Auth, storage, realtime only |

---

## API Response Patterns

### Response Envelope
```typescript
type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
};
```

### Hono Response Helpers
```typescript
// lib/api/response.ts
import { Context } from 'hono';

export function success<T>(c: Context, data: T, meta?: object) {
  return c.json({ data, error: null, meta });
}

export function error(c: Context, code: string, message: string, status: number) {
  return c.json({ data: null, error: { code, message } }, status);
}

// Usage in route
app.get('/api/patterns/:id', async (c) => {
  const id = c.req.param('id');
  const pattern = await getPattern(id);
  if (!pattern) {
    return error(c, 'NOT_FOUND', 'Pattern not found', 404);
  }
  return success(c, pattern);
});
```

### Route Naming Convention
```
GET    /api/patterns              # List patterns
GET    /api/patterns/:id          # Get single pattern
POST   /api/patterns              # Create pattern
PATCH  /api/patterns/:id          # Update pattern
DELETE /api/patterns/:id          # Delete pattern
POST   /api/patterns/:id/promote  # Action on pattern
```

---

## Error Handling

### Error Class Hierarchy
```typescript
// lib/errors/base.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} with id ${id} not found`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}
```

### Error Middleware
```typescript
// middleware/error-handler.ts
import { Context, Next } from 'hono';
import { AppError } from '@/lib/errors/base';

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      return c.json({
        data: null,
        error: { code: err.code, message: err.message },
      }, err.statusCode);
    }
    console.error('Unhandled error:', err);
    return c.json({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    }, 500);
  }
}
```

---

## Database Access with Drizzle

### Getting the Database Client
```typescript
import { getDb } from '@/lib/db/client';

const db = getDb();
```

### Basic Queries
```typescript
import { eq, and } from 'drizzle-orm';
import { patterns } from '@/lib/db/schema';

// Select all
const allPatterns = await db.select().from(patterns);

// Select with filter
const repoPatterns = await db
  .select()
  .from(patterns)
  .where(eq(patterns.repoId, repoId));

// Select with multiple conditions
const candidates = await db
  .select()
  .from(patterns)
  .where(and(
    eq(patterns.repoId, repoId),
    eq(patterns.status, 'candidate')
  ));
```

### Insert Operations
```typescript
const [newPattern] = await db
  .insert(patterns)
  .values({
    repoId,
    name: 'New Pattern',
    description: 'Description',
    type: 'code',
    extractedByModel: 'claude-sonnet-4-5-20250929',
  })
  .returning();
```

### Update Operations
```typescript
const [updated] = await db
  .update(patterns)
  .set({
    status: 'authoritative',
    validatedAt: new Date(),
    validatedBy: userId,
  })
  .where(eq(patterns.id, patternId))
  .returning();
```

### Queries with Relations
```typescript
// Using Drizzle's relational queries
const patternWithEvidence = await db.query.patterns.findFirst({
  where: eq(patterns.id, patternId),
  with: {
    evidence: true,
    repo: true,
  },
});
```

### Typed Query Helpers
```typescript
// lib/db/queries/patterns.ts
import { getDb } from '../client';
import { patterns } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function getPatternsByRepo(
  repoId: string,
  filters?: { status?: string }
) {
  const db = getDb();
  let conditions = [eq(patterns.repoId, repoId)];

  if (filters?.status) {
    conditions.push(eq(patterns.status, filters.status));
  }

  return db.select().from(patterns).where(and(...conditions));
}
```

---

## Background Job Patterns

### Job Structure (Trigger.dev)
```typescript
// jobs/ingest-repo.ts
import { task } from '@trigger.dev/sdk/v3';

export const ingestRepoJob = task({
  id: 'ingest-repo',
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
    factor: 2,
  },
  run: async (payload: { repoId: string }) => {
    const db = getDb();
    const repo = await db.query.repos.findFirst({
      where: eq(repos.id, payload.repoId),
    });

    // Idempotency check
    if (repo?.ingestionStatus === 'ingested') {
      return { skipped: true, reason: 'Already ingested' };
    }

    // Update status
    await db.update(repos)
      .set({ ingestionStatus: 'ingesting' })
      .where(eq(repos.id, payload.repoId));

    // ... do work

    await db.update(repos)
      .set({ ingestionStatus: 'ingested', lastIngestedAt: new Date() })
      .where(eq(repos.id, payload.repoId));

    return { success: true };
  },
});
```

### Job Requirements
- **Idempotency**: Always check if work is already done
- **Status tracking**: Update database status at each stage
- **Error handling**: Jobs should surface errors, not swallow them
- **Retry config**: Use exponential backoff

---

## Service Layer Patterns

### Layer Responsibilities
```
Route handlers → validate input, call service, format response
Services       → business logic, orchestration, cross-cutting concerns
DB queries     → data access via Drizzle, no business logic
```

### Service Function Pattern
```typescript
// services/patterns.ts
import { getDb } from '@/lib/db/client';
import { patterns } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError, UnauthorizedError } from '@/lib/errors/base';

export async function promotePattern(
  patternId: string,
  userId: string,
  options: { severity: string; rationale: string }
) {
  const db = getDb();

  // 1. Fetch and validate
  const pattern = await db.query.patterns.findFirst({
    where: eq(patterns.id, patternId),
    with: { repo: true },
  });

  if (!pattern) {
    throw new NotFoundError('Pattern', patternId);
  }

  if (pattern.repo.userId !== userId) {
    throw new UnauthorizedError('Not authorized to modify this pattern');
  }

  // 2. Execute business logic
  const [updated] = await db.update(patterns)
    .set({
      status: 'authoritative',
      defaultSeverity: options.severity,
      rationale: options.rationale,
      validatedBy: userId,
      validatedAt: new Date(),
    })
    .where(eq(patterns.id, patternId))
    .returning();

  // 3. Trigger side effects (background jobs)
  await ingestRepoJob.trigger({ repoId: pattern.repoId });

  return updated;
}
```

---

## Supabase Client (Auth/Realtime Only)

The Supabase client is for auth, storage, and realtime features only. **Do not use it for database queries** - use Drizzle ORM instead.

```typescript
import { getSupabaseClient } from '@/lib/supabase/client';

// Auth operations
const supabase = getSupabaseClient();
const { data: { user } } = await supabase.auth.getUser(token);

// Storage operations
await supabase.storage.from('diffs').upload(path, content);

// Realtime subscriptions (client-side)
supabase.channel('repos').on('postgres_changes', callback);
```

---

## Validation with Zod

### Route Validation
```typescript
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const createPatternSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['code', 'filesystem']),
});

app.post(
  '/api/patterns',
  zValidator('json', createPatternSchema),
  async (c) => {
    const data = c.req.valid('json');
    // data is typed as { name: string; description: string; type: 'code' | 'filesystem' }
  }
);
```

---

## Validation Commands

```bash
bun run typecheck    # TypeScript check
bun run build        # Build API
bun run test         # Run tests
bun run dev          # Development server (port 3001)
```

---

## Handoffs

| Downstream | When |
|------------|------|
| `hono-specialist` | For route implementation details |
| `testing-consultant` | For service/job tests |
| `foundation-specialist` | For database schema changes |

| Upstream | When |
|----------|------|
| `orchestrator-specialist` | Routes complex backend tasks here |
| `hono-specialist` | Needs service layer patterns |
