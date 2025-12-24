# Backend Architect

Establishes backend architecture patterns: tRPC router design, error handling, Drizzle ORM database access, background jobs, and service layer conventions.

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
| API | tRPC + @trpc/server | Type-safe API layer |
| ORM | Drizzle | Type-safe database queries |
| Validation | Zod | Runtime validation (tRPC input) |
| Jobs | Trigger.dev | Background job processing |
| Auth/Realtime | Supabase client | Auth, storage, realtime only |

---

## tRPC Router Patterns

### Router Structure
tRPC routers live in `packages/trpc/src/routers/` and are merged into the main appRouter.

```typescript
// packages/trpc/src/routers/patterns.router.ts
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';

export const patternsRouter = router({
  list: protectedProcedure
    .input(z.object({
      repoId: z.string().uuid(),
      status: z.enum(['candidate', 'authoritative']).optional(),
      page: z.number().int().positive().default(1),
      limit: z.number().int().positive().max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const patterns = await ctx.db.query.patterns.findMany({
        where: eq(patterns.repoId, input.repoId),
        limit: input.limit,
        offset: (input.page - 1) * input.limit,
      });
      return { items: patterns, page: input.page, limit: input.limit };
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['authoritative', 'rejected', 'deferred']),
      rationale: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, status, rationale } = input;
      const [updated] = await ctx.db.update(patterns)
        .set({ status, rationale, validatedBy: ctx.user.id })
        .where(eq(patterns.id, id))
        .returning();
      return { success: true, pattern: updated };
    }),
});
```

### Procedure Types
```typescript
// publicProcedure - No auth required (health checks)
// protectedProcedure - Requires authenticated user in context
```

### tRPC Namespace Convention
```
trpc.repos.list            # List repositories
trpc.repos.getById         # Get single repo
trpc.repos.connect         # Connect new repo
trpc.patterns.list         # List patterns
trpc.patterns.updateStatus # Update pattern status
trpc.patterns.addEvidence  # Add evidence to pattern
```

### Error Handling in Procedures
```typescript
import { TRPCError } from '@trpc/server';

// In a procedure
if (!pattern) {
  throw new TRPCError({
    code: 'NOT_FOUND',
    message: `Pattern ${id} not found`,
  });
}

if (pattern.repo.userId !== ctx.user.id) {
  throw new TRPCError({
    code: 'FORBIDDEN',
    message: 'Not authorized to modify this pattern',
  });
}
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

## Input Validation with Zod

### tRPC Input Validation
Zod schemas are defined inline in procedure `.input()` calls:

```typescript
import { z } from 'zod';

export const patternsRouter = router({
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1, 'Name is required'),
      description: z.string().min(1),
      type: z.enum(['code', 'filesystem']),
      repoId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      // input is fully typed: { name: string; description: string; ... }
      const [pattern] = await ctx.db.insert(patterns).values(input).returning();
      return pattern;
    }),
});
```

### Reusable Schemas
For complex or shared validation, define schemas separately:

```typescript
// packages/trpc/src/schemas/pattern.ts
export const patternStatusSchema = z.enum([
  'candidate',
  'authoritative',
  'rejected',
  'deferred',
]);

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// In router
.input(paginationSchema.extend({
  repoId: z.string().uuid(),
  status: patternStatusSchema.optional(),
}))
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
