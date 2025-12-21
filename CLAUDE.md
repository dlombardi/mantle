# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## Project Overview

**Reasoning Substrate** (codename: Mantle) is an AI-powered developer tool that extracts, validates, and enforces architectural patterns in codebases.

Core loop: **Extract → Validate → Enforce**

- **Extract**: LLM analyzes repo to identify recurring patterns
- **Validate**: Humans review candidates, promote to authoritative
- **Enforce**: PR analysis + AI context files ensure consistency

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind
- **Backend**: Supabase (Postgres, Auth, Storage, Realtime)
- **Jobs**: Trigger.dev for background processing
- **LLM**: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
- **GitHub**: GitHub App for OAuth, webhooks, PR integration

---

## Architecture

### Skill-Based Agent Fleet

The codebase is organized around specialist domains. Each skill owns specific files and responsibilities:

| Domain | Owns | Key Files |
|--------|------|-----------|
| `foundation` | Infrastructure, auth, database | `supabase/migrations/`, `lib/db/`, `lib/supabase/` |
| `github-integration` | GitHub App, OAuth, webhooks | `lib/github/`, `app/auth/`, `app/api/github/` |
| `ingestion` | Repo fetching, git metadata | `lib/ingestion/`, `jobs/ingest-repo.ts` |
| `extraction` | LLM patterns, confidence scoring | `lib/extraction/`, `lib/anthropic/`, `jobs/extract-patterns.ts` |
| `validation-ui` | Triage queue, pattern cards | `app/patterns/`, `components/patterns/` |
| `enforcement` | PR analysis, violations | `lib/enforcement/`, `jobs/analyze-pr.ts` |
| `context-files` | AI context generation | `lib/context-files/`, `jobs/sync-context-files.ts` |
| `polish` | Loading states, settings | `components/ui/`, `app/settings/` |

### Consultant Patterns

Before building features, check if patterns are documented in:
- `docs/frontend/` - React patterns, state management, data fetching
- `docs/backend/` - API conventions, error handling, job patterns
- `docs/testing/` - Test strategy, mocking, coverage approach

---

## File Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Auth callbacks
│   ├── patterns/          # Pattern pages
│   ├── repos/             # Repo pages
│   └── ...
├── components/            # React components
│   ├── ui/               # Shared primitives
│   ├── patterns/         # Pattern-specific
│   ├── repos/            # Repo-specific
│   └── ...
├── lib/                   # Core libraries
│   ├── api/              # API helpers, response utils
│   ├── db/               # Database access
│   ├── errors/           # Error classes
│   ├── github/           # GitHub integration
│   ├── anthropic/        # Claude API client
│   ├── extraction/       # Pattern extraction
│   ├── enforcement/      # Violation detection
│   ├── context-files/    # AI context generation
│   └── types/            # TypeScript types
├── hooks/                 # React hooks
├── jobs/                  # Trigger.dev jobs
└── supabase/
    └── migrations/        # SQL migrations
```

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

---

## Code Conventions

### TypeScript
- Strict mode enabled
- Use Zod for runtime validation (especially LLM outputs)

### Database
- All tables have RLS policies
- Migrations in `supabase/migrations/` with numbered prefixes

### Background Jobs
- All jobs in `jobs/` directory
- Max 3 retry attempts with exponential backoff
- Jobs must be idempotent

### API Routes
- Response envelope: `{ data, error, meta }`
- Error format: `{ code, message, details }`
- Use Zod for request validation

---

## Testing

- **Test runner**: Vitest
- **Component tests**: React Testing Library
- **Coverage target**: 80% for business logic
- **Mock boundary**: External APIs (GitHub, Anthropic), not internal modules

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm run test:coverage # Coverage report
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# GitHub App
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Anthropic
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Common Tasks

### Adding a New API Route
1. Check `docs/backend/api-conventions.md` for patterns
2. Create route in `app/api/[resource]/route.ts`
3. Use Zod schema for validation
4. Use response helpers from `lib/api/response.ts`

### Adding a New Background Job
1. Check `docs/backend/job-patterns.md` for patterns
2. Create job in `jobs/<name>.ts`
3. Configure retry logic (max 3, exponential backoff)
4. Ensure idempotency

### Adding a Database Table
1. Create migration: `supabase/migrations/XXX_<name>.sql`
2. Add TypeScript types in `lib/db/types.ts`
3. Add RLS policies
