-- Migration: GitHub Installations
-- Adds tables for capturing GitHub App installation data and user membership

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE "public"."installation_account_type" AS ENUM('User', 'Organization');
CREATE TYPE "public"."membership_discovery" AS ENUM('personal_match', 'org_api_check', 'migration');

-- ============================================
-- TABLE: github_installations
-- ============================================

CREATE TABLE "github_installations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,

  -- GitHub identifiers
  "installation_id" bigint NOT NULL UNIQUE,
  "account_id" bigint NOT NULL,
  "account_login" text NOT NULL,
  "account_type" "installation_account_type" NOT NULL,
  "account_avatar_url" text,

  -- Installation state
  "is_active" boolean DEFAULT true NOT NULL,
  "suspended_at" timestamp with time zone,

  -- Cached repo list (JSONB for flexibility)
  "repositories_cache" jsonb DEFAULT '[]' NOT NULL,
  "repositories_cache_updated_at" timestamp with time zone,

  -- Timestamps
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes for github_installations
CREATE UNIQUE INDEX "idx_installations_installation_id" ON "github_installations" USING btree ("installation_id");
CREATE INDEX "idx_installations_account_id" ON "github_installations" USING btree ("account_id");
CREATE INDEX "idx_installations_account_login" ON "github_installations" USING btree ("account_login");

-- ============================================
-- TABLE: installation_members
-- ============================================

CREATE TABLE "installation_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,

  "installation_id" uuid NOT NULL REFERENCES "github_installations"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

  -- Role (for future permissions model)
  "role" text DEFAULT 'member' NOT NULL,

  -- How this membership was discovered
  "discovered_via" "membership_discovery" NOT NULL,

  -- Timestamps
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "verified_at" timestamp with time zone
);

-- Indexes for installation_members
CREATE UNIQUE INDEX "idx_installation_members_unique" ON "installation_members" USING btree ("installation_id", "user_id");
CREATE INDEX "idx_installation_members_user" ON "installation_members" USING btree ("user_id");

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE github_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_members ENABLE ROW LEVEL SECURITY;

-- Users can view installations they're members of
CREATE POLICY "installations_select_member"
  ON github_installations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM installation_members
      WHERE installation_members.installation_id = github_installations.id
      AND installation_members.user_id = auth.uid()
    )
  );

-- Installation members: users can view their own memberships
CREATE POLICY "installation_members_select_own"
  ON installation_members FOR SELECT
  USING (user_id = auth.uid());

-- Service role bypass for webhook handler and background jobs
CREATE POLICY "installations_service_role_all"
  ON github_installations FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "installation_members_service_role_all"
  ON installation_members FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
