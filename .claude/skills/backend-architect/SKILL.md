# Backend Architect

Establishes backend architecture patterns: API design, error handling, database access, background jobs, and service layer conventions.

---

## Activation

Invoke this skill when working on:
- API endpoint design and implementation
- Error handling patterns and error classes
- Service layer architecture
- Background job patterns (Trigger.dev)
- Database query patterns and helpers
- External API integration (GitHub, Anthropic)

**Trigger keywords:** `service`, `job`, `trigger`, `error`, `repository`, `API design`

**Key files:**
- `apps/api/src/services/`
- `apps/api/src/jobs/`
- `apps/api/src/lib/errors/`
- `apps/api/src/lib/api/`

---

## Beads Integration

Track backend work with beads:
```bash
# Starting a new service
bd create "Implement user preferences service"
bd update <id> -s in-progress

# Track job implementation
bd create "Add background job for email notifications"
bd dep add <job-id> <service-id>  # Job depends on service

# Complete when tested
bun run test && bd complete <id>
```

---

## Prerequisites

- Supabase project configured (via foundation-specialist)
- Trigger.dev initialized
- TypeScript strict mode enabled

## Workflow

### Step 1: Establish API Conventions

1. Create `docs/backend/api-conventions.md`
2. Define route naming: `/api/[resource]/[id]/[action]`
   ```
   GET    /api/patterns              # List patterns
   GET    /api/patterns/[id]         # Get single pattern
   POST   /api/patterns              # Create pattern
   PATCH  /api/patterns/[id]         # Update pattern
   DELETE /api/patterns/[id]         # Delete pattern
   POST   /api/patterns/[id]/promote # Action on pattern
   ```
