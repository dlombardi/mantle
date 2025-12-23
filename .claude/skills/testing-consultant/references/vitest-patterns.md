# Vitest Test Patterns

Unit and integration test patterns using Vitest.

## Test File Location

Tests are co-located with source files:
```
src/
├── services/
│   ├── patterns.ts
│   └── patterns.test.ts    # Co-located
└── routes/
    ├── health.ts
    └── health.test.ts      # Co-located
```

## Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('functionName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should [expected behavior] when [condition]', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = functionName(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

## Common Assertions

```typescript
// Equality
expect(value).toBe(expected);           // Strict equality
expect(value).toEqual(expected);        // Deep equality
expect(value).toStrictEqual(expected);  // Deep + type equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThanOrEqual(10);

// Strings
expect(value).toMatch(/regex/);
expect(value).toContain('substring');

// Arrays/Objects
expect(array).toContain(item);
expect(object).toHaveProperty('key');
expect(object).toHaveProperty('nested.key', 'value');

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('message');
expect(() => fn()).toThrowError(CustomError);

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

## Mocking

### Mock Functions
```typescript
const mockFn = vi.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('async value');
mockFn.mockImplementation((x) => x * 2);

// Assertions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledOnce();
expect(mockFn).toHaveBeenCalledWith('arg');
expect(mockFn).toHaveBeenCalledTimes(3);
```

### Mock Modules
```typescript
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(),
  closeDb: vi.fn(),
  dbHealthCheck: vi.fn().mockResolvedValue({ connected: true }),
}));

vi.mock('@/lib/trigger', () => ({
  initTrigger: vi.fn(),
  isTriggerConfigured: vi.fn().mockReturnValue(true),
}));
```

## API Response Testing with Zod

Use Zod schemas for type-safe response validation:

```typescript
// Route exports schemas
import { z } from 'zod';
export const responseSchema = z.object({
  status: z.literal('ok'),
  data: z.object({ id: z.string() }),
});

// Test uses schema.parse()
import { responseSchema } from './route';

it('returns valid response', async () => {
  const res = await app.request('/endpoint');
  const data = responseSchema.parse(await res.json());
  expect(data.status).toBe('ok');
});
```

Benefits:
- No `as` type assertions needed
- Runtime validation catches API contract violations
- TypeScript infers types from schemas automatically

### Spy on Methods
```typescript
const spy = vi.spyOn(object, 'method');
spy.mockReturnValue('mocked');

// After test
spy.mockRestore();
```

## Testing Async Code

```typescript
it('should fetch data', async () => {
  const result = await fetchData();
  expect(result).toEqual({ data: 'value' });
});

it('should handle errors', async () => {
  await expect(failingFn()).rejects.toThrow('error');
});
```

## Test Data Factories

Located in `packages/test-utils/`:

```typescript
// packages/test-utils/src/factories/pattern.ts
import { faker } from '@faker-js/faker';

export function createPattern(overrides = {}) {
  return {
    id: faker.string.uuid(),
    repoId: faker.string.uuid(),
    name: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    status: 'candidate' as const,
    tier: 1,
    confidenceEvidence: faker.number.float({ min: 0, max: 1 }),
    confidenceAdoption: faker.number.float({ min: 0, max: 1 }),
    confidenceEstablishment: faker.number.float({ min: 0, max: 1 }),
    confidenceLocation: faker.number.float({ min: 0, max: 1 }),
    extractedAt: faker.date.past().toISOString(),
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
}

// Usage
import { createPattern, createUser, createRepo } from '@mantle/test-utils';

const pattern = createPattern({ status: 'authoritative', tier: 3 });
const user = createUser({ name: 'Test User' });
const repo = createRepo({ defaultBranch: 'develop' });
```

## Running Tests

```bash
bun run test              # Run all tests
bun run test --watch      # Watch mode
bun run test --coverage   # Coverage report
bun run test src/services # Run specific directory
```
