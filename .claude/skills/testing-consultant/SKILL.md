---
name: testing-consultant
description: |
  Establishes testing strategy, patterns, and conventions for Reasoning Substrate. Consult this
  skill BEFORE writing tests for any new feature or module. Defines what to test, how to test it,
  and testing infrastructure. Produces documentation in docs/testing/ and shared test utilities
  in tests/. Invoke when: setting up test infrastructure, deciding test coverage approach,
  implementing mocks for external services, writing integration tests, or when any domain
  specialist needs guidance on testing their code.
license: MIT
compatibility: Vitest, React Testing Library, TypeScript
allowed-tools: Read Write Bash(npm:*) Bash(vitest:*) Glob Grep
metadata:
  role: consultant
  consulted-by: all-domain-specialists
  priority: phase-1
---

# Testing Consultant

## Purpose

Establish testing strategy and patterns that all specialists follow when writing tests. This skill produces documentation, test infrastructure, and shared utilities rather than owning specific feature tasks.

## When to Activate This Skill

- Beginning of project (Phase 1) to establish testing infrastructure
- Before any domain specialist writes tests
- When new testing patterns are needed
- When tests are slow, flaky, or inadequate
- When setting up mocks for external services

## Prerequisites

- Project initialized (via foundation-specialist)
- Backend and frontend patterns established
- Node.js and npm configured

## Workflow

### Step 1: Test Infrastructure Setup

1. Install and configure Vitest:
   ```bash
   npm install -D vitest @vitest/coverage-v8 @vitest/ui
   ```
2. Create `vitest.config.ts`:
   ```typescript
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';
   import path from 'path';

   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: ['./tests/setup.ts'],
       coverage: {
         provider: 'v8',
         reporter: ['text', 'html'],
         exclude: ['node_modules/', 'tests/'],
       },
     },
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './'),
       },
     },
   });
   ```
3. Create `tests/setup.ts` with global config:
   ```typescript
   import '@testing-library/jest-dom/vitest';
   import { cleanup } from '@testing-library/react';
   import { afterEach, vi } from 'vitest';

   // Cleanup after each test
   afterEach(() => {
     cleanup();
   });

   // Mock environment variables
   vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321');
   vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
   ```
