# QA Report Template

Use this structure for `qa-report.md` artifacts produced by QA agent in Phase 3.

---

## Template

```markdown
# QA Report: [Feature Name]

**Bead ID:** bd-XXXX
**Report Date:** YYYY-MM-DD HH:MM
**Iteration:** N/3
**Preview URL:** [URL tested]

---

## Summary

| Category | Status | Details |
|----------|--------|---------|
| **Overall** | PASS / FAIL | [Brief summary] |
| **Acceptance Criteria** | X/Y passed | [List any failures] |
| **Functional Tests** | X/Y passed | [List any failures] |
| **Technical Checks** | PASS / FAIL | [Issues found] |
| **Test Suite** | PASS / FAIL | [Failures] |

---

## Acceptance Criteria Results

### AC1: [Criterion]

**Status:** PASS / FAIL

**Evidence:**
- [What was observed]
- [Screenshot: path/to/screenshot.png]

**Issues:** [If failed, describe what went wrong]

---

### AC2: [Criterion]

**Status:** PASS / FAIL

**Evidence:**
- [Observations]

---

## Functional Test Results

### Test 1: [Test Name]

**Status:** PASS / FAIL

**Execution:**
1. [Step performed] → [Result]
2. [Step performed] → [Result]

**Issues:** [If failed]

---

### Test 2: [Test Name]

**Status:** PASS / FAIL

---

## Technical Check Results

### Console
- [ ] No JavaScript errors: PASS / FAIL
- [ ] No React warnings: PASS / FAIL

**Console Output (if errors):**
```
[Paste any error messages]
```

### Network
- [ ] All API calls successful: PASS / FAIL
- [ ] No CORS errors: PASS / FAIL
- [ ] Response times acceptable: PASS / FAIL

**Failed Requests:**
| URL | Status | Error |
|-----|--------|-------|
| [URL] | [code] | [message] |

### Accessibility
- [ ] Keyboard navigation: PASS / FAIL
- [ ] Focus states: PASS / FAIL

---

## Test Suite Results

```
$ bun run test
[Paste output]
```

**Status:** PASS / FAIL
**Failed Tests:** [List if any]

---

## Screenshots

| Description | Path |
|-------------|------|
| [What it shows] | `e2e/screenshots/qa-*.png` |

---

## Environment Details

- **Preview URL:** [URL]
- **Seed Scenario:** [scenario used]
- **Browser:** Chromium [version]
- **Timestamp:** [when tests ran]

---

## Conclusion

### If PASS:
All acceptance criteria verified. Ready for merge.

### If FAIL:
**Issues to Fix:**
1. [Issue 1 - specific and actionable]
2. [Issue 2 - specific and actionable]

**Recommended Actions:**
- [What Builder should do to fix]

---

## Next Steps

| Outcome | Action |
|---------|--------|
| PASS | `bd close <id> --reason "QA passed"` |
| FAIL (retry) | Return to Phase 2 with this report |
| FAIL (escalate) | `bd label add <id> needs-human` |
```

---

## Example: PASS Report

```markdown
# QA Report: User Preferences API

**Bead ID:** bd-a1b2
**Report Date:** 2024-01-16 14:32
**Iteration:** 1/3
**Preview URL:** https://mantle-bd-a1b2.vercel.app

---

## Summary

| Category | Status | Details |
|----------|--------|---------|
| **Overall** | PASS | All criteria met |
| **Acceptance Criteria** | 3/3 passed | |
| **Functional Tests** | 4/4 passed | |
| **Technical Checks** | PASS | No issues |
| **Test Suite** | PASS | 8/8 tests pass |

---

## Acceptance Criteria Results

### AC1: User can save preferences

**Status:** PASS

**Evidence:**
- POST /api/preferences returned 201
- Response body: `{"id": "pref-123", "theme": "dark", "notifications": true}`
- Screenshot: `e2e/screenshots/qa-save-prefs.png`

---

### AC2: User can retrieve preferences

**Status:** PASS

**Evidence:**
- GET /api/preferences returned 200
- Response matched saved preferences

---

### AC3: Preferences persist across sessions

**Status:** PASS

**Evidence:**
- Logged out and back in
- Preferences still present

---

## Test Suite Results

```
$ bun run test apps/api/src/routes/preferences.test.ts
 ✓ saves valid preferences (12ms)
 ✓ retrieves saved preferences (8ms)
 ✓ rejects invalid JSON (4ms)
 ✓ returns empty for new user (6ms)

Test Files  1 passed (1)
Tests       4 passed (4)
```

**Status:** PASS

---

## Conclusion

All acceptance criteria verified. Ready for merge.

## Next Steps

```bash
bd close bd-a1b2 --reason "QA passed - all acceptance criteria verified"
bd label add bd-a1b2 qa:passed
```
```

---

## Example: FAIL Report

```markdown
# QA Report: User Preferences API

**Bead ID:** bd-a1b2
**Report Date:** 2024-01-16 14:32
**Iteration:** 2/3
**Preview URL:** https://mantle-bd-a1b2.vercel.app

---

## Summary

| Category | Status | Details |
|----------|--------|---------|
| **Overall** | FAIL | AC3 failed |
| **Acceptance Criteria** | 2/3 passed | AC3 - persistence broken |
| **Functional Tests** | 3/4 passed | Session test failed |
| **Technical Checks** | PASS | No issues |
| **Test Suite** | PASS | Tests pass but don't cover this case |

---

## Acceptance Criteria Results

### AC1: User can save preferences

**Status:** PASS

---

### AC2: User can retrieve preferences

**Status:** PASS

---

### AC3: Preferences persist across sessions

**Status:** FAIL

**Evidence:**
- Saved preferences successfully
- Logged out
- Logged back in
- GET /api/preferences returned empty object `{}`

**Console Output:**
```
No errors in console
```

**Network:**
- GET /api/preferences returned 200
- But response body was empty

---

## Conclusion

AC3 failed - preferences do not persist after logout/login cycle.

**Issues to Fix:**
1. Preferences query may be using session-based user ID instead of database user ID
2. Possible RLS policy issue - check if user_id matches after re-auth

**Recommended Actions:**
- Check `apps/api/src/routes/preferences.ts` for how user ID is obtained
- Verify RLS policy allows reads for authenticated user
- Add test case for session persistence

---

## Next Steps

Return to Phase 2 with this report:

```
HANDOFF TO: hono-specialist
PHASE: 2 (Implementation - Iteration 3)
BEAD: bd-a1b2
CONTEXT: QA failed on AC3 - persistence issue
TASK: Fix preferences retrieval after re-authentication
FILES: .beads/artifacts/bd-a1b2/qa-report.md
```
```

---

## Report Writing Guidelines

1. **Be specific about failures** - Don't just say "failed", explain what happened
2. **Include evidence** - Screenshots, console output, network logs
3. **Make fixes actionable** - Builder should know exactly what to fix
4. **Record environment** - URL, seed scenario, browser version
5. **Track iterations** - Always note which iteration this is
