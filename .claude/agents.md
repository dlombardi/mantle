# Agent Configuration

This file configures how Claude Code coordinates development work in the Mantle codebase.

---

## Coding Standards

These standards apply to ALL code written by agents:

### TypeScript
- **Strict mode**: All TypeScript files use `strict: true`
- **Explicit types**: No implicit `any`; use explicit types for function parameters and returns
- **Zod validation**: Use Zod for runtime validation, especially for API boundaries and LLM outputs

### API Conventions
- **Response envelope**: `{ data, error, meta }`
- **Error format**: `{ code, message, details }`
- **HTTP semantics**: Use appropriate status codes (200, 201, 400, 401, 404, 500)

### File Organization
- **Colocation**: Keep related files together (component + test + types)
- **Barrel exports**: Use `index.ts` for public module APIs
- **Naming**: `kebab-case` for files, `PascalCase` for components/classes, `camelCase` for functions

### Comments
- **Why not what**: Comment intent and edge cases, not obvious operations
- **JSDoc**: Use for public APIs and complex functions
- **TODO format**: `// TODO(username): description`

---

## Skill Activation Rules

Claude Code automatically activates the appropriate skill based on task context:

| Trigger Pattern | Skill | Activation Keywords |
|-----------------|-------|---------------------|
| API routes, middleware, Hono handlers | `hono-specialist` | `route`, `middleware`, `handler`, `app.`, `c.json` |
| React components, hooks, state | `frontend-architect` | `component`, `useState`, `useQuery`, `tsx`, `props` |
| Tests, mocks, fixtures | `testing-consultant` | `test`, `spec`, `mock`, `fixture`, `vitest`, `expect` |
| Services, jobs, error handling | `backend-architect` | `service`, `job`, `trigger`, `error`, `repository` |
| Config, tooling, monorepo | `foundation-specialist` | `config`, `eslint`, `tsconfig`, `drizzle`, `migration` |
| Task routing, planning | `orchestrator-specialist` | `plan`, `breakdown`, `coordinate`, `which skill` |

### Activation Precedence
1. Explicit user invocation (`/skill-name`) takes highest priority
2. File path patterns (`.ts` in `routes/` → hono-specialist)
3. Keyword matching in task description
4. Default to `orchestrator-specialist` for unclear tasks

---

## Beads Integration

All agents integrate with the beads issue tracking system (`bd` CLI):

### Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  bd create  │ ──▶ │  bd update  │ ──▶ │ bd complete │
│  (start)    │     │  (progress) │     │   (done)    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Commands
- **`bd prime`**: Get AI-optimized context for current work
- **`bd create "task"`**: Create a new issue/task
- **`bd dep add <id> <dep-id>`**: Link task dependencies
- **`bd update <id> -s in-progress`**: Mark work started
- **`bd complete <id>`**: Mark work finished
- **`bd ready`**: Show available work (unblocked tasks)

### When to Create Beads
- Multi-step features that span multiple files
- Work that might be interrupted or handed off
- Tasks with clear dependencies on other work
- Bug fixes that need tracking

### When NOT to Create Beads
- Quick fixes (< 5 minutes)
- Single-file changes
- Exploratory research
- Direct user requests with immediate completion

---

## Handoff Protocol

When work spans multiple skill domains, agents hand off cleanly:

### Handoff Trigger
An agent should hand off when:
1. The current task requires expertise outside its domain
2. A sub-task naturally belongs to another specialist
3. The user explicitly requests a different skill

### Handoff Format
```
HANDOFF TO: <skill-name>
CONTEXT: <brief summary of current state>
TASK: <specific work for the next skill>
FILES: <relevant files to read>
BEADS: <any active bead IDs>
```

### Example Handoff Chain
```
User: "Add a new API endpoint with tests"

orchestrator-specialist (routes task)
    ↓
hono-specialist (creates route + handler)
    ↓ HANDOFF
testing-consultant (writes tests)
    ↓ HANDOFF
backend-architect (reviews error handling)
```

---

## Skill Summary

| Skill | Domain | Primary Files |
|-------|--------|---------------|
| `orchestrator-specialist` | Task routing, beads | Any |
| `hono-specialist` | Hono routes, middleware | `apps/api/src/routes/` |
| `frontend-architect` | React, state, UI | `apps/web/src/` |
| `testing-consultant` | Tests, mocks | `**/*.test.ts`, `**/*.spec.ts` |
| `backend-architect` | Services, jobs, errors | `apps/api/src/services/`, `apps/api/src/jobs/` |
| `foundation-specialist` | Config, tooling | `*.config.*`, `drizzle/`, `supabase/` |
