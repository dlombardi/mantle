# Playwright E2E Patterns

End-to-end testing patterns using Playwright.

## Test Location

E2E tests are at the repo root:
```
mantle/
├── e2e/
│   ├── health.spec.ts     # Health check tests
│   └── pages/             # Page Object Models
│       ├── BasePage.ts    # Abstract base class
│       └── HomePage.ts    # Home page POM
└── playwright.config.ts   # Dual webServer config
```

## Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('user can perform action', async ({ page }) => {
    await page.goto('/path');

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page).toHaveURL('/success');
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

## Page Object Model

```typescript
// e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign In' });
    this.errorMessage = page.getByRole('alert');
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
```

### Using Page Objects

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('user can sign in', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');

  await expect(page).toHaveURL('/dashboard');
});

test('shows error for invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('wrong@example.com', 'wrongpass');

  await expect(loginPage.errorMessage).toBeVisible();
});
```

## Locator Priority

Use accessible locators (most to least preferred):
1. `getByRole` - Most accessible
2. `getByLabel` - Form fields
3. `getByPlaceholder` - Inputs
4. `getByText` - Non-interactive content
5. `getByTestId` - Last resort

```typescript
// Good
page.getByRole('button', { name: 'Submit' });
page.getByLabel('Email');

// Avoid
page.locator('.btn-primary');
page.locator('#submit-btn');
```

## Assertions

```typescript
// Visibility
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();

// Text
await expect(locator).toHaveText('exact text');
await expect(locator).toContainText('partial');

// URL
await expect(page).toHaveURL('/path');
await expect(page).toHaveURL(/pattern/);

// Attributes
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
await expect(locator).toHaveValue('value');
```

## Playwright Config (Dual WebServer)

Our config starts both API and Web servers:

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

Key points:
- Array syntax for `webServer` starts both servers
- API uses health endpoint to verify readiness
- `reuseExistingServer` allows testing against running dev servers

## Running E2E Tests

```bash
bun run test:e2e          # Run all E2E tests
bun run test:e2e:ui       # Playwright UI mode
bun run test:e2e:headed   # See browser
bun run test:all          # Unit + E2E combined
```
