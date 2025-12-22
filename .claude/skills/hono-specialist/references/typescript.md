# TypeScript Configuration for Hono

This reference contains TypeScript setup guidance for Hono projects across different runtimes.

## Base Configuration

### Standard tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "lib": ["ESNext"],
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  }
}
```

## Runtime-Specific Configurations

### Cloudflare Workers

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "lib": ["ESNext"],
    "types": ["@cloudflare/workers-types"],
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  }
}
```

Install types:
```bash
npm install -D @cloudflare/workers-types
```

### Deno

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext", "DOM"],
    "strict": true,
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  }
}
```

Use with `deno.json`:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  },
  "imports": {
    "hono": "npm:hono@latest"
  }
}
```

### Node.js

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "lib": ["ES2022"],
    "types": ["node"],
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx",
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

Install types:
```bash
npm install -D @types/node
```

### Bun

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "lib": ["ESNext"],
    "types": ["bun-types"],
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  }
}
```

Bun automatically includes its types.

## Type Safety with Hono

### Typed Bindings (Cloudflare)

```typescript
type Bindings = {
  DB: D1Database
  KV: KVNamespace
  API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/users', async (c) => {
  // Type-safe access to bindings
  const db = c.env.DB
  const kv = c.env.KV
  const apiKey = c.env.API_KEY

  const { results } = await db.prepare('SELECT * FROM users').all()
  return c.json(results)
})
```

### Typed Variables

```typescript
type Variables = {
  user: { id: string; name: string }
}

const app = new Hono<{ Variables: Variables }>()

app.use('/api/*', async (c, next) => {
  // Set typed variable
  c.set('user', { id: '123', name: 'Alice' })
  await next()
})

app.get('/api/profile', (c) => {
  // Get typed variable
  const user = c.get('user')
  return c.json(user)
})
```

### Typed Routes with Zod

```typescript
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive()
})

app.post('/users', zValidator('json', userSchema), (c) => {
  // data is automatically typed from schema
  const data = c.req.valid('json')
  return c.json({ success: true, data })
})
```

### RPC Type Safety

For type-safe client-server communication:

```typescript
// server.ts
const route = app.post('/posts', (c) => {
  return c.json({ id: 1, title: 'Hello' })
})

export type AppType = typeof route

// client.ts
import { hc } from 'hono/client'
import type { AppType } from './server'

const client = hc<AppType>('http://localhost:3000')
const res = await client.posts.$post()
const data = await res.json() // Fully typed!
```

## JSX/TSX Configuration

### Using Hono JSX

```typescript
import { Hono } from 'hono'
import { jsx } from 'hono/jsx'

const app = new Hono()

app.get('/', (c) => {
  return c.html(
    <html>
      <body>
        <h1>Hello Hono!</h1>
      </body>
    </html>
  )
})
```

Ensure `jsxImportSource` is set to `hono/jsx` in tsconfig.json.

## Path Aliases

### Setting Up Path Aliases

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@routes/*": ["src/routes/*"],
      "@middleware/*": ["src/middleware/*"]
    }
  }
}
```

Usage:
```typescript
import { authMiddleware } from '@middleware/auth'
import { userRoutes } from '@routes/users'
```

## Common TypeScript Issues

### Module Resolution Errors

**Issue**: Cannot find module 'hono'

**Solution**: Ensure `moduleResolution` is set to `"bundler"` or `"node16"`:
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

### JSX Type Errors

**Issue**: JSX element type does not have any construct or call signatures

**Solution**: Set correct JSX configuration:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  }
}
```

### Generic Type Inference

**Issue**: Type inference not working with `c.get()` or `c.env`

**Solution**: Explicitly type your Hono instance:
```typescript
type Env = {
  Bindings: { DB: D1Database }
  Variables: { user: User }
}

const app = new Hono<Env>()
```
