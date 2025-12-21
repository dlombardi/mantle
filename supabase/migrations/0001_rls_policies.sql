-- ============================================
-- RLS POLICIES AND USER SYNC TRIGGER
-- ============================================
-- This migration enables Row Level Security on all tables
-- and creates policies for user-based access control.

-- ============================================
-- HELPER FUNCTION: Check if user owns a repo
-- ============================================

CREATE OR REPLACE FUNCTION user_owns_repo(repo_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM repos
    WHERE repos.id = repo_id
    AND repos.user_id = auth.uid()
  );
$$;

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE repo_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE filesystem_pattern_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_file_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE provenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE pull_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtest_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_evolution_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================
-- REPOS TABLE POLICIES
-- ============================================

-- Users can view their own repos
CREATE POLICY "repos_select_own"
  ON repos FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert repos they own
CREATE POLICY "repos_insert_own"
  ON repos FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own repos
CREATE POLICY "repos_update_own"
  ON repos FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own repos
CREATE POLICY "repos_delete_own"
  ON repos FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- REPO_FILES TABLE POLICIES
-- ============================================

CREATE POLICY "repo_files_select"
  ON repo_files FOR SELECT
  USING (user_owns_repo(repo_id));

CREATE POLICY "repo_files_insert"
  ON repo_files FOR INSERT
  WITH CHECK (user_owns_repo(repo_id));

CREATE POLICY "repo_files_update"
  ON repo_files FOR UPDATE
  USING (user_owns_repo(repo_id))
  WITH CHECK (user_owns_repo(repo_id));

CREATE POLICY "repo_files_delete"
  ON repo_files FOR DELETE
  USING (user_owns_repo(repo_id));

-- ============================================
-- PATTERNS TABLE POLICIES
-- ============================================

CREATE POLICY "patterns_select"
  ON patterns FOR SELECT
  USING (user_owns_repo(repo_id));

CREATE POLICY "patterns_insert"
  ON patterns FOR INSERT
  WITH CHECK (user_owns_repo(repo_id));

CREATE POLICY "patterns_update"
  ON patterns FOR UPDATE
  USING (user_owns_repo(repo_id))
  WITH CHECK (user_owns_repo(repo_id));

CREATE POLICY "patterns_delete"
  ON patterns FOR DELETE
  USING (user_owns_repo(repo_id));

-- ============================================
-- PATTERN_EVIDENCE TABLE POLICIES
-- ============================================

CREATE POLICY "pattern_evidence_select"
  ON pattern_evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = pattern_evidence.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

CREATE POLICY "pattern_evidence_insert"
  ON pattern_evidence FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = pattern_evidence.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

CREATE POLICY "pattern_evidence_update"
  ON pattern_evidence FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = pattern_evidence.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = pattern_evidence.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

CREATE POLICY "pattern_evidence_delete"
  ON pattern_evidence FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = pattern_evidence.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

-- ============================================
-- FILESYSTEM_PATTERN_EVIDENCE TABLE POLICIES
-- ============================================

CREATE POLICY "filesystem_pattern_evidence_select"
  ON filesystem_pattern_evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = filesystem_pattern_evidence.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

CREATE POLICY "filesystem_pattern_evidence_insert"
  ON filesystem_pattern_evidence FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = filesystem_pattern_evidence.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

CREATE POLICY "filesystem_pattern_evidence_update"
  ON filesystem_pattern_evidence FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = filesystem_pattern_evidence.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = filesystem_pattern_evidence.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

CREATE POLICY "filesystem_pattern_evidence_delete"
  ON filesystem_pattern_evidence FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = filesystem_pattern_evidence.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

-- ============================================
-- CONTEXT_FILE_CONFIGS TABLE POLICIES
-- ============================================

CREATE POLICY "context_file_configs_select"
  ON context_file_configs FOR SELECT
  USING (user_owns_repo(repo_id));

CREATE POLICY "context_file_configs_insert"
  ON context_file_configs FOR INSERT
  WITH CHECK (user_owns_repo(repo_id));

CREATE POLICY "context_file_configs_update"
  ON context_file_configs FOR UPDATE
  USING (user_owns_repo(repo_id))
  WITH CHECK (user_owns_repo(repo_id));

CREATE POLICY "context_file_configs_delete"
  ON context_file_configs FOR DELETE
  USING (user_owns_repo(repo_id));

-- ============================================
-- PROVENANCE TABLE POLICIES
-- ============================================

CREATE POLICY "provenance_select"
  ON provenance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = provenance.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

CREATE POLICY "provenance_insert"
  ON provenance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = provenance.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
    AND added_by = auth.uid()
  );

CREATE POLICY "provenance_update"
  ON provenance FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = provenance.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = provenance.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

CREATE POLICY "provenance_delete"
  ON provenance FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = provenance.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

-- ============================================
-- PULL_REQUESTS TABLE POLICIES
-- ============================================

CREATE POLICY "pull_requests_select"
  ON pull_requests FOR SELECT
  USING (user_owns_repo(repo_id));

