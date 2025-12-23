# Error Handling Patterns

Error class hierarchy and handling patterns for the API.

## Error Class Hierarchy

```typescript
// lib/errors/base.ts

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} with id ${id} not found`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('RATE_LIMITED', 'Rate limit exceeded', 429, { retryAfter });
  }
}

export class ExternalApiError extends AppError {
  constructor(service: string, message: string) {
    super('EXTERNAL_API_ERROR', `${service}: ${message}`, 502);
  }
}
```

## Error Codes

| Code | HTTP Status | When to Use |
|------|-------------|-------------|
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized for action |
| `RATE_LIMITED` | 429 | Too many requests |
| `EXTERNAL_API_ERROR` | 502 | GitHub/Anthropic failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Error Middleware

```typescript
// middleware/error-handler.ts
import { Context, Next } from 'hono';
import { AppError } from '@/lib/errors/base';

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      return c.json({
        data: null,
        error: { code: err.code, message: err.message },
      }, err.statusCode);
    }

    // Log unexpected errors
    console.error('Unhandled error:', err);

    return c.json({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    }, 500);
  }
}
```

## Usage in Services

```typescript
import { NotFoundError, UnauthorizedError } from '@/lib/errors/base';

export async function getPattern(patternId: string, userId: string) {
  const pattern = await db.query.patterns.findFirst({
    where: eq(patterns.id, patternId),
    with: { repo: true },
  });

  if (!pattern) {
    throw new NotFoundError('Pattern', patternId);
  }

  if (pattern.repo.userId !== userId) {
    throw new UnauthorizedError('Not authorized to access this pattern');
  }

  return pattern;
}
```

## What to Log vs Expose

**Log (server-side):**
- Full error with stack trace
- Request context (method, path, user ID)
- External API response details

**Expose (to client):**
- Error code (machine-readable)
- User-friendly message
- Never: stack traces, internal details, secrets
