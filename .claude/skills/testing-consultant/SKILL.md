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
- `apps/*/src/**/*.test.ts` - Unit tests (co-located)
- `apps/api/vitest.config.ts` - API Vitest config
- `apps/web/vitest.config.ts` - Web Vitest config
- `playwright.config.ts` - E2E config (root, dual webServer)
- `e2e/*.spec.ts` - E2E test specs
- `e2e/pages/*.ts` - Page Object Models
- `packages/test-utils/` - Shared mocks and factories

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
mantle/
├── apps/
│   ├── api/
│   │   ├── vitest.config.ts        # API test config
│   │   └── src/
│   │       ├── test/
│   │       │   └── setup.ts        # Mocks for db, trigger
│   │       └── routes/
│   │           ├── health.ts       # Route + Zod schemas
│   │           └── health.test.ts  # Co-located tests
│   └── web/
│       ├── vitest.config.ts        # Web test config (jsdom)
│       └── src/
│           ├── test/
│           │   ├── setup.ts        # Supabase mock
│           │   └── test-utils.tsx  # Custom render wrapper
│           └── lib/
│               └── supabase.test.ts
├── packages/
│   ├── trpc/                       # tRPC router tests
│   │   ├── vitest.config.ts
│   │   └── src/
│   │       └── router.test.ts      # createCaller tests
│   └── test-utils/                 # Shared test utilities
│       └── src/
│           ├── mocks/supabase.ts   # createMockSupabaseClient
│           └── factories/          # User, pattern, repo factories
├── e2e/
│   ├── health.spec.ts              # E2E tests
│   └── pages/
│       ├── BasePage.ts             # Page Object Model base
│       └── HomePage.ts
└── playwright.config.ts            # Dual webServer (API + Web)
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

### Hono Route Testing with Zod Schemas

Use Zod schemas for type-safe response validation (eliminates `as` assertions):

```typescript
// routes/health.ts - Export Zod schemas alongside routes
import { z } from 'zod';

export const liveResponseSchema = z.object({ status: z.literal('ok') });
export type LiveResponse = z.infer<typeof liveResponseSchema>;

// routes/health.test.ts
import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { healthRoutes, liveResponseSchema, healthResponseSchema } from './health';
import { dbHealthCheck } from '@/lib/db';
import { isTriggerConfigured } from '@/lib/trigger';

vi.mock('@/lib/db');
vi.mock('@/lib/trigger');

describe('Health Routes', () => {
  const app = new Hono().route('/health', healthRoutes);

  it('GET /health/live returns ok status', async () => {
    const res = await app.request('/health/live');

    expect(res.status).toBe(200);
    // Zod parse provides runtime validation + type inference
    const data = liveResponseSchema.parse(await res.json());
    expect(data.status).toBe('ok');
  });

  it('GET /health returns healthy when services are up', async () => {
    vi.mocked(dbHealthCheck).mockResolvedValue({ connected: true });
    vi.mocked(isTriggerConfigured).mockReturnValue(true);

    const res = await app.request('/health');
    const data = healthResponseSchema.parse(await res.json());

    expect(data.status).toBe('healthy');
    expect(data.services.database.connected).toBe(true);
    expect(data.services.trigger.configured).toBe(true);
  });
});
```

### Key Pattern: Zod as Single Source of Truth

- Export schemas from route files
- Tests use `schema.parse()` instead of `as` type assertions
- Runtime validation catches API contract violations
- TypeScript infers types from schemas automatically

---

## tRPC Testing Patterns

### Testing with createCaller

tRPC provides `createCaller()` for direct procedure invocation without HTTP:

