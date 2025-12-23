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
vi.mock('@/lib/db/client', () => ({
  getDb: vi.fn(() => mockDb),
}));
```

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

```typescript
// tests/factories/pattern.ts
import { faker } from '@faker-js/faker';

export function createPattern(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    status: 'candidate',
    createdAt: faker.date.past().toISOString(),
    ...overrides,
  };
}

// Usage
const pattern = createPattern({ status: 'authoritative' });
```

## Running Tests

```bash
bun run test              # Run all tests
bun run test --watch      # Watch mode
bun run test --coverage   # Coverage report
bun run test src/services # Run specific directory
```
