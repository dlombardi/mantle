# Hono Specialist

Provides guidance for developing web applications and APIs with the Hono framework on Bun runtime.

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

## Overview

Hono is a lightweight, fast web framework built on Web Standards that runs on multiple JavaScript runtimes:
- Cloudflare Workers
- Deno
- Bun
- Vercel
- AWS Lambda
- Node.js

Key characteristics:
- Small bundle size (hono/tiny preset < 14kB)
- Fast RegExpRouter
- Zero dependencies option
- First-class TypeScript support
- Web Standards API only

## Workflow

Follow this sequence when assisting with Hono development:

1. **Identify runtime target** - Ask the user about their target platform (Cloudflare, Deno, Bun, Node.js, etc.)
2. **Search documentation** - Use `hono search <query>` to find relevant documentation topics
3. **Load details** - Use `hono docs <path>` to retrieve specific documentation sections
4. **Implement** - Write code following patterns in `references/patterns.md`
5. **Test locally** - Use `hono request` for quick testing or `hono serve` for development server
6. **Optimize** - Run `hono optimize` before production deployment

## Project Creation

### Use create-hono CLI

Create new Hono projects using the official CLI:

```bash
# npm
npm create hono@latest

# Bun
bunx create-hono

# Deno
deno run -A npm:create-hono
```

Prompt the user to choose:
1. **Runtime target**: Cloudflare Workers, Deno, Bun, Node.js, Vercel, AWS Lambda, etc.
2. **Template**: Basic, with JSX, with validation, etc.
3. **Package manager**: npm, yarn, pnpm, bun

### Project Structure

Recommend this structure:

```
my-hono-app/
├── src/
│   ├── index.ts          # Main application entry
│   ├── routes/           # Route handlers
│   ├── middleware/       # Custom middleware
│   └── lib/              # Utilities and helpers
├── test/                 # Test files
├── package.json
├── tsconfig.json
└── [runtime-config]      # wrangler.toml, vercel.json, etc.
```

## Hono CLI (@hono/cli)

The official Hono CLI provides commands designed for AI-assisted development.

### Installation

Install as a dev dependency:

```bash
npm install -D @hono/cli
```

### CLI Commands

#### hono docs [path]

Retrieve documentation as Markdown:

```bash
# Get all docs
hono docs

# Get specific section
hono docs concepts/middleware
```

Use when needing to reference official documentation during development.

#### hono search <query>

Return JSON-formatted search results:

```bash
hono search "middleware"
hono search "routing"
```

Use when needing to discover relevant documentation paths.

#### hono request [file]

Test Hono applications without starting a server:

```bash
# Basic request
hono request src/index.ts

# POST with data
hono request -X POST -d '{"name":"John"}' src/index.ts

# Custom path
hono request -P /api/users src/index.ts

# Combined flags
hono request -X POST -P /api/users -d '{"name":"Alice"}' src/index.ts
```

**Flags**:
- `-X <METHOD>`: HTTP method (GET, POST, PUT, DELETE, etc.)
- `-P <PATH>`: Request path
- `-d <DATA>`: Request body

Use when testing APIs during development without server startup overhead.

#### hono serve [file]

Launch application on `localhost:7070`:

```bash
# Basic serve
hono serve src/index.ts

# With middleware injection (no code modification needed)
hono serve --use logger --use compress src/index.ts
```

Use when quick local testing or development with dynamic middleware is needed.

#### hono optimize [entry]

Generate optimized build using `PreparedRegExpRouter`:

```bash
hono optimize src/index.ts

# Output to specific file
hono optimize src/index.ts -o dist/optimized.js
```

**Benefits**:
- ~38% smaller bundle size
- 16.5× faster initialization
- Pre-compiles route information as hardcoded strings

Use when preparing for production deployment, especially for edge runtimes where bundle size matters.

## Development Guidance

### Code Patterns

Reference `references/patterns.md` for:
- Routing patterns (basic, path params, query params, nested)
- Middleware usage (global, route-specific, built-in options)
- Validation with Zod
- Error handling
- Database integration examples
- Testing patterns with Vitest

### TypeScript Configuration

Reference `references/typescript.md` for:
- Runtime-specific tsconfig.json setups
- Type safety with Bindings and Variables
- JSX/TSX configuration
- Path aliases
- Common TypeScript issues and solutions

### Deployment

Reference `references/deployment.md` for platform-specific deployment instructions:
- Cloudflare Workers
- Vercel
- Deno Deploy
- AWS Lambda
- Bun
- Node.js

Always recommend running `hono optimize` before deployment.

## HonoX Meta-Framework

Suggest HonoX when the user needs:
- Server-side rendered applications
- File-based routing
- Islands architecture (partial hydration)
- Vite integration

Create HonoX project:
```bash
npm create hono@latest -- --template honox
```

Key features:
- File-based routing in `app/routes/`
- Islands in `app/islands/`
- Server functions
- Vite integration

## When to Use This Skill

Activate this skill when the user:
- Creates a new Hono project
- Asks about Hono CLI tools (docs, search, request, serve, optimize)
- Tests Hono APIs without starting a server
- Optimizes Hono apps for production deployment
- Works with Hono routing, middleware, or configuration
- Deploys Hono to any platform
- Migrates to Hono from another framework
- Works with HonoX or full-stack Hono applications
- Configures TypeScript for Hono
- Sets up testing for Hono apps
- Works with runtime-specific Hono features (Cloudflare, Deno, Bun, etc.)
- Requests performance optimization strategies

## Key Principles

- Proactively use Hono CLI commands (`hono docs`, `hono search`, `hono request`) during development
- Recommend `hono optimize` for production deployments
- Suggest appropriate middleware and patterns for the use case
- Consider suggesting HonoX for full-stack needs
- Use `create-hono` CLI for new projects rather than manual setup
- Verify package.json scripts match the runtime environment
- Follow the workflow: Identify → Search → Load docs → Implement → Test → Optimize

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
- GitHub: https://github.com/honojs/hono
- Hono CLI: https://github.com/honojs/hono/tree/main/packages/cli
- HonoX: https://github.com/honojs/honox
- Examples: https://github.com/honojs/examples
