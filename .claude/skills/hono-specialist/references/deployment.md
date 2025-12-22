# Hono Deployment Guides

This reference contains platform-specific deployment instructions for Hono applications.

## Cloudflare Workers

### Prerequisites

Install Wrangler CLI:
```bash
npm install -D wrangler
```

### Authentication

```bash
npx wrangler login
```

### Deployment

```bash
npx wrangler deploy
```

### Configuration

Ensure `wrangler.toml` is properly configured:
```toml
name = "my-hono-app"
main = "src/index.ts"
compatibility_date = "2024-01-01"
```

## Vercel

### Zero-Config Deployment

Vercel supports Hono out of the box (as of Aug 2025):

```bash
vercel deploy
```

### Configuration (Optional)

Create `vercel.json` if custom configuration is needed:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

## Deno Deploy

### Prerequisites

Install deployctl:
```bash
deno install -Arf https://deno.land/x/deploy/deployctl.ts
```

### Deployment

```bash
deployctl deploy --project=my-project src/index.ts
```

### Environment Variables

Set via Deno Deploy dashboard or CLI:
```bash
deployctl deploy --project=my-project --env-file=.env src/index.ts
```

## AWS Lambda

### Using Adapter

```typescript
import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'

const app = new Hono()

// Define routes
app.get('/', (c) => c.text('Hello from Lambda!'))

// Export handler
export const handler = handle(app)
```

### Deployment

Use AWS SAM, Serverless Framework, or CDK for deployment.

Example with Serverless Framework:
```yaml
service: hono-lambda

provider:
  name: aws
  runtime: nodejs20.x

functions:
  api:
    handler: dist/index.handler
    events:
      - httpApi: '*'
```

## Bun

### Development Server

```bash
bun run src/index.ts
```

### Production

```bash
bun build src/index.ts --outdir dist --target bun
bun run dist/index.js
```

### Configuration

Create `bunfig.toml` for Bun-specific settings:
```toml
[build]
target = "bun"
outdir = "dist"
```

## Node.js

### Using Node Adapter

```typescript
import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

// Define routes
app.get('/', (c) => c.text('Hello from Node!'))

// Start server
serve(app)
```

### Production Deployment

1. Build the application:
```bash
npm run build
```

2. Use a process manager like PM2:
```bash
pm2 start dist/index.js
```

3. Or use Docker:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

## Pre-Deployment Optimization

Before deploying to any platform, optimize the build:

```bash
hono optimize src/index.ts -o dist/optimized.js
```

Benefits:
- ~38% smaller bundle size
- 16.5× faster initialization
- Better cold start performance

## Environment Variables

### Platform-Specific Handling

**Cloudflare Workers:**
```typescript
type Bindings = {
  API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  const apiKey = c.env.API_KEY
  return c.json({ key: apiKey })
})
```

**Vercel/Node.js:**
```typescript
app.get('/', (c) => {
  const apiKey = process.env.API_KEY
  return c.json({ key: apiKey })
})
```

**Deno:**
```typescript
app.get('/', (c) => {
  const apiKey = Deno.env.get('API_KEY')
  return c.json({ key: apiKey })
})
```

## Common Deployment Issues

### Bundle Size Too Large

Solution: Use `hono optimize` and `hono/tiny` preset.

### Cold Start Performance

Solution:
- Pre-compile routes with `hono optimize`
- Minimize dependencies
- Use edge runtimes when possible

### CORS Issues

Solution: Configure CORS middleware properly for your domain:
```typescript
import { cors } from 'hono/cors'

app.use('/*', cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  credentials: true
}))
```
