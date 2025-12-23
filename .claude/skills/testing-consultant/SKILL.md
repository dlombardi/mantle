# Testing Consultant

Testing strategy and patterns for Vitest, React Testing Library, and Playwright.

---

## Activation

Invoke this skill when working on:
- Test infrastructure setup (Vitest, Playwright config)
- Writing unit tests for business logic
- Writing component tests for UI
- Writing API route tests
- Writing E2E tests with Playwright
- Creating mocks for external services
- Improving test coverage or fixing flaky tests

**Trigger keywords:** `test`, `spec`, `mock`, `fixture`, `vitest`, `expect`, `coverage`, `playwright`, `e2e`

**Example triggers:**
- "Write tests for the pattern service"
- "Add E2E tests for the login flow"
- "Create a mock for the Supabase client"
- "Fix the flaky test in patterns.test.ts"
- "Improve test coverage for the API routes"

**Key files:**
- `**/*.test.ts`, `**/*.spec.ts`
- `apps/*/vitest.config.ts`
- `apps/*/playwright.config.ts`
- `e2e/`

---

## Beads Integration

Track testing work with beads:
```bash
# Adding tests for a feature
bd create "Add tests for user settings API"
bd update <id> -s in-progress

# Complete when passing
bun run test && bd complete <id>
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Unit/Integration | Vitest | Fast, ESM-native, Vite integration |
| Components | React Testing Library | User-centric, accessibility-focused |
| E2E | Playwright | Cross-browser, visual testing |
| Runner | Bun | Fast test execution |

---

## Test Organization

### File Structure
```
apps/
├── api/
│   └── src/
│       ├── routes/
│       │   ├── health.ts
│       │   └── health.test.ts      # Co-located
│       └── services/
│           ├── user.ts
│           └── user.test.ts        # Co-located
└── web/
    └── src/
        ├── components/
        │   ├── Button.tsx
        │   └── Button.test.tsx     # Co-located
        └── hooks/
            ├── use-auth.ts
            └── use-auth.test.ts    # Co-located
e2e/
├── auth.spec.ts                    # E2E tests separate
├── settings.spec.ts
└── fixtures/
    └── test-user.ts
```

### Test Pyramid
```
┌─────────────────────┐
│     E2E Tests       │  ← Few, slow, high confidence
│   (Playwright)      │     Critical user flows only
├─────────────────────┤
│ Integration Tests   │  ← More, test boundaries
│  (API routes, DB)   │     Request/response contracts
├─────────────────────┤
│    Unit Tests       │  ← Many, fast, isolated
│ (Functions, Hooks)  │     Business logic
└─────────────────────┘
```

---

## Unit Test Patterns

### Naming Convention
```typescript
describe('functionName', () => {
  it('should [expected behavior] when [condition]', () => {
    // ...
  });
});
```

### Arrange-Act-Assert
```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './format';

describe('formatCurrency', () => {
  it('should format positive amounts with dollar sign', () => {
    // Arrange
    const amount = 1234.56;

    // Act
    const result = formatCurrency(amount);

    // Assert
    expect(result).toBe('$1,234.56');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should throw for negative amounts', () => {
    expect(() => formatCurrency(-100)).toThrow('Amount must be positive');
  });
});
```

---

## Component Test Patterns

### React Testing Library
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should be disabled when loading', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Query Priority (user-centric)
1. `getByRole` - Most accessible
2. `getByLabelText` - Form fields
3. `getByPlaceholderText` - Inputs
4. `getByText` - Non-interactive content
5. `getByTestId` - Last resort

---

## API Test Patterns

### Hono Route Testing
```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { testClient } from 'hono/testing';
import { app } from '../index';

describe('GET /api/health', () => {
  const client = testClient(app);

  it('should return 200 with status', async () => {
    const res = await client.api.health.$get();

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('status', 'ok');
  });
});

describe('POST /api/users', () => {
  it('should create user with valid data', async () => {
    const res = await client.api.users.$post({
      json: { email: 'test@example.com', name: 'Test User' },
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.data).toHaveProperty('id');
  });

  it('should return 400 for invalid email', async () => {
    const res = await client.api.users.$post({
      json: { email: 'invalid', name: 'Test' },
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
```

---

## E2E Test Patterns (Playwright)

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign in with email', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome back')).toBeVisible();
  });
});
```

### Page Object Model
```typescript
// e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign In' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('user can sign in', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');

  await expect(page).toHaveURL('/dashboard');
});
```

### Playwright Config
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Mocking Patterns

### Supabase Client Mock
```typescript
import { vi } from 'vitest';

export function createMockSupabase() {
  return {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    auth: {
      getUser: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
  };
}

// Usage in test
import { createMockSupabase } from './mocks/supabase';

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => createMockSupabase(),
}));
```

### Environment Variables
```typescript
// vitest.config.ts or test setup
import { vi } from 'vitest';

vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('VITE_API_URL', 'http://localhost:3001');
```

### Fetch Mock
```typescript
import { vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ data: 'mocked' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

---

## Test Data Factories

### Generic Factory Pattern
```typescript
// tests/factories/user.ts
import { faker } from '@faker-js/faker';

export function createUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
}

// Usage
const user = createUser({ name: 'Test User' });
```

---

## Validation Commands

```bash
# Unit/Integration tests
bun run test              # Run all tests
bun run test --watch      # Watch mode
bun run test --coverage   # Coverage report

# E2E tests
bun run test:e2e          # Run Playwright tests
bun run test:e2e --ui     # Playwright UI mode
bun run test:e2e --debug  # Debug mode
```

---

## What to Test

### DO Test
- Business logic and calculations
- Edge cases and error handling
- API request/response contracts
- User interactions (clicks, form submissions)
- Critical user flows (E2E)

### DON'T Test
- Implementation details (internal state)
- Third-party library internals
- Trivial code (simple getters)
- Styling (unless critical)

---

## Handoffs

| Upstream | When |
|----------|------|
| `orchestrator-specialist` | Routes testing tasks here |
| `backend-architect` | After implementing services/APIs |
| `frontend-architect` | After implementing components |
| `hono-specialist` | After implementing routes |

Tests are typically the final step in a feature workflow.
