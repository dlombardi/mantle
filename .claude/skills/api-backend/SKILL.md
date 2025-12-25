# API Backend

Backend architecture: tRPC routers, Hono REST routes, Drizzle ORM, error handling, and background jobs.

> **Note:** For general framework documentation, use the Ref MCP server.
> This skill covers project-specific conventions only.

---

## Activation

Invoke this skill when working on:
- tRPC router procedures (most business logic)
- REST routes (health checks, webhooks only)
- Database queries with Drizzle ORM
- Error handling and error classes
- Background jobs (Trigger.dev)
- Service layer patterns

**Trigger keywords:** `route`, `middleware`, `handler`, `tRPC`, `procedure`, `service`, `job`, `drizzle`, `query`

**Key files:**
- `packages/trpc/src/routers/` — tRPC routers
- `apps/api/src/routes/` — REST routes (health, webhooks)
- `apps/api/src/index.ts` — App entry, tRPC mount
- `apps/api/src/lib/db/` — Drizzle ORM
- `apps/api/src/services/` — Service layer
- `apps/api/src/jobs/` — Trigger.dev jobs

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Bun 1.3.0 | Fast JS runtime |
| Framework | Hono 4.6.14 | Lightweight web framework |
| API | tRPC + @trpc/server | Type-safe API layer |
| ORM | Drizzle | Type-safe database queries |
| Validation | Zod | Runtime validation (tRPC input) |
| Jobs | Trigger.dev | Background job processing |
| Auth/Realtime | Supabase client | Auth, storage, realtime only |

---

## REST vs tRPC Decision

| Route | Protocol | Reason |
|-------|----------|--------|
| `/trpc/*` | tRPC | Business logic, type-safe |
| `/health/*` | REST | Kubernetes probes |
| `/github/webhooks` | REST | GitHub signature verification |

**Rule:** Use tRPC for all business logic. REST is only for infrastructure endpoints and external webhooks.

---

## tRPC Middleware Mount

```typescript
// apps/api/src/index.ts
import { Hono } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { appRouter, createContext } from '@mantle/trpc';
import { healthRoutes } from './routes/health';
import { getDb } from './lib/db/client';

const app = new Hono();

// tRPC for business logic
app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    endpoint: '/api/trpc',
    createContext: async ({ req }) => {
      return createContext({
        req,
        getDb,
        getUser: async () => extractUserFromRequest(req),
      });
    },
  }),
);

// REST routes for infrastructure
app.route('/health', healthRoutes);

export default app;
```

---

## tRPC Router Patterns

### Router Structure

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
});
```

### Procedure Types

```typescript
// publicProcedure - No auth required (health checks)
// protectedProcedure - Requires authenticated user in context
```

### Namespace Convention

```
trpc.repos.list            # List repositories
trpc.repos.getById         # Get single repo
trpc.repos.connect         # Connect new repo
trpc.patterns.list         # List patterns
trpc.patterns.updateStatus # Update pattern status
```

### Error Handling in Procedures

```typescript
import { TRPCError } from '@trpc/server';

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

For tRPC patterns not covered here, use Ref:
```
ref_search_documentation("tRPC [pattern name]")
```

---

## Error Class Hierarchy

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

---

## Response Envelope (REST routes)

```typescript
// Success
return c.json({ data: result, error: null });

// Error
return c.json({
  data: null,
  error: { code: 'NOT_FOUND', message: 'Pattern not found' },
}, 404);

// With metadata
return c.json({
  data: patterns,
  error: null,
  meta: { page: 1, pageSize: 20, total: 100 },
});
```

---

## Database Access (Drizzle)

```typescript
import { getDb } from '@/lib/db/client';
import { eq, and } from 'drizzle-orm';
import { patterns } from '@/lib/db/schema';

const db = getDb();

// Select with filter
const repoPatterns = await db
  .select()
  .from(patterns)
  .where(eq(patterns.repoId, repoId));

// Insert with returning
const [newPattern] = await db
  .insert(patterns)
  .values({ repoId, name: 'New Pattern', type: 'code' })
  .returning();

// Update with returning
const [updated] = await db
  .update(patterns)
  .set({ status: 'authoritative', validatedAt: new Date() })
  .where(eq(patterns.id, patternId))
  .returning();

// Relational queries
const patternWithEvidence = await db.query.patterns.findFirst({
  where: eq(patterns.id, patternId),
  with: { evidence: true, repo: true },
});
```

For Drizzle patterns not covered here, use Ref:
```
ref_search_documentation("Drizzle ORM [pattern name]")
```

---

## Background Jobs (Trigger.dev)

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

**Job Requirements:**
- **Idempotency**: Always check if work is already done
- **Status tracking**: Update database status at each stage
- **Error handling**: Jobs should surface errors, not swallow them
- **Retry config**: Use exponential backoff

---

## Service Layer

```
Route handlers → validate input, call service, format response
Services       → business logic, orchestration, cross-cutting concerns
DB queries     → data access via Drizzle, no business logic
```

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

  if (!pattern) throw new NotFoundError('Pattern', patternId);
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

  // 3. Trigger side effects
  await ingestRepoJob.trigger({ repoId: pattern.repoId });

  return updated;
}
```

---

## Supabase Client Note

The Supabase client is for auth, storage, and realtime only. **Do not use it for database queries** - use Drizzle ORM instead.

```typescript
import { getSupabaseClient } from '@/lib/supabase/client';

// Auth operations
const supabase = getSupabaseClient();
const { data: { user } } = await supabase.auth.getUser(token);

// Storage operations
await supabase.storage.from('diffs').upload(path, content);
```

---

## Validation Commands

```bash
bun run dev          # Development server (port 3001)
bun run typecheck    # TypeScript check
bun run build        # Production build
bun run test         # Run tests
```

---

## Documentation Lookup

For Hono patterns not covered here:
```
ref_search_documentation("Hono [pattern name]")
```

For tRPC patterns not covered here:
```
ref_search_documentation("tRPC [pattern name]")
```
