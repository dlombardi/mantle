# QA Checklist Template

Use this structure for `qa-checklist.md` artifacts produced by Builder in Phase 2.

---

## Template

```markdown
# QA Checklist: [Feature Name]

**Bead ID:** bd-XXXX
**Created:** YYYY-MM-DD
**Builder:** [skill-name that implemented]

---

## Seed Scenario

**Scenario:** `<scenario-name>`
**Description:** [What state the seed creates]

Required test data:
- [Data item 1]
- [Data item 2]

---

## Acceptance Criteria Verification

### AC1: [Criterion from plan.md]

**Steps:**
1. Navigate to [URL/path]
2. [Action to take]
3. [Another action]

**Expected:** [What should happen]

**Evidence:** [Screenshot location, console check, etc.]

---

### AC2: [Criterion from plan.md]

**Steps:**
1. [Steps to verify]

**Expected:** [What should happen]

---

## Functional Tests

### Test 1: [Primary Happy Path]

**Preconditions:** [What must be true before test]

**Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:** [What should happen]

**Pass Criteria:**
- [ ] [Specific checkable item]
- [ ] [Another checkable item]

---

### Test 2: [Error Handling]

**Steps:**
1. [Trigger error condition]

**Expected Result:** [Error message or behavior]

**Pass Criteria:**
- [ ] Error displayed to user
- [ ] No console errors
- [ ] Graceful degradation

---

## Technical Checks

### Console Verification
- [ ] No JavaScript errors
- [ ] No React warnings (in development)
- [ ] No failed network requests

### Network Verification
- [ ] All API calls return 2xx
- [ ] No CORS errors
- [ ] Response times < 3 seconds

### Accessibility Basics
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] No critical a11y violations

---

## Test Suite Verification

```bash
# Run these commands and verify all pass:
bun run test              # Unit tests
bun run test:e2e          # E2E tests
bun run typecheck         # Type check
bun run lint              # Lint check
```

---

## Screenshots/Evidence Locations

| Step | Screenshot Path |
|------|-----------------|
| AC1 verification | `e2e/screenshots/ac1-*.png` |
| Error handling | `e2e/screenshots/error-*.png` |

---

## Notes for QA Agent

[Any special instructions, known issues, or context the QA agent needs]
```

---

## Example: API Endpoint Checklist

```markdown
# QA Checklist: User Preferences API

**Bead ID:** bd-a1b2
**Created:** 2024-01-16
**Builder:** api-backend

---

## Seed Scenario

**Scenario:** `with-test-user`
**Description:** Creates a test user with ID `test-user-123`

Required test data:
- User account with known credentials
- Empty preferences (fresh state)

---

## Acceptance Criteria Verification

### AC1: User can save preferences

**Steps:**
1. Authenticate as test user
2. POST to `/api/preferences` with:
   ```json
   {"theme": "dark", "notifications": true}
   ```
3. Verify 201 response

**Expected:** Preferences saved successfully

**Evidence:** Response body contains saved preferences with ID

---

### AC2: User can retrieve preferences

**Steps:**
1. Authenticate as test user
2. GET `/api/preferences`
3. Verify response matches saved preferences

**Expected:** Previously saved preferences returned

---

### AC3: Preferences persist across sessions

**Steps:**
1. Save preferences (AC1)
2. Clear session/logout
3. Login again
4. Retrieve preferences (AC2)

**Expected:** Same preferences returned after re-login

---

## Functional Tests

### Test 1: Save and Retrieve Flow

**Preconditions:** User authenticated, no existing preferences

**Steps:**
1. POST preferences with valid JSON
2. GET preferences
3. Compare request and response

**Pass Criteria:**
- [ ] POST returns 201
- [ ] GET returns 200
- [ ] Response matches request body

---

### Test 2: Invalid Preferences Rejected

**Steps:**
1. POST with invalid JSON structure
2. Verify 400 response

**Pass Criteria:**
- [ ] 400 status code returned
- [ ] Error message describes validation failure
- [ ] No server error (500)

---

## Technical Checks

### Console Verification
- [ ] No JavaScript errors in browser console
- [ ] API logs show no errors

### Network Verification
- [ ] POST /api/preferences returns 201
- [ ] GET /api/preferences returns 200
- [ ] Invalid requests return 400 (not 500)

---

## Test Suite Verification

```bash
bun run test apps/api/src/routes/preferences.test.ts
```

All tests should pass:
- saves valid preferences
- retrieves saved preferences
- rejects invalid JSON
- returns empty for new user

---

## Notes for QA Agent

- Use test user credentials from seed scenario
- Preferences are stored per-user, verify RLS works
- Check database directly if API returns unexpected results
```

---

## Checklist Writing Guidelines

1. **Be specific** - Include exact URLs, payloads, expected values
2. **Include evidence gathering** - Tell QA where to capture screenshots
3. **Map to acceptance criteria** - Every AC from plan.md needs verification
4. **Test both success and failure** - Include error scenarios
5. **Make it executable** - QA agent should be able to follow without guessing
