# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
# Install dependencies (uses Bun)
bun install

# Start development servers (API + Web)
bun run dev

# Run tests
bun test

# Type check
bun run typecheck

# Lint
bun run lint

# Build for production
bun run build
```

---

## Project Overview

**Reasoning Substrate** (codename: Mantle) is an AI-powered developer tool that extracts, validates, and enforces architectural patterns in codebases.

Core loop: **Extract → Validate → Enforce**

- **Extract**: LLM analyzes repo to identify recurring patterns
- **Validate**: Humans review candidates, promote to authoritative
- **Enforce**: PR analysis + AI context files ensure consistency

### Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend** | Vite + React 18 + TanStack Router | Type-safe file-based routing |
| **Styling** | Tailwind CSS + Inter font | Dark mode via CSS variables |
| **Backend** | Hono (Bun runtime) | Lightweight, edge-ready API |
| **Database** | Supabase (Postgres) + Drizzle ORM | 12-table schema with RLS |
| **Auth** | Supabase Auth | Frontend uses anon key, backend uses service role |
| **Jobs** | Trigger.dev | Background processing |
| **LLM** | Claude Sonnet 4.5 | Model: claude-sonnet-4-5-20250929 |
| **GitHub** | GitHub App | OAuth, webhooks, PR integration |
| **Monorepo** | Turborepo + Bun workspaces | Shared configs |

---

## Architecture

### Monorepo Structure

```
mantle/
├── apps/
│   ├── api/                   # Hono backend (port 3001)
│   │   ├── src/
│   │   │   ├── index.ts       # Entry point, middleware
│   │   │   ├── routes/        # API route handlers
│   │   │   └── lib/
│   │   │       ├── db/        # Drizzle schema + client
│   │   │       ├── supabase/  # Supabase admin client
│   │   │       ├── trigger/   # Trigger.dev config
│   │   │       └── validation/ # Zod schemas
│   │   └── drizzle.config.ts
│   │
│   └── web/                   # Vite + React frontend (port 3000)
│       ├── src/
│       │   ├── main.tsx       # React entry point
│       │   ├── routes/        # TanStack Router files
│       │   │   ├── __root.tsx # Root layout
│       │   │   └── index.tsx  # Home page
│       │   ├── lib/           # Utilities
│       │   │   └── supabase.ts
│       │   └── styles/
│       ├── index.html
│       └── vite.config.ts
│
├── supabase/
│   └── migrations/            # SQL migrations
│
└── turbo.json                 # Turborepo config
```

### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api` | GET | API info |
| `/api/health` | GET | Full health status |
| `/api/health/live` | GET | Liveness probe |
| `/api/health/ready` | GET | Readiness probe (checks DB) |
| `/api/example` | GET | Validation demo (pagination) |
| `/api/example/:id` | GET | Validation demo (UUID param) |
| `/api/example/connect` | POST | Validation demo (JSON body) |

---

## Key Decisions

| ID | Decision | Impact |
|----|----------|--------|
| D4 | GitHub App auth model | Use @octokit/auth-app, not OAuth tokens |
| D5 | Multi-repo from day 1 | repoId is FK on everything |
| D8 | Claude Sonnet 4.5 | Model: claude-sonnet-4-5-20250929 |
| D10 | 1M context window | Use anthropic-beta header; 600k token limit |
| D11 | 4-dimension confidence | Evidence, Adoption, Establishment, Location |
| D15 | No token storage | Only store installationId, generate tokens on-demand |
| D30 | Dual channel enforcement | PR review + AI context as separate toggles |
| D31 | Hono over NestJS | Lightweight, edge-ready, Bun-native |
| D32 | TanStack Router over Next.js | Type-safe SPA, faster dev builds |

---

## Code Conventions

### TypeScript
- Strict mode enabled in both apps
- Use Zod for runtime validation (API requests, LLM outputs)
- ESM modules (`"type": "module"`)

