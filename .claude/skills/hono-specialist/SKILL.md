# Hono Specialist

Provides guidance for developing API routes with the Hono framework on Bun runtime.

---

## Activation

Invoke this skill when working on:
- API route handlers and routing
- Middleware configuration
- Request/response handling
- Validation with Zod
- Hono-specific patterns and utilities

**Trigger keywords:** `route`, `middleware`, `handler`, `app.`, `c.json`, `c.req`, `Hono`

**Key files:**
- `apps/api/src/routes/`
- `apps/api/src/middleware/`
- `apps/api/src/index.ts`

---

## Beads Integration

Track Hono work with beads:
```bash
# Adding a new route
bd create "Add PATCH /api/preferences/:id route"
bd update <id> -s in-progress

# Complete when working
bun run typecheck && bd complete <id>
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Bun | 1.3.0 |
| Framework | Hono | 4.6.14 |
| Server Adapter | @hono/node-server | 1.13.7 |
| Validation | @hono/zod-validator | 0.4.2 |

---

## Project Structure

```
apps/api/src/
├── index.ts              # App entry point, route registration
├── routes/               # Route handlers
│   ├── health.ts        # Health check route
│   └── example.ts       # Example CRUD routes
├── middleware/           # Custom middleware
└── lib/
    ├── db/              # Drizzle ORM (see backend-architect)
    ├── supabase/        # Auth/realtime client
    └── validation/      # Zod schemas
```

---

## Route Patterns

### Basic Route
```typescript
import { Hono } from 'hono';

const app = new Hono();

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### Route with Path Parameters
```typescript
app.get('/api/patterns/:id', async (c) => {
  const id = c.req.param('id');
  const pattern = await getPattern(id);
  return c.json({ data: pattern, error: null });
});
```

### Route with Query Parameters
```typescript
app.get('/api/patterns', async (c) => {
  const status = c.req.query('status');
  const page = parseInt(c.req.query('page') || '1');
  const patterns = await getPatterns({ status, page });
  return c.json({ data: patterns, error: null });
});
```

### Route with Zod Validation
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
    // data is fully typed: { name: string; description: string; type: 'code' | 'filesystem' }
    const pattern = await createPattern(data);
    return c.json({ data: pattern, error: null }, 201);
  }
);
```

### Route with Multiple Validators
```typescript
const paramsSchema = z.object({
  id: z.string().uuid(),
});

const bodySchema = z.object({
  status: z.enum(['candidate', 'authoritative', 'rejected']),
  rationale: z.string().optional(),
});

app.patch(
  '/api/patterns/:id',
  zValidator('param', paramsSchema),
  zValidator('json', bodySchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const updated = await updatePattern(id, body);
    return c.json({ data: updated, error: null });
  }
);
```

---

## Route Groups

### Organizing Routes
```typescript
// routes/patterns.ts
import { Hono } from 'hono';

export const patternsRoutes = new Hono();

patternsRoutes.get('/', listPatterns);
patternsRoutes.get('/:id', getPattern);
patternsRoutes.post('/', createPattern);
patternsRoutes.patch('/:id', updatePattern);
patternsRoutes.delete('/:id', deletePattern);

// index.ts
import { patternsRoutes } from './routes/patterns';

const app = new Hono();
app.route('/api/patterns', patternsRoutes);
```

---

## Middleware Patterns

### Global Middleware
```typescript
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

const app = new Hono();

// Apply to all routes
app.use('*', logger());
app.use('*', cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));
```

### Route-Specific Middleware
```typescript
// Auth middleware
const authMiddleware = async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return c.json({ data: null, error: { code: 'UNAUTHORIZED', message: 'Missing token' } }, 401);
  }
  const user = await verifyToken(token);
  c.set('user', user);
  await next();
};

// Apply to specific routes
app.use('/api/patterns/*', authMiddleware);
```

### Error Handling Middleware
```typescript
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({
    data: null,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  }, 500);
});

app.notFound((c) => {
  return c.json({
    data: null,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  }, 404);
});
```

---

## Request Context

### Accessing Request Data
```typescript
app.post('/api/example', async (c) => {
  // Path parameters
  const id = c.req.param('id');

  // Query parameters
  const page = c.req.query('page');

  // Headers
  const auth = c.req.header('Authorization');

  // Body (JSON)
  const body = await c.req.json();

  // Body (with Zod validation - preferred)
  const validated = c.req.valid('json');

  // Set variables for downstream middleware/handlers
  c.set('userId', 'user-123');

  // Get variables set by middleware
  const userId = c.get('userId');
});
```

---

## Response Patterns

### JSON Responses
```typescript
// Success response
return c.json({ data: result, error: null });

// Success with status code
return c.json({ data: newItem, error: null }, 201);

// Error response
return c.json({
  data: null,
  error: { code: 'NOT_FOUND', message: 'Pattern not found' },
}, 404);

// Response with metadata
return c.json({
  data: patterns,
  error: null,
  meta: { page: 1, pageSize: 20, total: 100 },
});
```

### Other Response Types
```typescript
// Plain text
return c.text('Hello World');

// HTML
return c.html('<h1>Hello</h1>');

// Redirect
return c.redirect('/api/patterns');

// No content
return c.body(null, 204);
```

---

## Testing Routes

### Using Hono testClient
```typescript
import { describe, it, expect } from 'vitest';
import { testClient } from 'hono/testing';
import { app } from '../index';

describe('GET /api/health', () => {
  const client = testClient(app);

  it('should return 200 with status', async () => {
    const res = await client.api.health.$get();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('status', 'ok');
  });
});

describe('POST /api/patterns', () => {
  it('should create pattern with valid data', async () => {
    const res = await client.api.patterns.$post({
      json: { name: 'Test', description: 'Test pattern', type: 'code' },
    });
    expect(res.status).toBe(201);
  });

  it('should return 400 for invalid data', async () => {
    const res = await client.api.patterns.$post({
      json: { name: '' },
    });
    expect(res.status).toBe(400);
  });
});
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

## Handoffs

| Downstream | When |
|------------|------|
| `backend-architect` | For service layer patterns |
| `testing-consultant` | For route tests |
| `foundation-specialist` | For database schema changes |

| Upstream | When |
|----------|------|
| `orchestrator-specialist` | Routes API tasks here |
| `frontend-architect` | Needs API endpoints for UI |

---

## Resources

- Official docs: https://hono.dev
- Zod validator: https://hono.dev/docs/guides/validation#with-zod
