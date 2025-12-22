# Hono Development Patterns

This reference contains detailed code patterns and best practices for Hono development.

## Routing Patterns

### Basic Routes

```typescript
import { Hono } from 'hono'

const app = new Hono()

// Basic routes
app.get('/', (c) => c.text('Hello Hono!'))
app.post('/posts', (c) => c.json({ message: 'Created' }))
```

### Path Parameters

```typescript
app.get('/users/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ id })
})
```

### Query Parameters

```typescript
app.get('/search', (c) => {
  const query = c.req.query('q')
  return c.json({ query })
})
```

### Nested Routing

```typescript
const api = new Hono()
api.get('/users', (c) => c.json({ users: [] }))
app.route('/api', api)
```

## Middleware Usage

### Built-in Middleware

Available middleware options:
- `cors()` - CORS handling
- `jwt()` - JWT authentication
- `logger()` - Request logging
- `compress()` - Response compression
- `secureHeaders()` - Security headers
- `cache()` - Response caching

### Global Middleware

```typescript
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

const app = new Hono()

// Global middleware
app.use('*', logger())
app.use('/api/*', cors())
```

### Route-specific Middleware

```typescript
app.use('/admin/*', async (c, next) => {
  // Auth check
  await next()
})
```

### CORS Configuration

```typescript
import { cors } from 'hono/cors'

app.use('/*', cors({
  origin: ['https://example.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
```

## Validation

### Using Zod Validator

```typescript
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const schema = z.object({
  name: z.string(),
  age: z.number()
})

app.post('/users', zValidator('json', schema), (c) => {
  const data = c.req.valid('json')
  return c.json(data)
})
```

## Error Handling

### Custom Error Handler

```typescript
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal Server Error' }, 500)
})
```

### Not Found Handler

```typescript
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})
```

## Database Integration

### Cloudflare D1 Example

```typescript
import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/users', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM users').all()
  return c.json(results)
})
```

## Testing Patterns

### Vitest Setup

```typescript
import { describe, it, expect } from 'vitest'
import app from '../src/index'

describe('API Tests', () => {
  it('Should return 200', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
  })

  it('Should return JSON', async () => {
    const res = await app.request('/api/users')
    const data = await res.json()
    expect(data).toBeDefined()
  })
})
```

## Performance Tips

1. **Use `hono optimize`** for production builds - reduces bundle size by ~38% and speeds up initialization by 16.5×
2. Use `hono/tiny` preset for minimal bundle size
3. Enable compression middleware for large responses
4. Use streaming for large data transfers
5. Implement caching strategies
6. Leverage runtime-specific optimizations (e.g., Cloudflare KV, Deno KV)