### Backend (Hono)
- Singleton pattern for DB, Supabase, and Trigger clients
- Route files export Hono instances, mounted in `index.ts`
- Use `@hono/zod-validator` for request validation
- Global error handler for consistent error responses

### Frontend (React)
- TanStack Router for type-safe navigation
- Route files define `Route` with `createFileRoute`
- Use `@fontsource/inter` for typography
- VITE_* env vars for client-side config

### Database
- Drizzle ORM with postgres driver
- All tables have RLS policies
- Migrations in `supabase/migrations/` with numbered prefixes
- Schema in `apps/api/src/lib/db/schema.ts`

### Background Jobs
- Trigger.dev SDK configured at app startup
- Jobs must be idempotent
- Max 3 retry attempts with exponential backoff

---

## Environment Variables

### Backend (apps/api/.env)

```env
# Database
DATABASE_URL=postgresql://...

# Supabase (admin)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Trigger.dev
TRIGGER_SECRET_KEY=your-trigger-secret

# Server
PORT=3001
CORS_ORIGIN=http://localhost:3000

# GitHub App (future)
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=

# Anthropic (future)
ANTHROPIC_API_KEY=
```

### Frontend (apps/web/.env)

```env
# Supabase (client)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API (optional, uses proxy in dev)
VITE_API_URL=http://localhost:3001
```

---

## Common Tasks

### Adding a New API Route

1. Create route file in `apps/api/src/routes/<name>.ts`
2. Export a Hono instance with handlers
3. Mount in `apps/api/src/index.ts`
4. Add Zod schemas for validation in `lib/validation/schemas.ts`

```typescript
// apps/api/src/routes/repos.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createRepoSchema } from '../lib/validation';

export const repoRoutes = new Hono();

repoRoutes.post('/', zValidator('json', createRepoSchema), async (c) => {
  const body = c.req.valid('json');
  // ... implementation
  return c.json({ data: result });
});
```

### Adding a New Frontend Route

1. Create route file in `apps/web/src/routes/<path>.tsx`
2. Export `Route` using `createFileRoute`
3. Route tree auto-regenerates on save

```typescript
// apps/web/src/routes/repos/index.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/repos/')({
  component: ReposPage,
});

function ReposPage() {
  return <div>Repos list</div>;
}
```

### Adding a Database Table

1. Add table definition in `apps/api/src/lib/db/schema.ts`
2. Create migration: `supabase/migrations/XXX_<name>.sql`
3. Add TypeScript types in `apps/api/src/lib/db/types.ts`
4. Add RLS policies in the migration

### Running Background Jobs

1. Define job in `apps/api/src/jobs/<name>.ts`
2. Ensure `TRIGGER_SECRET_KEY` is configured
3. Jobs are registered at app startup via `initTrigger()`

---

## Testing

| Layer | Framework | Location |
|-------|-----------|----------|
| **Unit/Integration** | Vitest | `apps/*/src/**/*.test.ts` |
| **Components** | React Testing Library + jsdom | `apps/web/src/**/*.test.tsx` |
| **E2E** | Playwright | `e2e/*.spec.ts` |
| **Shared Mocks** | @mantle/test-utils | `packages/test-utils/` |

- **Coverage target**: 80% for business logic
- **Mock boundary**: External APIs (GitHub, Anthropic, Supabase)
- **API testing**: Uses Zod response schemas for type-safe assertions

```bash
# Unit/Integration tests (via Turbo)
bun run test              # Run all tests
bun run test:coverage     # With coverage report

# E2E tests (Playwright)
bun run test:e2e          # Run Playwright tests
bun run test:e2e:ui       # Playwright UI mode
bun run test:e2e:headed   # See browser

# Combined
bun run test:all          # Unit + E2E
```

### Test Configuration

| Config | Location |
|--------|----------|
| API Vitest | `apps/api/vitest.config.ts` |
| Web Vitest | `apps/web/vitest.config.ts` |
| Playwright | `playwright.config.ts` (root) |
| Turbo tasks | `turbo.json` |
