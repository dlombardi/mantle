-- Migration: Backfill github_installations from existing repos
--
-- This migration creates placeholder entries in github_installations for any
-- installation IDs referenced in the repos table that don't yet exist in github_installations.
--
-- These placeholder entries will be enriched with full metadata when:
-- 1. The webhook fires for the installation (updates accountId, accountLogin, etc.)
-- 2. The user triggers discoverInstallations on login
--
-- IMPORTANT: This is a one-time migration. Placeholder values are used because
-- the repos table doesn't store account metadata.

-- ============================================
-- BACKFILL INSTALLATIONS
-- ============================================

-- Insert placeholder entries for installation_ids that exist in repos but not in github_installations
INSERT INTO github_installations (
  installation_id,
  account_id,
  account_login,
  account_type,
  is_active,
  repositories_cache,
  created_at,
  updated_at
)
SELECT DISTINCT ON (r.installation_id)
  r.installation_id,
  -- Use 0 as placeholder for account_id (will be updated by webhook or API)
  0 AS account_id,
  -- Use 'pending-migration' as placeholder login
  'pending-migration-' || r.installation_id::text AS account_login,
  -- Default to 'User' type (most common case, will be corrected by webhook)
  'User'::installation_account_type AS account_type,
  -- Assume active
  true AS is_active,
  -- Initialize empty cache
  '[]'::jsonb AS repositories_cache,
  now() AS created_at,
  now() AS updated_at
FROM repos r
LEFT JOIN github_installations gi ON gi.installation_id = r.installation_id
WHERE gi.id IS NULL
  AND r.installation_id IS NOT NULL;

-- ============================================
-- LINK EXISTING USERS TO THEIR INSTALLATIONS
-- ============================================

-- For each user's repos, create installation_members links
-- This allows users to see their existing installations immediately
INSERT INTO installation_members (
  installation_id,
  user_id,
  role,
  discovered_via,
  created_at
)
SELECT DISTINCT ON (gi.id, r.user_id)
  gi.id AS installation_id,
  r.user_id,
  'member' AS role,
  'migration'::membership_discovery AS discovered_via,
  now() AS created_at
FROM repos r
INNER JOIN github_installations gi ON gi.installation_id = r.installation_id
LEFT JOIN installation_members im ON im.installation_id = gi.id AND im.user_id = r.user_id
WHERE im.id IS NULL;

-- ============================================
-- UPDATE COMMENTS
-- ============================================

COMMENT ON TABLE github_installations IS
'GitHub App installations. Entries may have placeholder data (account_id=0, account_login like ''pending-migration-*'')
until enriched by webhook or discoverInstallations mutation.';
