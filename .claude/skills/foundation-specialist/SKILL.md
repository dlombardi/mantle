# Foundation Specialist

Handles development infrastructure: Turborepo monorepo, TypeScript configuration, Drizzle ORM patterns, Supabase setup, and tooling configuration.

---

## Activation

Invoke this skill when working on:
- Monorepo configuration (`turbo.json`, workspace setup)
- TypeScript configuration (`tsconfig.json`, path aliases)
- Drizzle ORM setup (config, migrations, schema patterns)
- Supabase configuration (migrations, RLS patterns, auth setup)
- ESLint/Prettier configuration
- Environment variable management
- Build tooling and scripts

**Key files:**
- `turbo.json`, `package.json` (root)
- `tsconfig.json`, `tsconfig.*.json`
- `apps/*/drizzle.config.ts`
- `supabase/migrations/*.sql`
- `eslint.config.*`, `.prettierrc`
- `.env*` files

---

## Monorepo Structure

```
mantle/
├── apps/
│   ├── web/          # Vite + React frontend
│   └── api/          # Hono + Bun backend
├── packages/         # Shared packages (if any)
├── supabase/
│   ├── config.toml   # Supabase CLI config
│   └── migrations/   # SQL migrations
├── turbo.json        # Turborepo config
└── package.json      # Workspace root
```

---

## Turborepo Patterns

### Task Configuration
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

### Running Tasks
```bash
# All workspaces
bun run build
bun run typecheck

# Specific workspace
bun run --filter=@mantle/api build
bun run --filter=@mantle/web dev
```

---

## TypeScript Configuration

### Strict Mode (Required)
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Path Aliases
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@lib/*": ["./src/lib/*"]
    }
  }
}
```

---

## Drizzle ORM Patterns

### Table Definition
```typescript
import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';

export const exampleTable = pgTable('example_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_example_name').on(table.name),
]);
```

### Relations
```typescript
import { relations } from 'drizzle-orm';

export const parentTableRelations = relations(parentTable, ({ many }) => ({
  children: many(childTable),
}));

export const childTableRelations = relations(childTable, ({ one }) => ({
  parent: one(parentTable, {
    fields: [childTable.parentId],
    references: [parentTable.id],
  }),
}));
```

### Enum Pattern
```typescript
// In types.ts
export const statusEnum = ['pending', 'active', 'completed'] as const;
export type Status = (typeof statusEnum)[number];

// In schema.ts
import { pgEnum } from 'drizzle-orm/pg-core';
export const status = pgEnum('status', statusEnum);
```

### Migration Workflow
```bash
# Generate migration from schema changes
cd apps/api && bunx drizzle-kit generate

# Push to database
bunx supabase db push

# Check migration status
bunx drizzle-kit check
```

---

## Supabase Patterns

### RLS Policy Pattern
```sql
-- Enable RLS
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- User ownership policy
CREATE POLICY "Users can access own data"
  ON public.my_table
  FOR ALL
  USING (user_id = auth.uid());

-- Helper function for repo-scoped access
CREATE OR REPLACE FUNCTION public.user_owns_repo(repo_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.repos
    WHERE id = repo_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Repo-scoped policy
CREATE POLICY "Users can access repo data"
  ON public.repo_data
  FOR ALL
  USING (public.user_owns_repo(repo_id));
```

### User Sync Trigger
```sql
-- Sync users from auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Migration Naming
```
YYYYMMDDHHMMSS_description.sql
Example: 20241220143000_add_users_table.sql
```

---

## Environment Variables

### Structure
```
.env.example          # Template (committed)
.env.local            # Local overrides (gitignored)
.env.development      # Dev defaults (optional)
.env.production       # Prod values (gitignored)
```

### Frontend (Vite)
```env
# Must be prefixed with VITE_
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_API_URL=http://localhost:3001
```

### Backend
```env
# Database
DATABASE_URL=postgresql://...

# Supabase (service role for backend)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# Server
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

---

## ESLint Configuration

### Flat Config (eslint.config.js)
```javascript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
);
```

---

## Git Workflow

### Branch Naming
```
feature/description
fix/description
chore/description
```

### Commit Messages
Follow conventional commits:
```
feat: add user authentication
fix: resolve database connection issue
chore: update dependencies
docs: add API documentation
```

---

## Beads Integration

When working on infrastructure:
```bash
# Track infrastructure changes
bd create "Configure Drizzle migrations"
bd update <id> -s in-progress

# Complete when verified
bun run typecheck && bun run build
bd complete <id>
```

---

## Validation Commands

```bash
# Full validation suite
bun run typecheck    # TypeScript check
bun run build        # Build all apps
bun run lint         # ESLint
bun run test         # Run tests

# Database
bunx supabase db push          # Push migrations
bunx drizzle-kit generate      # Generate from schema
bunx drizzle-kit check         # Check schema sync
```

---

## Handoffs

| Downstream | When |
|------------|------|
| `hono-specialist` | After API scaffolding ready |
| `frontend-architect` | After frontend tooling configured |
| `backend-architect` | For service layer patterns |
| `testing-consultant` | For test infrastructure setup |