CREATE POLICY "pull_requests_insert"
  ON pull_requests FOR INSERT
  WITH CHECK (user_owns_repo(repo_id));

CREATE POLICY "pull_requests_update"
  ON pull_requests FOR UPDATE
  USING (user_owns_repo(repo_id))
  WITH CHECK (user_owns_repo(repo_id));

CREATE POLICY "pull_requests_delete"
  ON pull_requests FOR DELETE
  USING (user_owns_repo(repo_id));

-- ============================================
-- VIOLATIONS TABLE POLICIES
-- ============================================

CREATE POLICY "violations_select"
  ON violations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pull_requests
      WHERE pull_requests.id = violations.pull_request_id
      AND user_owns_repo(pull_requests.repo_id)
    )
  );

CREATE POLICY "violations_insert"
  ON violations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pull_requests
      WHERE pull_requests.id = violations.pull_request_id
      AND user_owns_repo(pull_requests.repo_id)
    )
  );

CREATE POLICY "violations_update"
  ON violations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pull_requests
      WHERE pull_requests.id = violations.pull_request_id
      AND user_owns_repo(pull_requests.repo_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pull_requests
      WHERE pull_requests.id = violations.pull_request_id
      AND user_owns_repo(pull_requests.repo_id)
    )
  );

CREATE POLICY "violations_delete"
  ON violations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM pull_requests
      WHERE pull_requests.id = violations.pull_request_id
      AND user_owns_repo(pull_requests.repo_id)
    )
  );

-- ============================================
-- BACKTEST_VIOLATIONS TABLE POLICIES
-- ============================================

CREATE POLICY "backtest_violations_select"
  ON backtest_violations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = backtest_violations.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

CREATE POLICY "backtest_violations_insert"
  ON backtest_violations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = backtest_violations.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

CREATE POLICY "backtest_violations_delete"
  ON backtest_violations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = backtest_violations.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

-- ============================================
-- PATTERN_EVOLUTION_REQUESTS TABLE POLICIES
-- ============================================

CREATE POLICY "pattern_evolution_requests_select"
  ON pattern_evolution_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = pattern_evolution_requests.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

CREATE POLICY "pattern_evolution_requests_insert"
  ON pattern_evolution_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = pattern_evolution_requests.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

CREATE POLICY "pattern_evolution_requests_update"
  ON pattern_evolution_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = pattern_evolution_requests.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = pattern_evolution_requests.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

CREATE POLICY "pattern_evolution_requests_delete"
  ON pattern_evolution_requests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM patterns
      WHERE patterns.id = pattern_evolution_requests.pattern_id
      AND user_owns_repo(patterns.repo_id)
    )
  );

-- ============================================
-- USER SYNC TRIGGER
-- ============================================
-- Automatically creates a user record when a new auth.users record is created.
-- This syncs GitHub OAuth data from Supabase Auth to our users table.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  github_id_value bigint;
  github_username_value text;
BEGIN
  -- Extract GitHub metadata from raw_user_meta_data
  github_id_value := (NEW.raw_user_meta_data->>'provider_id')::bigint;
  github_username_value := COALESCE(
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'preferred_username',
    'unknown'
  );

  -- Insert or update the user record
  INSERT INTO public.users (
    id,
    github_id,
    github_username,
    email,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    github_id_value,
    github_username_value,
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    github_username = EXCLUDED.github_username,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert/update
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SERVICE ROLE BYPASS POLICIES
-- ============================================
-- These policies allow the service role (used by backend/Trigger.dev jobs)
-- to bypass RLS when performing system operations.

-- Users: Service role can insert (for user sync trigger)
CREATE POLICY "users_service_role_all"
  ON users FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Repos: Service role full access (for ingestion jobs)
CREATE POLICY "repos_service_role_all"
  ON repos FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Repo files: Service role full access
CREATE POLICY "repo_files_service_role_all"
  ON repo_files FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Patterns: Service role full access (for extraction jobs)
CREATE POLICY "patterns_service_role_all"
  ON patterns FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Pattern evidence: Service role full access
CREATE POLICY "pattern_evidence_service_role_all"
  ON pattern_evidence FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Filesystem pattern evidence: Service role full access
CREATE POLICY "filesystem_pattern_evidence_service_role_all"
  ON filesystem_pattern_evidence FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Context file configs: Service role full access
CREATE POLICY "context_file_configs_service_role_all"
  ON context_file_configs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Provenance: Service role full access
CREATE POLICY "provenance_service_role_all"
  ON provenance FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Pull requests: Service role full access (for PR analysis jobs)
CREATE POLICY "pull_requests_service_role_all"
  ON pull_requests FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Violations: Service role full access
CREATE POLICY "violations_service_role_all"
  ON violations FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Backtest violations: Service role full access
CREATE POLICY "backtest_violations_service_role_all"
  ON backtest_violations FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Pattern evolution requests: Service role full access
CREATE POLICY "pattern_evolution_requests_service_role_all"
  ON pattern_evolution_requests FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
