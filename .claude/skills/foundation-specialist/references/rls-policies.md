# RLS Policy Patterns

Row Level Security patterns for Supabase.

## Enable RLS

Always enable RLS on new tables:
```sql
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;
```

## Basic User Ownership

For tables with direct `user_id` column:

```sql
CREATE POLICY "Users can view own data"
  ON public.my_table
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own data"
  ON public.my_table
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own data"
  ON public.my_table
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own data"
  ON public.my_table
  FOR DELETE
  USING (user_id = auth.uid());
```

Shorthand for all operations:
```sql
CREATE POLICY "Users can manage own data"
  ON public.my_table
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

## Repo-Scoped Access

For tables that belong to repos (patterns, violations, etc.):

### Helper Function
```sql
CREATE OR REPLACE FUNCTION public.user_owns_repo(repo_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.repos
    WHERE id = repo_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

### Policy Using Helper
```sql
CREATE POLICY "Users can access repo patterns"
  ON public.patterns
  FOR ALL
  USING (public.user_owns_repo(repo_id))
  WITH CHECK (public.user_owns_repo(repo_id));
```

## Nested Ownership

For tables nested deeper (e.g., violations → pull_requests → repos):

```sql
CREATE OR REPLACE FUNCTION public.user_owns_pull_request(pr_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pull_requests pr
    JOIN public.repos r ON r.id = pr.repo_id
    WHERE pr.id = pr_id AND r.user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Users can access PR violations"
  ON public.violations
  FOR ALL
  USING (public.user_owns_pull_request(pull_request_id));
```

## Service Role Bypass

Backend API uses service role key which bypasses RLS. Only frontend/direct client access is restricted.

## Common Patterns

### Read-Only for Others
```sql
-- Owner can do everything
CREATE POLICY "Owner full access"
  ON public.repos
  FOR ALL
  USING (user_id = auth.uid());

-- Others can only read public repos
CREATE POLICY "Public read access"
  ON public.repos
  FOR SELECT
  USING (private = false);
```

### Insert with Auto-Set User
```sql
CREATE POLICY "Auto-set user on insert"
  ON public.repos
  FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

## User Sync Trigger

Sync users from auth.users to public.users:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, github_id, github_username)
  VALUES (
    NEW.id,
    NEW.email,
    (NEW.raw_user_meta_data->>'provider_id')::bigint,
    NEW.raw_user_meta_data->>'user_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    github_username = EXCLUDED.github_username;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## Testing RLS

```sql
-- Test as specific user
SET request.jwt.claim.sub = 'user-uuid-here';

-- Reset
RESET request.jwt.claim.sub;
```