3. Define response envelope structure:
   ```typescript
   // lib/api/response.ts
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
4. Create `lib/api/response.ts` with helper functions:
   ```typescript
   export function success<T>(data: T, meta?: object): NextResponse {
     return NextResponse.json({ data, error: null, meta });
   }

   export function error(code: string, message: string, status: number): NextResponse {
     return NextResponse.json(
       { data: null, error: { code, message } },
       { status }
     );
   }
   ```
5. Document pagination pattern: `?page=1&pageSize=20`
6. Document filtering pattern: `?status=candidate&tier=strong`

### Step 2: Error Handling System

1. Create `docs/backend/error-handling.md`
2. Create `lib/errors/base.ts` with error class hierarchy:
   ```typescript
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

   export class RateLimitError extends AppError {
     constructor(retryAfter?: number) {
       super('RATE_LIMITED', 'Rate limit exceeded', 429, { retryAfter });
     }
   }
   ```
3. Define error code taxonomy:
   - `NOT_FOUND` - Resource doesn't exist
   - `VALIDATION_ERROR` - Invalid input
   - `UNAUTHORIZED` - Not authenticated
   - `FORBIDDEN` - Not authorized
   - `RATE_LIMITED` - Too many requests
   - `EXTERNAL_API_ERROR` - GitHub/Anthropic failed
   - `INTERNAL_ERROR` - Unexpected server error
4. Document what to log vs expose to client:
   - Log: Full error with stack trace, request context
   - Expose: Error code, user-friendly message, no internal details

### Step 3: Database Access Patterns

1. Create `docs/backend/database-access.md`
2. Document Supabase client usage:
   ```typescript
   // Simple query
   const { data, error } = await supabase
     .from('patterns')
     .select('*')
     .eq('repoId', repoId);

   // Complex query with typed helpers
   import { getPatternsByRepo } from '@/lib/db/patterns';
   const patterns = await getPatternsByRepo(repoId, { status: 'candidate' });
   ```
3. Create typed query helpers in `lib/db/`:
   ```typescript
   // lib/db/patterns.ts
   export async function getPatternsByRepo(
     repoId: string,
     filters?: { status?: string; tier?: string }
   ): Promise<Pattern[]> {
     let query = supabase.from('patterns').select('*').eq('repoId', repoId);
     if (filters?.status) query = query.eq('status', filters.status);
     if (filters?.tier) query = query.eq('tier', filters.tier);
     const { data, error } = await query;
     if (error) throw new AppError('DB_ERROR', error.message);
     return data;
   }
   ```
4. Document transaction patterns (Supabase RPC for atomic operations)
5. Document RLS policy conventions:
   - Users can only access repos they own
   - Patterns/violations scoped by repo ownership

### Step 4: Background Job Patterns

1. Create `docs/backend/job-patterns.md`
2. Define job naming conventions:
   ```
   jobs/
   ├── ingest-repo.ts       # Main ingestion job
   ├── extract-patterns.ts  # Pattern extraction
   ├── analyze-pr.ts        # PR analysis
   ├── sync-context-files.ts # Context file sync
   └── auto-archive.ts      # Scheduled cleanup
   ```
3. Document idempotency requirements:
   ```typescript
   // Every job must check if work already done
   export const ingestRepoJob = task({
     id: 'ingest-repo',
     run: async (payload: { repoId: string }) => {
       const repo = await getRepo(payload.repoId);

       // Idempotency check
       if (repo.ingestionStatus === 'ingested') {
         return { skipped: true, reason: 'Already ingested' };
       }

       // ... do work
     },
   });
   ```
4. Configure retry standards:
   ```typescript
   export const analyzeprJob = task({
     id: 'analyze-pr',
     retry: {
       maxAttempts: 3,
       minTimeoutInMs: 1000,
       maxTimeoutInMs: 30000,
       factor: 2, // Exponential backoff
     },
     run: async (payload) => { /* ... */ },
   });
   ```
5. Document progress reporting via Supabase Realtime:
   ```typescript
   await supabase
     .from('repos')
     .update({ ingestionStatus: 'ingesting', ingestionProgress: 50 })
     .eq('id', repoId);
   ```

### Step 5: Service Layer Patterns

1. Create `docs/backend/service-layer.md`
2. Define where business logic lives:
   ```
   Route handlers → validate input, call service, format response
   Services       → business logic, orchestration, cross-cutting concerns
   DB helpers     → data access, no business logic
   ```
3. Create service function patterns:
   ```typescript
   // lib/services/patterns.ts
   export async function promotePattern(
     patternId: string,
     userId: string,
     options: { severity: string; rationale: string }
   ): Promise<Pattern> {
     // 1. Validate authorization
     const pattern = await getPattern(patternId);
     await assertUserOwnsRepo(userId, pattern.repoId);

     // 2. Execute business logic
     const updated = await updatePattern(patternId, {
       status: 'authoritative',
       severity: options.severity,
       rationale: options.rationale,
       promotedBy: userId,
       promotedAt: new Date(),
     });

     // 3. Trigger side effects
     await triggerBacktest(patternId);
     await triggerContextFileSync(pattern.repoId);

     return updated;
   }
   ```

### Step 6: External Integration Patterns

1. Create `docs/backend/integrations.md`
2. Document rate limit handling:
   ```typescript
   // lib/github/rate-limit.ts
   export async function withRateLimit<T>(
     fn: () => Promise<T>,
     options: { maxRetries: number }
   ): Promise<T> {
     for (let attempt = 0; attempt < options.maxRetries; attempt++) {
       try {
         return await fn();
       } catch (error) {
         if (isRateLimitError(error)) {
           const retryAfter = getRetryAfter(error);
           await delay(retryAfter * 1000);
           continue;
         }
         throw error;
       }
     }
     throw new RateLimitError();
   }
   ```
3. Create retry-with-backoff utility:
   ```typescript
   export async function withRetry<T>(
     fn: () => Promise<T>,
     options: { maxAttempts: number; baseDelayMs: number }
   ): Promise<T> {
     for (let attempt = 0; attempt < options.maxAttempts; attempt++) {
       try {
         return await fn();
       } catch (error) {
         if (attempt === options.maxAttempts - 1) throw error;
         await delay(options.baseDelayMs * Math.pow(2, attempt));
       }
     }
     throw new Error('Unreachable');
   }
   ```

### Step 7: Logging and Observability

1. Document structured logging format:
   ```typescript
   // lib/logger.ts
   export function log(level: 'info' | 'warn' | 'error', message: string, context?: object) {
     console.log(JSON.stringify({
       timestamp: new Date().toISOString(),
       level,
       message,
       ...context,
     }));
   }
   ```
2. Document what to log (and NOT log):
   - Log: API requests, job progress, errors, external API calls
   - Do NOT log: User passwords, API keys, PII, full request bodies with secrets
3. Add correlation IDs via headers for request tracing

## Output Specification

After running this skill, the following should exist:

### Documentation
- `docs/backend/api-conventions.md`
- `docs/backend/error-handling.md`
- `docs/backend/database-access.md`
- `docs/backend/job-patterns.md`
- `docs/backend/service-layer.md`
- `docs/backend/integrations.md`

### Shared Infrastructure
- `lib/api/response.ts`
- `lib/api/validation.ts`
- `lib/errors/base.ts`
- `lib/errors/http.ts`
- `lib/services/` (base patterns)
- `lib/logger.ts`

## Consultation Protocol

Domain specialists should:

1. **Read** relevant `docs/backend/*.md` before starting server work
2. **Use** error classes from `lib/errors/`
3. **Use** API helpers from `lib/api/`
4. **Follow** job patterns exactly
5. **Request** new patterns if needed

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Response envelope | `{ data, error, meta }` | Consistent structure, easy error handling |
| Error format | `{ code, message, details }` | Machine-readable code, human message |
| Validation | Zod schemas | Shared with frontend, TypeScript-first |
| Database access | Supabase client + typed helpers | Simple queries direct, complex via helpers |
| Job idempotency | Required for all jobs | Safe retries, no duplicate work |
| Logging | Structured JSON | Parseable, searchable logs |

## Success Signals

- Domain specialists can build APIs without design decisions
- Consistent error responses across all endpoints
- Predictable job behavior and recovery
- No duplicate work from retried jobs

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
