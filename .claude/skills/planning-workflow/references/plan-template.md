# Plan Template

Use this structure for all `plan.md` artifacts in `.beads/artifacts/<bead-id>/`.

---

## Template

```markdown
# Implementation Plan: [Bead Title]

**Bead ID:** bd-XXXX
**Created:** YYYY-MM-DD
**Status:** Draft | Approved

---

## Summary

[1-2 sentence summary of what this plan accomplishes]

---

## Acceptance Criteria

From bead description, mapped to implementation:

- [ ] **AC1:** [Criterion from bead] → [How it will be implemented]
- [ ] **AC2:** [Criterion from bead] → [How it will be implemented]
- [ ] **AC3:** [Criterion from bead] → [How it will be implemented]

---

## Implementation Steps

### Step 1: [First logical unit of work]

**Skill:** `<skill-name>`
**Files:**
- `path/to/file1.ts` - [what changes]
- `path/to/file2.ts` - [what changes]

**Details:**
[Specific implementation notes, code patterns to follow, etc.]

### Step 2: [Second logical unit of work]

**Skill:** `<skill-name>`
**Files:**
- `path/to/file.ts` - [what changes]

**Details:**
[Implementation notes]

### Step N: Tests

**Skill:** `testing-consultant`
**Files:**
- `path/to/file.test.ts` - Unit tests
- `e2e/feature.spec.ts` - E2E test (if applicable)

**Test Scenarios:**
1. [Happy path scenario]
2. [Error case scenario]
3. [Edge case scenario]

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `path/to/new-file.ts` | Create | [Purpose] |
| `path/to/existing.ts` | Modify | [What changes] |
| `path/to/tests.test.ts` | Create | [Test coverage] |

---

## Dependencies

### External Dependencies
- [ ] None / [List any new packages needed]

### Internal Dependencies
- [ ] Requires `[other-bead-id]` to be complete
- [ ] Depends on `[service/module]` being available

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| [What could go wrong] | [High/Medium/Low] | [How to prevent/handle] |

---

## Open Questions

- [ ] [Any decisions that need clarification before implementation]
- [ ] [Anything blocked on external input]

---

## QA Checklist Preview

These verification steps will be expanded in `qa-checklist.md` during Phase 2:

1. [ ] [Primary user flow works]
2. [ ] [Error handling works]
3. [ ] [No console errors]
4. [ ] [Tests pass]
```

---

## Example: API Endpoint Plan

```markdown
# Implementation Plan: Add User Preferences API

**Bead ID:** bd-a1b2
**Created:** 2024-01-15
**Status:** Approved

---

## Summary

Add CRUD endpoints for user preferences with Zod validation and proper error handling.

---

## Acceptance Criteria

- [ ] **AC1:** User can save preferences → POST /api/preferences
- [ ] **AC2:** User can retrieve preferences → GET /api/preferences
- [ ] **AC3:** Preferences persist across sessions → Stored in Supabase

---

## Implementation Steps

### Step 1: Create Preferences Route

**Skill:** `api-backend`
**Files:**
- `apps/api/src/routes/preferences.ts` - New route file
- `apps/api/src/index.ts` - Mount new route

**Details:**
- Follow pattern from `apps/api/src/routes/health.ts`
- Export Zod schemas for validation
- Use `@hono/zod-validator` for request validation

### Step 2: Add Database Schema

**Skill:** `api-backend`
**Files:**
- `supabase/migrations/NNNN_add_preferences.sql` - Migration
- `apps/api/src/lib/db/schema.ts` - Drizzle schema

**Details:**
- Table: `user_preferences`
- Columns: id, user_id, preferences (jsonb), created_at, updated_at
- RLS policy: Users can only access own preferences

### Step 3: Tests

**Skill:** `testing-consultant`
**Files:**
- `apps/api/src/routes/preferences.test.ts` - Unit tests

**Test Scenarios:**
1. POST /api/preferences saves valid preferences
2. POST /api/preferences rejects invalid JSON
3. GET /api/preferences returns user's preferences
4. GET /api/preferences returns empty for new user

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `apps/api/src/routes/preferences.ts` | Create | Route handlers |
| `apps/api/src/index.ts` | Modify | Mount route |
| `supabase/migrations/NNNN_add_preferences.sql` | Create | DB migration |
| `apps/api/src/lib/db/schema.ts` | Modify | Add preferences table |
| `apps/api/src/routes/preferences.test.ts` | Create | Unit tests |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| JSONB query performance | Medium | Add GIN index if queries slow |
| Migration conflicts | Low | Run `bd ready` to check blockers |

---

## QA Checklist Preview

1. [ ] POST /api/preferences returns 201 with valid data
2. [ ] GET /api/preferences returns saved preferences
3. [ ] Invalid requests return 400 with error details
4. [ ] RLS prevents cross-user access
```

---

## Checklist Before Approval

Before marking plan as approved:

- [ ] All acceptance criteria have implementation mapping
- [ ] File paths are complete and accurate
- [ ] Skill routing is specified for each step
- [ ] Test scenarios cover happy path + errors
- [ ] No open questions blocking implementation
- [ ] Risks identified with mitigations
