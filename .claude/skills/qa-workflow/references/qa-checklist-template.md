# QA Checklist Template

Use this structure for `qa-checklist.md` artifacts produced by Builder in Phase 2.

> **CRITICAL:** Every test scenario MUST have an `**Actions:**` block with machine-parseable commands.
> Without `**Actions:**`, the QA harness will report 0/0 tests and silently skip verification.

---

## Template

```markdown
# QA Checklist: [Feature Name]

**Bead ID:** bd-XXXX
**Phase:** 3 - Verification
**Scenario:** `none`

---

## Automated Test Scenarios

### AC1: [Acceptance Criterion Title]

**Steps:**
1. Navigate to [URL/path]
2. [Human-readable action]
3. [Expected outcome]

**Expected Result:** [What should happen]

**Actions:**
- navigate: /path
- waitForLoadState: networkidle
- assertTextVisible: Expected text here
- assertElementVisible: heading "Section Title"
- screenshot: ac1-result

---

### AC2: [Another Criterion]

**Steps:**
1. [Human-readable step]
2. [Human-readable step]

**Expected Result:** [What should happen]

**Actions:**
- navigate: /path
- waitForLoadState: networkidle
- click: button "Button Label"
- wait: 500
- assertTextVisible: Success message
- screenshot: ac2-result

---

### AC3: [Form Interaction Example]

**Steps:**
1. Navigate to form
2. Fill in fields
3. Submit

**Expected Result:** [Form submits successfully]

**Actions:**
- navigate: /form
- waitForLoadState: networkidle
- fill: "Email" = "test@example.com"
- fill: "Password" = "password123"
- click: button "Submit"
- waitForLoadState: networkidle
- assertUrlContains: /success
- screenshot: ac3-result

---

## Manual Test Scenarios

The following scenarios cannot be fully automated (OAuth, external services, etc.):

### Manual 1: [External Integration]

1. [ ] Human verification step
2. [ ] Another step requiring external interaction

---

## Exit Criteria

All automated tests (AC*) must pass. Manual scenarios require human verification.
```

---

## Action Syntax Reference

| Action | Syntax | Notes |
|--------|--------|-------|
| **Navigation** | | |
| Navigate | `navigate: /path` | Relative to preview URL |
| **Clicks** | | |
| Click button | `click: button "Label"` | Uses `getByRole('button', {name: 'Label'})` |
| Click link | `click: link "Label"` | Uses `getByRole('link', {name: 'Label'})` |
| Click text | `click: text "Label"` | Uses `getByText('Label')` |
| **Forms** | | |
| Fill input | `fill: "Field Label" = "value"` | Uses `getByLabel('Field Label').fill('value')` |
| **Assertions** | | |
| Assert text visible | `assertTextVisible: Some text` | **Fails if multiple elements match** |
| Assert text gone | `assertTextNotVisible: Some text` | Text should not be visible |
| Assert element visible | `assertElementVisible: heading "Title"` | Use for headings, buttons, links |
| Assert element gone | `assertElementNotVisible: button "Old"` | Element should not exist |
| Assert URL | `assertUrl: /exact-path` | Exact URL match |
| Assert URL contains | `assertUrlContains: /partial` | Partial URL match |
| **Waiting** | | |
| Wait for load | `waitForLoadState: networkidle` | Options: `load`, `domcontentloaded`, `networkidle` |
| Wait for text | `waitForText: Loading` | Wait until text appears |
| Wait for text gone | `waitForTextGone: Loading` | Wait until text disappears |
| Fixed wait | `wait: 500` | Milliseconds (use sparingly) |
| **Screenshots** | | |
| Screenshot | `screenshot: name` | Saved to artifacts directory |

---

## Common Mistakes That Break the Harness

| Mistake | Problem | Fix |
|---------|---------|-----|
| Missing `**Actions:**` section | **0/0 tests run** - harness silently skips | Every AC must have Actions |
| `### 1. Title` | Regex doesn't match | Use `### AC1: Title` or `### Test 1: Title` |
| `assertTextVisible: Repositories` | Matches multiple elements (sidebar, heading, description) → strict mode failure | Use `assertElementVisible: heading "Repositories"` |
| Text in multiple places | "Connect" appears in button AND description | Use specific element: `assertElementVisible: button "Connect"` |
| No `waitForLoadState` after navigate | Assertions run before page loads | Always add `waitForLoadState: networkidle` after navigate |

---

## Choosing Between assertTextVisible and assertElementVisible

**Use `assertTextVisible`** when:
- The text is unique on the page
- You're checking for error messages, success messages
- The text only appears in one location

**Use `assertElementVisible`** when:
- The text might appear in multiple elements (headings, descriptions, buttons)
- You want to verify a specific element type exists
- Checking UI structure (heading hierarchy, button presence)

```markdown
# BAD - "Repositories" appears in heading AND description
- assertTextVisible: Repositories

# GOOD - Specifically targets the heading element
- assertElementVisible: heading "Repositories"

# ALSO GOOD - Use unique text from description
- assertTextVisible: Here's an overview of your repositories
```

---

## Example: UI Feature Checklist

```markdown
# QA Checklist: Dashboard Repository Cards

**Bead ID:** mantle-xyz
**Phase:** 3 - Verification
**Scenario:** `none`

---

## Automated Test Scenarios

### AC1: Dashboard Loads Successfully

**Steps:**
1. Navigate to dashboard
2. Verify page structure is correct

**Expected Result:** Dashboard renders with welcome message

**Actions:**
- navigate: /
- waitForLoadState: networkidle
- assertTextVisible: Welcome back
- assertElementVisible: heading "Your Repositories"
- screenshot: dashboard-loaded

---

### AC2: Empty State Displays When No Repos

**Steps:**
1. Navigate to dashboard (no repos connected)
2. Verify empty state appears

**Expected Result:** Empty state with connect button

**Actions:**
- navigate: /
- waitForLoadState: networkidle
- assertTextVisible: No repositories connected
- assertElementVisible: button "Connect Repository"
- screenshot: empty-state

---

### AC3: Add Repo Modal Opens

**Steps:**
1. Click Add Repo button
2. Verify modal appears

**Expected Result:** GitHub connect modal opens

**Actions:**
- navigate: /
- waitForLoadState: networkidle
- click: button "Add Repo"
- wait: 500
- assertTextVisible: Connect to GitHub
- assertElementVisible: button "Continue to GitHub"
- screenshot: github-modal

---

## Exit Criteria

All AC tests must pass.
```
