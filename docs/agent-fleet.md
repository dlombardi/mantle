# Reasoning Substrate Agent Fleet

This document provides an overview of the agent fleet architecture for the Reasoning Substrate project. For detailed skill instructions, see individual SKILL.md files in the `skills/` directory.

## Fleet Architecture

The agent fleet follows a two-layer architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     CONSULTANT LAYER                         │
│     Establishes patterns before domain work begins           │
├─────────────────────────────────────────────────────────────┤
│  frontend-architect  │  backend-architect  │  testing-       │
│                      │                     │  consultant     │
│  React patterns,     │  API conventions,   │  Test strategy, │
│  state management,   │  error handling,    │  mocking,       │
│  data fetching       │  job patterns       │  coverage       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                            │
│         Owns specific tasks, follows consultant patterns     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐   ┌─────────────────┐                   │
│  │   foundation-   │──▶│    github-      │                   │
│  │   specialist    │   │  integration-   │                   │
│  │                 │   │   specialist    │                   │
│  │  Project setup, │   │                 │                   │
│  │  DB schema,     │   │  OAuth, App     │                   │
│  │  migrations     │   │  installation,  │                   │
│  │                 │   │  webhooks       │                   │
│  └─────────────────┘   └────────┬────────┘                   │
│                                 │                            │
│                                 ▼                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              CORE LOOP SPECIALISTS                   │    │
│  │                                                      │    │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐         │    │
│  │  │ingestion-│──▶│extraction│──▶│validation│         │    │
│  │  │specialist│   │-specialist│   │-ui-      │         │    │
│  │  │          │   │           │   │specialist│         │    │
│  │  │ Fetch    │   │ LLM       │   │          │         │    │
│  │  │ repos,   │   │ pattern   │   │ Triage   │         │    │
│  │  │ index    │   │ extract   │   │ queue,   │         │    │
│  │  │ files    │   │           │   │ cards    │         │    │
│  │  └──────────┘   └───────────┘   └────┬─────┘         │    │
│  │                                      │               │    │
│  │                      ┌───────────────┘               │    │
│  │                      ▼                               │    │
│  │  ┌──────────────┐   ┌──────────────┐                 │    │
│  │  │ enforcement- │◀──│ context-     │                 │    │
│  │  │ specialist   │   │ files-       │                 │    │
│  │  │              │   │ specialist   │                 │    │
│  │  │ PR analysis, │   │              │                 │    │
│  │  │ violations,  │   │ CLAUDE.md,   │                 │    │
│  │  │ status       │   │ .cursorrules │                 │    │
│  │  └──────────────┘   └──────────────┘                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────┐                                         │
│  │polish-          │  ← Runs across all features             │
│  │specialist       │                                         │
│  │                 │                                         │
│  │ Loading states, │                                         │
│  │ empty states,   │                                         │
│  │ settings        │                                         │
│  └─────────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
```

## Core Loop Mapping

| Phase | Primary Skill | Secondary Skills |
|-------|--------------|------------------|
| **Extract** | extraction-specialist | ingestion-specialist |
| **Validate** | validation-ui-specialist | frontend-architect |
| **Enforce** | enforcement-specialist | context-files-specialist |

## Skill Activation Guide

### When Starting a Session

1. Run `bd ready --json` to see available tasks
2. Match the task to a skill using this table:

| Task Type | Primary Skill | Consult First |
|-----------|--------------|---------------|
| Database schema, migrations | foundation-specialist | backend-architect |
| GitHub OAuth, webhooks | github-integration-specialist | backend-architect |
| Repo fetching, file indexing | ingestion-specialist | backend-architect |
| LLM prompts, pattern extraction | extraction-specialist | backend-architect |
| Pattern cards, triage queue | validation-ui-specialist | frontend-architect |
| PR analysis, violations | enforcement-specialist | backend-architect |
| CLAUDE.md generation | context-files-specialist | backend-architect |
| Loading states, polish | polish-specialist | frontend-architect |
| Any testing work | (domain skill) | testing-consultant |

### Skill Location

All skill definitions are in: `skills/<skill-name>/SKILL.md`

## Skill Interfaces

### Data Flow Between Skills

```
github-integration-specialist
    │
    ├── installationId, webhooks ──▶ ingestion-specialist
    │                                      │
    │                                      ├── repo_files ──▶ extraction-specialist
    │                                      │                        │
    │                                      │                        ├── pattern_candidates
    │                                      │                        │       │
    │                                      │                        │       ▼
    │                                      │                        │  validation-ui-specialist
    │                                      │                        │       │
    │                                      │                        │       ├── authoritative patterns
    │                                      │                        │       │
    │                                      │                        ▼       ▼
    │                                      │              enforcement-specialist
    │                                      │                        │
    └── Octokit instances ─────────────────┼────────────────────────┘
                                           │
                                           ▼
                              context-files-specialist
                                           │
                                           ▼
                              (CLAUDE.md, .cursorrules in repo)
```

### Shared Resources

| Resource | Owned By | Used By |
|----------|----------|---------|
| Supabase client | foundation-specialist | All |
| GitHub Octokit | github-integration-specialist | ingestion, enforcement |
| Claude API client | extraction-specialist | extraction, enforcement |
| Trigger.dev jobs | foundation-specialist | ingestion, extraction, enforcement |

## Consultant Skill Outputs

Before domain skills can operate effectively, consultant skills must establish patterns:

### frontend-architect Outputs
- `docs/frontend/component-patterns.md` - React component conventions
- `docs/frontend/state-management.md` - State patterns
- `docs/frontend/data-fetching.md` - Server/client data patterns
- `docs/frontend/accessibility.md` - A11y requirements

### backend-architect Outputs
- `docs/backend/api-conventions.md` - REST API patterns
- `docs/backend/error-handling.md` - Error classes and responses
- `docs/backend/job-patterns.md` - Trigger.dev job conventions
- `docs/backend/database-access.md` - Query patterns

### testing-consultant Outputs
- `docs/testing/strategy.md` - Overall test approach
- `docs/testing/mocking.md` - External service mocking
- `docs/testing/fixtures.md` - Test data factories

## Quick Reference

### Skill Count
- **Consultant Skills**: 3
- **Domain Skills**: 8
- **Total**: 11

### Key Decisions Each Skill Must Honor

| Decision | Skills Affected |
|----------|----------------|
| D4: GitHub App auth | github-integration, ingestion, enforcement |
| D5: Multi-repo (repoId FK) | All domain skills |
| D8: Claude Sonnet 4.5 | extraction, enforcement |
| D10: 1M context window | extraction |
| D11: 4-dimension confidence | extraction, validation-ui |
| D15: No token storage | github-integration |
| D30: Dual channel enforcement | enforcement, context-files |

## Adding New Skills

If the project scope expands, new skills should:

1. Create `skills/<skill-name>/SKILL.md` following Agent Skills spec
2. Define clear task ownership boundaries
3. Specify handoffs to/from existing skills
4. Update this fleet document
5. Reference relevant PRD decisions

## Troubleshooting Skill Conflicts

If two skills seem to own overlapping territory:

1. Check the "Tasks Owned" section of each SKILL.md
2. Refer to the PRD Section 6.2 for phase boundaries
3. The skill with the task in its explicit list owns it
4. If unclear, the consultant skill for that layer decides