4. Add test scripts to `package.json`:
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:watch": "vitest --watch",
       "test:coverage": "vitest --coverage",
       "test:ui": "vitest --ui"
     }
   }
   ```

### Step 2: Define Test Strategy

1. Create `docs/testing/strategy.md`
2. Document the testing pyramid:
   ```
   ┌───────────────────┐
   │    E2E Tests      │  ← Few, slow, high confidence
   │  (Playwright)     │
   ├───────────────────┤
   │ Integration Tests │  ← More, test boundaries
   │ (API, DB, Jobs)   │
   ├───────────────────┤
   │   Unit Tests      │  ← Many, fast, isolated
   │ (Functions, Hooks)│
   └───────────────────┘
   ```
3. Document what to test:
   - Business logic (confidence scoring, tier derivation, violation detection)
   - Edge cases and error handling
   - API contracts (request/response shapes)
   - User interactions (keyboard navigation, form submission)
4. Document what NOT to test:
   - Implementation details (internal state, private methods)
   - Third-party code (Supabase client, Octokit)
   - Trivial code (simple getters, pass-through functions)
   - Prompt strings (test the parsing, not the prompt)
5. Coverage targets:
   - Business logic: 80%
   - UI components: 60% (focus on interactions, not styling)
   - API routes: 70%
   - Jobs: 70%

### Step 3: Create Mock Infrastructure

1. Create `tests/mocks/supabase.ts`:
   ```typescript
   import { vi } from 'vitest';

   export const mockSupabaseClient = {
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
     },
     channel: vi.fn(() => ({
       on: vi.fn().mockReturnThis(),
       subscribe: vi.fn(),
     })),
   };

   export function mockSupabaseResponse<T>(data: T) {
     return { data, error: null };
   }

   export function mockSupabaseError(message: string) {
     return { data: null, error: { message } };
   }
   ```

2. Create `tests/mocks/github.ts`:
   ```typescript
   import { vi } from 'vitest';

   export const mockOctokit = {
     rest: {
       repos: {
         getContent: vi.fn(),
         listForAuthenticatedUser: vi.fn(),
       },
       pulls: {
         list: vi.fn(),
         get: vi.fn(),
         createReview: vi.fn(),
       },
       checks: {
         create: vi.fn(),
       },
     },
   };

   export function mockGitHubContent(files: Array<{ path: string; content: string }>) {
     return files.map((f) => ({
       type: 'file',
       path: f.path,
       content: Buffer.from(f.content).toString('base64'),
       encoding: 'base64',
     }));
   }
   ```

3. Create `tests/mocks/anthropic.ts`:
   ```typescript
   import { vi } from 'vitest';

   export const mockAnthropicClient = {
     messages: {
       create: vi.fn(),
     },
   };

   export function mockExtractionResponse(patterns: unknown[]) {
     return {
       content: [
         {
           type: 'text',
           text: JSON.stringify({ patterns }),
         },
       ],
     };
   }
   ```

4. Create `tests/mocks/trigger.ts`:
   ```typescript
   import { vi } from 'vitest';

   export const mockTrigger = {
     task: vi.fn((config) => ({
       id: config.id,
       trigger: vi.fn(),
     })),
   };
   ```

### Step 4: Create Test Data Factories

1. Create `tests/fixtures/users.ts`:
   ```typescript
   import { faker } from '@faker-js/faker';

   export function createUser(overrides = {}) {
     return {
       id: faker.string.uuid(),
       email: faker.internet.email(),
       name: faker.person.fullName(),
       avatarUrl: faker.image.avatar(),
       createdAt: faker.date.past().toISOString(),
       ...overrides,
     };
   }
   ```

2. Create `tests/fixtures/repos.ts`:
   ```typescript
   import { faker } from '@faker-js/faker';

   export function createRepo(overrides = {}) {
     return {
       id: faker.string.uuid(),
       name: faker.lorem.slug(),
       fullName: `${faker.internet.userName()}/${faker.lorem.slug()}`,
       installationId: faker.number.int({ min: 1000000, max: 9999999 }),
       ingestionStatus: 'pending',
       tokenCount: 0,
       createdAt: faker.date.past().toISOString(),
       ...overrides,
     };
   }
   ```

3. Create `tests/fixtures/patterns.ts`:
   ```typescript
   import { faker } from '@faker-js/faker';

   export function createPattern(overrides = {}) {
     return {
       id: faker.string.uuid(),
       repoId: faker.string.uuid(),
       name: faker.lorem.words(3),
       description: faker.lorem.paragraph(),
       type: faker.helpers.arrayElement(['code', 'file-naming', 'file-structure']),
       status: 'candidate',
       tier: faker.helpers.arrayElement(['strong', 'moderate', 'weak', 'emerging', 'legacy']),
       confidence: {
         evidence: { instanceCount: faker.number.int({ min: 1, max: 20 }), consistency: faker.number.float({ min: 0.5, max: 1 }) },
         adoption: { uniqueAuthors: faker.number.int({ min: 1, max: 10 }) },
         establishment: { ageCategory: faker.helpers.arrayElement(['new', 'recent', 'established', 'legacy']) },
         location: { codeCategory: faker.helpers.arrayElement(['core', 'feature', 'utility', 'test']) },
       },
       createdAt: faker.date.past().toISOString(),
       ...overrides,
     };
   }
   ```

### Step 5: Document Unit Test Patterns

1. Create `docs/testing/unit-tests.md`
2. Document test file organization:
   ```
   lib/
   ├── extraction/
   │   ├── confidence.ts
   │   └── confidence.test.ts  # Co-located
   ```
3. Document test naming: `describe('functionName', () => { it('should behavior when condition', ...) })`
4. Document Arrange-Act-Assert structure:
   ```typescript
   describe('derivePatternTier', () => {
     it('should return strong when all thresholds met', () => {
       // Arrange
       const confidence = {
         evidence: { instanceCount: 5, consistency: 1.0 },
         adoption: { uniqueAuthors: 3 },
         establishment: { ageCategory: 'established' },
         location: { codeCategory: 'core' },
       };

       // Act
       const tier = derivePatternTier(confidence);

       // Assert
       expect(tier).toBe('strong');
     });
   });
   ```

### Step 6: Document Integration Test Patterns

1. Create `docs/testing/integration-tests.md`
2. Document API route testing:
   ```typescript
   import { createRequest } from 'tests/utils/request';

   describe('POST /api/patterns/[id]/promote', () => {
     it('should promote pattern and trigger backtest', async () => {
       // Setup
       const pattern = await createTestPattern({ status: 'candidate' });

       // Execute
       const response = await createRequest('/api/patterns/' + pattern.id + '/promote', {
         method: 'POST',
         body: { severity: 'error', rationale: 'Critical pattern' },
       });

       // Verify
       expect(response.status).toBe(200);
       expect(response.data.status).toBe('authoritative');
     });
   });
   ```
3. Document database test isolation:
   - Use test schema or transaction rollback
   - Clean up after each test
   - Don't share state between tests

### Step 7: Document Component Test Patterns

1. Create `docs/testing/component-tests.md`
2. Document React Testing Library usage:
   ```typescript
   import { render, screen, fireEvent } from '@testing-library/react';
   import { TriageQueue } from '@/components/patterns/triage-queue';
   import { createPattern } from 'tests/fixtures/patterns';

   describe('TriageQueue', () => {
     it('should navigate with j/k keys', async () => {
       const patterns = [createPattern(), createPattern()];
       render(<TriageQueue patterns={patterns} />);

       // First pattern selected by default
       expect(screen.getByRole('listitem', { current: true })).toHaveTextContent(patterns[0].name);

       // Press 'j' to move down
       fireEvent.keyDown(document, { key: 'j' });

       expect(screen.getByRole('listitem', { current: true })).toHaveTextContent(patterns[1].name);
     });
   });
   ```
3. Prefer user-centric queries: `getByRole`, `getByText`, `getByLabelText`
4. Avoid snapshot tests for every component (only for complex rendering)

## Output Specification

After running this skill, the following should exist:

### Configuration
- `vitest.config.ts`
- `tests/setup.ts`
- Updated `package.json` with test scripts

### Documentation
- `docs/testing/strategy.md`
- `docs/testing/unit-tests.md`
- `docs/testing/integration-tests.md`
- `docs/testing/component-tests.md`
- `docs/testing/mocking-patterns.md`

### Test Infrastructure
- `tests/mocks/supabase.ts`
- `tests/mocks/github.ts`
- `tests/mocks/anthropic.ts`
- `tests/mocks/trigger.ts`
- `tests/fixtures/users.ts`
- `tests/fixtures/repos.ts`
- `tests/fixtures/patterns.ts`
- `tests/fixtures/violations.ts`
- `tests/utils/request.ts`

## Testing Requirements by Domain

### extraction-specialist
- Unit test: confidence scoring (pure functions)
- Unit test: tier derivation logic
- Integration test: LLM response parsing (with mock responses)
- Skip: prompt string testing

### enforcement-specialist
- Unit test: violation detection logic
- Integration test: webhook signature verification
- Integration test: PR comment formatting
- Mock: GitHub API at Octokit level

### validation-ui-specialist
- Component test: keyboard navigation (j/k/p/r/d)
- Component test: action modal flows
- Skip: snapshot tests for every component

### ingestion-specialist
- Unit test: token counting
- Integration test: file tree building
- Mock: GitHub API responses

### github-integration-specialist
- Integration test: OAuth flow (with mock provider)
- Unit test: token refresh logic
- Integration test: webhook signature verification

## Consultation Protocol

Domain specialists should:

1. **Read** `docs/testing/strategy.md` before writing any tests
2. **Read** pattern-specific docs for their test type
3. **Use** mocks from `tests/mocks/`
4. **Use** factories from `tests/fixtures/`
5. **Request** new patterns if needed

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Test runner | Vitest | Fast, ESM-native, good DX, Vite integration |
| Component testing | React Testing Library | User-centric, accessibility-focused |
| API testing | Built-in fetch | No extra dependencies |
| Coverage target | 80% business logic | Pragmatic, not 100% |
| Database tests | Test schema + cleanup | Isolated, repeatable |
| Mock boundary | External APIs only | Don't mock internal modules |

## Success Signals

- Domain specialists know what to test without asking
- Tests are consistent in style and approach
- Test suite runs fast (< 30 seconds for unit tests)
- No flaky tests
- CI pipeline catches regressions

## Handoffs

- **Infrastructure ready** → Specialists can write tests alongside features
- **Patterns need update** → Return to this skill for new testing needs
