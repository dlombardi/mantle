# Drizzle Schema Patterns

Schema definition patterns for Drizzle ORM.

## Table Definition

```typescript
import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const myTable = pgTable('my_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  count: integer('count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  index('idx_my_table_name').on(table.name),
]);
```

## Foreign Keys

```typescript
export const childTable = pgTable('child_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentId: uuid('parent_id')
    .notNull()
    .references(() => parentTable.id, { onDelete: 'cascade' }),
  // ...
});
```

## Enums

```typescript
// In types.ts
export const statusEnum = ['pending', 'active', 'completed'] as const;
export type Status = (typeof statusEnum)[number];

// In schema.ts
import { pgEnum } from 'drizzle-orm/pg-core';
export const status = pgEnum('status', statusEnum);

// Usage in table
export const tasks = pgTable('tasks', {
  status: status('status').notNull().default('pending'),
});
```

## JSONB Columns

```typescript
import { jsonb } from 'drizzle-orm/pg-core';

interface ConfigType {
  enabled: boolean;
  settings: Record<string, unknown>;
}

export const configs = pgTable('configs', {
  config: jsonb('config').$type<ConfigType>().notNull(),
});
```

## Relations

```typescript
import { relations } from 'drizzle-orm';

// One-to-Many
export const usersRelations = relations(users, ({ many }) => ({
  repos: many(repos),
}));

export const reposRelations = relations(repos, ({ one, many }) => ({
  user: one(users, {
    fields: [repos.userId],
    references: [users.id],
  }),
  patterns: many(patterns),
}));

// Many-to-One with named relation
export const patternsRelations = relations(patterns, ({ one }) => ({
  repo: one(repos, {
    fields: [patterns.repoId],
    references: [repos.id],
  }),
  owner: one(users, {
    fields: [patterns.ownerId],
    references: [users.id],
    relationName: 'patternOwner',
  }),
}));
```

## Indexes

```typescript
export const patterns = pgTable('patterns', {
  // columns...
}, (table) => [
  // Single column index
  index('idx_patterns_repo').on(table.repoId),

  // Composite index
  index('idx_patterns_repo_status').on(table.repoId, table.status),

  // Unique index
  uniqueIndex('idx_patterns_unique').on(table.repoId, table.name),
]);
```

## Migration Workflow

```bash
# 1. Modify schema.ts

# 2. Generate migration
cd apps/api && bunx drizzle-kit generate

# 3. Review generated SQL in supabase/migrations/

# 4. Push to database
bunx supabase db push

# 5. Check sync status
bunx drizzle-kit check
```

## Key Tables Reference

| Table | Primary Key | Key Foreign Keys |
|-------|-------------|------------------|
| `users` | `id` (matches auth.users) | - |
| `repos` | `id` (uuid) | `userId` → users |
| `patterns` | `id` (uuid) | `repoId` → repos |
| `pattern_evidence` | `id` (uuid) | `patternId` → patterns |
| `pull_requests` | `id` (uuid) | `repoId` → repos |
| `violations` | `id` (uuid) | `pullRequestId` → pull_requests, `patternId` → patterns |