```typescript
import { describe, it, expect } from 'vitest';
import { appRouter } from '@mantle/trpc';
import { TRPCError } from '@trpc/server';
import type { Context } from '@mantle/trpc';

// Mock context factory
function createMockContext(user: Context['user'] = null): Context {
  return {
    db: {} as Context['db'],  // Mock or real test DB
    user,
    req: new Request('http://localhost/trpc'),
  };
}

function createAuthContext(userId = 'test-user-id'): Context {
  return createMockContext({
    id: userId,
    githubId: 12345,
    githubUsername: 'testuser',
  });
}

describe('patterns router', () => {
  describe('list', () => {
    it('requires authentication', async () => {
      const caller = appRouter.createCaller(createMockContext());

      await expect(
        caller.patterns.list({ repoId: 'uuid' })
      ).rejects.toThrow(TRPCError);
    });

    it('returns paginated patterns when authenticated', async () => {
      const caller = appRouter.createCaller(createAuthContext());

      const result = await caller.patterns.list({
        repoId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        page: 1,
        limit: 10,
      });

      expect(result.items).toBeDefined();
      expect(result.page).toBe(1);
    });
  });

  describe('updateStatus', () => {
    it('validates rejection reason when rejecting', async () => {
      const caller = appRouter.createCaller(createAuthContext());

      await expect(
        caller.patterns.updateStatus({
          id: 'uuid',
          status: 'rejected',
          // Missing required rejectionReason
        })
      ).rejects.toThrow(TRPCError);
    });
  });
});
```

### Testing Input Validation

Zod validation errors become TRPCError with code 'BAD_REQUEST':

```typescript
it('validates input schema', async () => {
  const caller = appRouter.createCaller(createAuthContext());

  await expect(
    caller.patterns.list({
      repoId: 'not-a-uuid',  // Invalid UUID
    })
  ).rejects.toMatchObject({
    code: 'BAD_REQUEST',
  });
});
```

### Benefits of createCaller Testing

- **No HTTP overhead** - Direct procedure invocation
- **Full type inference** - Input/output types checked at compile time
- **Context control** - Easily test auth/unauth scenarios
- **Middleware testing** - Auth middleware runs as in production

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

### Playwright Config (Dual WebServer)

Our config starts both API and Web servers for full-stack E2E testing:

```typescript
// playwright.config.ts (root)
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Dual webServer: start API first, then Web
  webServer: [
    {
      command: 'bun run dev',
      cwd: './apps/api',
      url: 'http://localhost:3001/api/health/live',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'bun run dev',
      cwd: './apps/web',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
```

**Key Points:**
- Array syntax for `webServer` starts both servers
- API server starts first (port 3001), then Web (port 3000)
- Health endpoint URL used to verify API is ready
- `reuseExistingServer` allows running tests against already-running dev servers

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
# Unit/Integration tests (via Turbo)
bun run test              # Run all tests
bun run test:coverage     # With coverage report

# E2E tests
bun run test:e2e          # Run Playwright tests
bun run test:e2e:ui       # Playwright UI mode
bun run test:e2e:headed   # See browser

# Combined
bun run test:all          # Unit + E2E

# Per-app (without Turbo)
cd apps/api && bun run test --watch
cd apps/web && bun run test --watch
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

## Testing Scope in Three-Phase Workflow

This skill covers **unit, integration, and E2E tests** (Phase 2). QA verification (Phase 3) is handled by `qa-workflow`.

| Test Type | Phase | Environment | Purpose |
|-----------|-------|-------------|---------|
| Unit tests | Phase 2 | Local (mocked) | Verify code logic in isolation |
| Integration tests | Phase 2 | Local (mocked) | Verify module boundaries |
| E2E tests | Phase 2 | Local (real servers) | Verify flows end-to-end |
| QA Harness | Phase 3 | Preview (real Supabase, Vercel) | Verify feature in production-like env |

**Important distinction:**
- ✅ Unit tests passing means code logic is correct
- ❌ Unit tests passing does NOT mean Phase 3 can be skipped
- Phase 3 catches integration issues (real auth, real database, real deployment)

---

## Handoffs

| Upstream | When |
|----------|------|
| `orchestrator-specialist` | Routes testing tasks here |
| `backend-architect` | After implementing services/APIs |
| `frontend-architect` | After implementing components |
| `hono-specialist` | After implementing routes |

Tests are typically the final step in a feature workflow.
