# API Development Context

Hono + Bun backend for the Reasoning Substrate API.

## Quick Reference

| Pattern | Example |
|---------|---------|
| Response envelope | `c.json({ data, error: null })` |
| Error response | `c.json({ data: null, error: { code, message } }, status)` |
| DB access | `const db = getDb()` from `lib/db/client` |
| Validation | `zValidator('json', schema)` middleware |

## Key Patterns

**Routes** - Use Hono's `c.json()` with response envelope:
```typescript
app.get('/api/patterns/:id', async (c) => {
  const id = c.req.param('id');
  const pattern = await getPattern(id);
  return c.json({ data: pattern, error: null });
});
```

**Database** - Always use Drizzle ORM, never `supabase.from()`:
```typescript
import { getDb } from '@/lib/db/client';
import { eq } from 'drizzle-orm';
import { patterns } from '@/lib/db/schema';

const db = getDb();
const result = await db.select().from(patterns).where(eq(patterns.id, id));
```

**Validation** - Use `@hono/zod-validator`:
```typescript
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

app.post('/api/patterns', zValidator('json', schema), async (c) => {
  const data = c.req.valid('json');
});
```

**Supabase** - Only for auth, storage, realtime (not database queries)

## Commands

```bash
bun run dev          # Start server (port 3001)
bun run typecheck    # Type check
bun run build        # Production build
bun run test         # Run tests
```

## File Structure

```
src/
├── index.ts         # App entry, route registration
├── routes/          # Route handlers
├── middleware/      # Custom middleware
└── lib/
    ├── db/          # Drizzle ORM (schema, client, queries)
    ├── supabase/    # Auth/realtime client only
    ├── validation/  # Zod schemas
    └── errors/      # AppError hierarchy
```
