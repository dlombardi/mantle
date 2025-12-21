CREATE TYPE "public"."analysis_status" AS ENUM('pending', 'analyzing', 'analyzed', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."code_category" AS ENUM('core', 'feature', 'frontend', 'backend', 'test', 'config', 'helper');--> statement-breakpoint
CREATE TYPE "public"."confidence_model" AS ENUM('code', 'filesystem');--> statement-breakpoint
CREATE TYPE "public"."context_file_format" AS ENUM('claude', 'cursor');--> statement-breakpoint
CREATE TYPE "public"."context_file_sync_status" AS ENUM('never', 'synced', 'pending');--> statement-breakpoint
CREATE TYPE "public"."evidence_source" AS ENUM('extraction', 'human');--> statement-breakpoint
CREATE TYPE "public"."extraction_status" AS ENUM('pending', 'extracting', 'extracted', 'failed');--> statement-breakpoint
CREATE TYPE "public"."ingestion_status" AS ENUM('pending', 'ingesting', 'ingested', 'failed');--> statement-breakpoint
CREATE TYPE "public"."pattern_evolution_status" AS ENUM('pending', 'accepted', 'rejected', 'historical', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."pattern_status" AS ENUM('candidate', 'authoritative', 'rejected', 'deprecated', 'deferred');--> statement-breakpoint
CREATE TYPE "public"."pattern_type" AS ENUM('structural', 'behavioral', 'api', 'testing', 'naming', 'dependency', 'file-naming', 'file-structure', 'other');--> statement-breakpoint
CREATE TYPE "public"."provenance_type" AS ENUM('pull_request', 'commit', 'issue', 'document', 'slack', 'adr', 'other');--> statement-breakpoint
CREATE TYPE "public"."violation_resolution" AS ENUM('open', 'fixed', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."violation_severity" AS ENUM('error', 'warning', 'info');--> statement-breakpoint
CREATE TABLE "backtest_violations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pattern_id" uuid NOT NULL,
	"pr_number" integer NOT NULL,
	"pr_title" text NOT NULL,
	"pr_merged_at" timestamp with time zone NOT NULL,
	"pr_author_username" text NOT NULL,
	"pr_url" text NOT NULL,
	"file_path" text NOT NULL,
	"start_line" integer NOT NULL,
	"end_line" integer,
	"summary" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "context_file_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repo_id" uuid NOT NULL,
	"format" "context_file_format" NOT NULL,
	"target_path" text NOT NULL,
	"sync_enabled" boolean DEFAULT true NOT NULL,
	"auto_commit" boolean DEFAULT false NOT NULL,
	"sync_status" "context_file_sync_status" DEFAULT 'never' NOT NULL,
	"last_generated_at" timestamp with time zone,
	"last_generated_content_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "filesystem_pattern_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pattern_id" uuid NOT NULL,
	"file_path" text NOT NULL,
	"is_directory" boolean DEFAULT false NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	"added_by" "evidence_source" DEFAULT 'extraction' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pattern_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pattern_id" uuid NOT NULL,
	"file_path" text NOT NULL,
	"start_line" integer,
	"end_line" integer,
	"snippet" text,
	"is_canonical" boolean DEFAULT false NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	"added_by" "evidence_source" DEFAULT 'extraction' NOT NULL,
	"author_username" text,
	"commit_date" timestamp with time zone,
	"commit_sha" text,
	"code_category" "code_category",
	"captured_at_sha" text NOT NULL,
	"is_stale" boolean DEFAULT false NOT NULL,
	"stale_reason" text
);
--> statement-breakpoint
CREATE TABLE "pattern_evolution_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pattern_id" uuid NOT NULL,
	"pull_request_id" uuid NOT NULL,
	"evidence_id" uuid NOT NULL,
	"is_canonical" boolean DEFAULT false NOT NULL,
	"file_path" text NOT NULL,
	"diff_summary" text,
	"status" "pattern_evolution_status" DEFAULT 'pending' NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" uuid,
	"review_note" text,
	"closed_at" timestamp with time zone,
	"violation_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repo_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"type" "pattern_type" NOT NULL,
	"suggested_type" text,
	"status" "pattern_status" DEFAULT 'candidate' NOT NULL,
	"status_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status_changed_by" uuid,
	"extracted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"extracted_by_model" text NOT NULL,
	"extraction_reasoning" text,
	"similar_to_pattern_id" uuid,
	"confidence_model" "confidence_model" DEFAULT 'code' NOT NULL,
	"confidence_score" jsonb,
	"health_signals" jsonb,
	"backtest_summary" jsonb,
	"rationale" text,
	"validated_at" timestamp with time zone,
	"validated_by" uuid,
	"owner_id" uuid,
	"default_severity" "violation_severity" DEFAULT 'warning' NOT NULL,
	"enforcement" jsonb DEFAULT '{"prReview":true,"aiContext":true}'::jsonb NOT NULL,
	"defer_count" integer DEFAULT 0 NOT NULL,
	"deferred_at" timestamp with time zone,
	"rejection_reason" text,
	"glob_pattern" text,
	"anti_pattern_examples" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provenance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pattern_id" uuid NOT NULL,
	"type" "provenance_type" NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"description" text,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	"added_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pull_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repo_id" uuid NOT NULL,
	"github_pr_id" bigint NOT NULL,
	"github_pr_number" integer NOT NULL,
	"title" text NOT NULL,
	"author_github_username" text NOT NULL,
	"base_branch" text NOT NULL,
	"head_branch" text NOT NULL,
	"head_sha" text NOT NULL,
	"diff_storage_path" text,
	"analysis_status" "analysis_status" DEFAULT 'pending' NOT NULL,
	"last_analyzed_at" timestamp with time zone,
	"last_error" text,
	"violation_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repo_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repo_id" uuid NOT NULL,
	"file_path" text NOT NULL,
	"language" text,
	"size_bytes" integer NOT NULL,
	"token_estimate" integer,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "repos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"github_id" bigint NOT NULL,
	"github_full_name" text NOT NULL,
	"default_branch" text DEFAULT 'main' NOT NULL,
	"private" boolean DEFAULT false NOT NULL,
	"installation_id" bigint NOT NULL,
	"ingestion_status" "ingestion_status" DEFAULT 'pending' NOT NULL,
	"last_ingested_at" timestamp with time zone,
	"last_ingested_commit_sha" text,
	"file_count" integer,
	"token_count" integer,
	"extraction_status" "extraction_status" DEFAULT 'pending' NOT NULL,
	"last_extracted_at" timestamp with time zone,
	"pattern_count" integer,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "repos_github_id_unique" UNIQUE("github_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"github_id" bigint NOT NULL,
	"github_username" text NOT NULL,
	"email" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_github_id_unique" UNIQUE("github_id")
);
--> statement-breakpoint
CREATE TABLE "violations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pull_request_id" uuid NOT NULL,
	"pattern_id" uuid NOT NULL,
	"file_path" text NOT NULL,
	"start_line" integer NOT NULL,
	"end_line" integer,
	"description" text NOT NULL,
	"severity" "violation_severity" NOT NULL,
	"violating_snippet" text,
	"suggested_fix" text,
	"github_comment_id" bigint,
	"comment_posted_at" timestamp with time zone,
	"resolution" "violation_resolution" DEFAULT 'open' NOT NULL,
	"resolved_at" timestamp with time zone,
	"resolved_by" uuid,
	"dismissal_reason" text,
	"is_false_positive" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "backtest_violations" ADD CONSTRAINT "backtest_violations_pattern_id_patterns_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."patterns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "context_file_configs" ADD CONSTRAINT "context_file_configs_repo_id_repos_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "filesystem_pattern_evidence" ADD CONSTRAINT "filesystem_pattern_evidence_pattern_id_patterns_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."patterns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pattern_evidence" ADD CONSTRAINT "pattern_evidence_pattern_id_patterns_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."patterns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pattern_evolution_requests" ADD CONSTRAINT "pattern_evolution_requests_pattern_id_patterns_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."patterns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pattern_evolution_requests" ADD CONSTRAINT "pattern_evolution_requests_pull_request_id_pull_requests_id_fk" FOREIGN KEY ("pull_request_id") REFERENCES "public"."pull_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pattern_evolution_requests" ADD CONSTRAINT "pattern_evolution_requests_evidence_id_pattern_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."pattern_evidence"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pattern_evolution_requests" ADD CONSTRAINT "pattern_evolution_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pattern_evolution_requests" ADD CONSTRAINT "pattern_evolution_requests_violation_id_violations_id_fk" FOREIGN KEY ("violation_id") REFERENCES "public"."violations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patterns" ADD CONSTRAINT "patterns_repo_id_repos_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patterns" ADD CONSTRAINT "patterns_status_changed_by_users_id_fk" FOREIGN KEY ("status_changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patterns" ADD CONSTRAINT "patterns_validated_by_users_id_fk" FOREIGN KEY ("validated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patterns" ADD CONSTRAINT "patterns_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provenance" ADD CONSTRAINT "provenance_pattern_id_patterns_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."patterns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provenance" ADD CONSTRAINT "provenance_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_repo_id_repos_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repo_files" ADD CONSTRAINT "repo_files_repo_id_repos_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repos" ADD CONSTRAINT "repos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "violations" ADD CONSTRAINT "violations_pull_request_id_pull_requests_id_fk" FOREIGN KEY ("pull_request_id") REFERENCES "public"."pull_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "violations" ADD CONSTRAINT "violations_pattern_id_patterns_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."patterns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "violations" ADD CONSTRAINT "violations_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_backtest_violations_pattern" ON "backtest_violations" USING btree ("pattern_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_context_file_configs_unique" ON "context_file_configs" USING btree ("repo_id","format");--> statement-breakpoint
CREATE INDEX "idx_context_file_configs_repo" ON "context_file_configs" USING btree ("repo_id");--> statement-breakpoint
CREATE INDEX "idx_filesystem_evidence_pattern" ON "filesystem_pattern_evidence" USING btree ("pattern_id");--> statement-breakpoint
CREATE INDEX "idx_pattern_evidence_pattern" ON "pattern_evidence" USING btree ("pattern_id");--> statement-breakpoint
CREATE INDEX "idx_evolution_requests_pattern" ON "pattern_evolution_requests" USING btree ("pattern_id");--> statement-breakpoint
CREATE INDEX "idx_evolution_requests_pr" ON "pattern_evolution_requests" USING btree ("pull_request_id");--> statement-breakpoint
CREATE INDEX "idx_evolution_requests_status" ON "pattern_evolution_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_patterns_repo_status" ON "patterns" USING btree ("repo_id","status");--> statement-breakpoint
CREATE INDEX "idx_patterns_owner" ON "patterns" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_provenance_pattern" ON "provenance" USING btree ("pattern_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_pull_requests_unique" ON "pull_requests" USING btree ("repo_id","github_pr_number");--> statement-breakpoint
CREATE INDEX "idx_pull_requests_repo" ON "pull_requests" USING btree ("repo_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_repo_files_unique" ON "repo_files" USING btree ("repo_id","file_path");--> statement-breakpoint
CREATE INDEX "idx_repo_files_repo" ON "repo_files" USING btree ("repo_id");--> statement-breakpoint
CREATE INDEX "idx_repos_user" ON "repos" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_violations_pr" ON "violations" USING btree ("pull_request_id");