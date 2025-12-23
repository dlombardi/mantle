# Drizzle ORM Query Patterns

Common query patterns for the Reasoning Substrate API.

## Getting the Database Client

```typescript
import { getDb } from '@/lib/db/client';

const db = getDb();
```

## Select Queries

### Basic Select
```typescript
import { patterns } from '@/lib/db/schema';

const allPatterns = await db.select().from(patterns);
```

### Select with Filter
```typescript
import { eq } from 'drizzle-orm';

const pattern = await db
  .select()
  .from(patterns)
  .where(eq(patterns.id, patternId));
```

### Multiple Conditions
```typescript
import { and, eq } from 'drizzle-orm';

const candidates = await db
  .select()
  .from(patterns)
  .where(and(
    eq(patterns.repoId, repoId),
    eq(patterns.status, 'candidate')
  ));
```

### Partial Select
```typescript
const names = await db
  .select({ id: patterns.id, name: patterns.name })
  .from(patterns);
```

## Insert Operations

### Single Insert
```typescript
const [newPattern] = await db
  .insert(patterns)
  .values({
    repoId,
    name: 'Pattern Name',
    description: 'Description',
    type: 'code',
    extractedByModel: 'claude-sonnet-4-5-20250929',
  })
  .returning();
```

### Bulk Insert
```typescript
await db.insert(patternEvidence).values([
  { patternId, filePath: 'src/a.ts', snippet: '...' },
  { patternId, filePath: 'src/b.ts', snippet: '...' },
]);
```

## Update Operations

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

## Delete Operations

```typescript
await db
  .delete(patternEvidence)
  .where(eq(patternEvidence.patternId, patternId));
```

## Relational Queries

### With Relations
```typescript
const patternWithEvidence = await db.query.patterns.findFirst({
  where: eq(patterns.id, patternId),
  with: {
    evidence: true,
    repo: true,
  },
});
```

### Nested Relations
```typescript
const repoWithPatterns = await db.query.repos.findFirst({
  where: eq(repos.id, repoId),
  with: {
    patterns: {
      with: {
        evidence: true,
      },
    },
  },
});
```

## Ordering and Pagination

```typescript
import { desc, asc } from 'drizzle-orm';

const recentPatterns = await db
  .select()
  .from(patterns)
  .where(eq(patterns.repoId, repoId))
  .orderBy(desc(patterns.createdAt))
  .limit(20)
  .offset(page * 20);
```

## Count Queries

```typescript
import { count } from 'drizzle-orm';

const [{ total }] = await db
  .select({ total: count() })
  .from(patterns)
  .where(eq(patterns.repoId, repoId));
```
