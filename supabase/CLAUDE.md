# Database Context

Supabase migrations and RLS policies for the Reasoning Substrate.

## Quick Reference

| Task | Command |
|------|---------|
| Push migrations | `bunx supabase db push` |
| Generate from schema | `cd apps/api && bunx drizzle-kit generate` |
| Check schema sync | `bunx drizzle-kit check` |

## Schema Location

The Drizzle schema is the source of truth:
- **Schema**: `apps/api/src/lib/db/schema.ts`
- **Types**: `apps/api/src/lib/db/types.ts`
- **Migrations**: `supabase/migrations/*.sql`

## RLS Policy Patterns

**Always enable RLS on new tables:**
```sql
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;
```

**User ownership policy:**
```sql
CREATE POLICY "Users can access own data"
  ON public.my_table
  FOR ALL
  USING (user_id = auth.uid());
```

**Repo-scoped access (use helper function):**
```sql
-- Helper already exists
CREATE OR REPLACE FUNCTION public.user_owns_repo(repo_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.repos
    WHERE id = repo_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Use in policy
CREATE POLICY "Users can access repo data"
  ON public.repo_data
  FOR ALL
  USING (public.user_owns_repo(repo_id));
```

## Migration Naming

Format: `YYYYMMDDHHMMSS_description.sql`

Example: `20241220143000_add_users_table.sql`

## Key Tables

| Table | Purpose | Foreign Key |
|-------|---------|-------------|
| `users` | User accounts | `auth.users.id` |
| `repos` | Connected repositories | `users.id` |
| `patterns` | Extracted patterns | `repos.id` |
| `pattern_evidence` | Code evidence | `patterns.id` |
| `pull_requests` | Analyzed PRs | `repos.id` |
| `violations` | Pattern violations | `pull_requests.id`, `patterns.id` |

## User Sync Trigger

Users are synced from `auth.users` via trigger:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```
