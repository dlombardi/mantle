# Preview Environment Setup Guide

This guide configures isolated preview environments for QA verification in the agentic workflow.

---

## Architecture Overview

```
PRODUCTION                              PREVIEW
──────────                              ───────

Vercel (mantle.app)                     Vercel (mantle-git-*.vercel.app)
       │                                       │
       │ VITE_API_URL                          │ VITE_API_URL
       ▼                                       ▼
Railway (prod env)                      Railway (preview env)
       │                                       │
       │ DATABASE_URL                          │ DATABASE_URL
       ▼                                       ▼
Supabase (main branch)                  Supabase (preview branch)
```

**Result:** Preview deployments are fully isolated. Seed API can freely create/destroy test data without affecting production.

---

## Step 1: Create Supabase Preview Branch

Supabase branching creates an isolated database that inherits your schema from main. Schema changes automatically sync when you merge to main.

### 1.1 Enable Branching (First Time Only)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your **mantle** project
3. Go to **Branches** in the sidebar
4. If prompted, click **Enable Branching**

### 1.2 Create Preview Branch

**Option A: Via Dashboard**
1. Go to **Branches** → **Create Branch**
2. Name: `preview`
3. Click **Create Branch**
4. Wait for branch to initialize (~1-2 minutes)

**Option B: Via CLI**
```bash
# Link to your project first (if not already)
supabase link --project-ref <your-project-ref>

# Create the branch
supabase branches create preview
```

### 1.3 Get Branch Connection Details

Once the branch is created:

1. Go to **Branches** → Click on `preview`
2. You'll see the branch-specific credentials

Copy these values:

| Value | Where to Find | Use For |
|-------|---------------|---------|
| **Database URL** | Settings → Database → Connection string (Pooler) | `DATABASE_URL` in Railway |
| **Project URL** | Same as main (branches share the project URL) | `SUPABASE_URL` |
| **API Keys** | Same as main (branches share keys) | `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_ANON_KEY` |

> **Note:** Branches share the same project URL and API keys as main. Only the `DATABASE_URL` is different.

### 1.4 Verify Branch Schema

The branch automatically inherits your current schema. Verify it has your tables:

```bash
# Connect to branch database
psql "<branch-database-url>"

# List tables
\dt

# Should show: users, repos, patterns, etc.
```

---

## Step 2: Configure Railway Preview Environment

### 2.1 Create Preview Environment

1. Go to your [Railway dashboard](https://railway.app/dashboard)
2. Open your `mantle-api` project
3. Click **Environments** (top right dropdown)
4. Click **New Environment**
5. Name it: `preview`

### 2.2 Configure Preview Environment Variables

In the Railway `preview` environment, set these variables:

```env
# Database (Supabase BRANCH - only this differs from production)
DATABASE_URL=postgresql://postgres.[branch-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Supabase (same as production - branches share project URL and keys)
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Same service_role key as production

# Environment markers (enables seed API)
NODE_ENV=development
VERCEL_ENV=preview

# Server
PORT=3001
CORS_ORIGIN=*
```

> **Key Point:** With Supabase branching, only `DATABASE_URL` changes between environments. The `SUPABASE_URL` and keys are shared because branches are part of the same project.

> **Important:** Setting `VERCEL_ENV=preview` allows the seed API to function. This is safe because the branch database is expendable.

### 2.3 Deploy Preview Environment

Railway will auto-deploy when you push. To manually deploy:

```bash
# In Railway dashboard:
# 1. Select "preview" environment
# 2. Click "Deploy" or push to trigger
```

### 2.4 Get Preview API URL

After deployment, Railway provides a URL like:

```
https://mantle-api-preview.up.railway.app
```

Save this - you'll need it for Vercel.

---

## Step 3: Configure Vercel Preview Deployments

### 3.1 Set Preview Environment Variables

1. Go to [Vercel dashboard](https://vercel.com/dashboard)
2. Open your `mantle` project
3. Go to **Settings → Environment Variables**
4. Set the **Preview** value for `VITE_API_URL`:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | `https://mantle-api-preview.up.railway.app` | Preview |

> **That's it!** With Supabase branching, `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` stay the same across all environments. The branch isolation happens at the database level via Railway's `DATABASE_URL`.

### 3.2 Verify Configuration

Your Vercel environment variables should look like:

```
VITE_API_URL
├── Production: https://mantle-api-production.up.railway.app
└── Preview:    https://mantle-api-preview.up.railway.app  ← Only this differs

VITE_SUPABASE_URL
├── Production: https://[your-project].supabase.co
└── Preview:    (same - not set, inherits from Production)

VITE_SUPABASE_ANON_KEY
├── Production: eyJ...
└── Preview:    (same - not set, inherits from Production)
```

---

## Step 4: Verify Setup

### 4.1 Create a Test Branch

```bash
git checkout -b test/preview-env
echo "# Test" >> README.md
git add . && git commit -m "test: verify preview environment"
git push -u origin test/preview-env
```

### 4.2 Wait for Deployments

- **Vercel:** Creates preview at `https://mantle-git-test-preview-env-*.vercel.app`
- **Railway:** Already deployed (preview env is persistent)

### 4.3 Test Health Endpoint

```bash
# Replace with your actual preview URL
PREVIEW_URL="https://mantle-git-test-preview-env-*.vercel.app"

# Test API is reachable (via Vercel → Railway preview)
curl "$PREVIEW_URL/api/health"
```

Expected response:
```json
{
  "status": "healthy",
  "database": { "connected": true },
  "timestamp": "..."
}
```

### 4.4 Test Seed API

```bash
# List available scenarios (should work on preview, fail on prod)
curl "$PREVIEW_URL/api/seed"

# Expected:
{
  "scenarios": ["empty-repo", "with-test-user", "with-patterns"],
  "environment": "preview"
}

# Seed with test data
curl -X POST "$PREVIEW_URL/api/seed" \
  -H "Content-Type: application/json" \
  -d '{"scenario": "with-test-user"}'

# Expected:
{
  "success": true,
  "scenario": "with-test-user",
  "message": "Scenario 'with-test-user' loaded successfully"
}
```

### 4.5 Verify Production is Protected

```bash
# This should return 403
curl "https://mantle.app/api/seed"

# Expected:
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Seed endpoint is only available in development and preview environments"
  }
}
```

### 4.6 Clean Up Test Branch

```bash
git checkout main
git branch -D test/preview-env
git push origin --delete test/preview-env
```

---

## Step 5: Update QA Harness Configuration

The QA harness needs to know the preview URL pattern. Create or update:

```typescript
// e2e/harness/config.ts
export const QA_CONFIG = {
  // Vercel preview URL pattern
  getPreviewUrl: (branch: string) =>
    `https://mantle-git-${branch.replace(/\//g, '-')}.vercel.app`,

  // Default seed scenario
  defaultScenario: 'with-test-user',

  // Health check settings
  healthCheck: {
    maxRetries: 3,
    retryDelayMs: 10000,
  },
};
```

---

## Environment Variable Reference

With Supabase branching, most variables are shared. Only `DATABASE_URL` and routing differ.

### Railway Production Environment

```env
DATABASE_URL=postgresql://...           # Main branch pooler
SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://mantle.app
```

### Railway Preview Environment

```env
DATABASE_URL=postgresql://...           # Preview BRANCH pooler (different!)
SUPABASE_URL=https://[project].supabase.co  # Same as production
SUPABASE_SERVICE_ROLE_KEY=eyJ...            # Same as production
NODE_ENV=development                    # Allows seed API
VERCEL_ENV=preview                      # Matches Vercel preview detection
PORT=3001
CORS_ORIGIN=*                           # Allow all preview domains
```

### Vercel (All Environments)

```env
# Shared across Production and Preview
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Vercel Production Only

```env
VITE_API_URL=https://mantle-api-production.up.railway.app
```

### Vercel Preview Only

```env
VITE_API_URL=https://mantle-api-preview.up.railway.app
```

---

## Troubleshooting

### Seed API Returns 403 on Preview

**Cause:** Environment variables not set correctly in Railway preview.

**Fix:** Verify `VERCEL_ENV=preview` or `NODE_ENV=development` is set.

### Database Connection Fails

**Cause:** Using direct connection instead of pooler, or wrong credentials.

**Fix:**
- Use the **pooler** connection string (port 6543, not 5432)
- Verify password is correct
- Check IP allowlist in Supabase (should allow all for preview)

### Preview Frontend Hits Production API

**Cause:** Vercel preview environment variables not set.

**Fix:** In Vercel, ensure `VITE_API_URL` has a **Preview** value that differs from Production.

### Migrations Not Applied to Preview DB

**Cause:** Schema exists in production but not preview.

**Fix:** Run migrations against preview:
```bash
DATABASE_URL="postgresql://...[preview]..." bun run db:push
```

---

## Maintenance

### Resetting Preview Database

If preview data gets corrupted or you want a clean slate:

```bash
# Option 1: Via seed API
curl -X DELETE "https://[preview-url]/api/seed"

# Option 2: Via Supabase dashboard
# Select the preview branch → SQL Editor → Run:
TRUNCATE users, repos, patterns CASCADE;

# Option 3: Reset branch to match main
supabase branches reset preview
```

### Schema Sync (Automatic with Branching)

**Good news:** With Supabase branching, schema stays in sync automatically.

When you merge migrations to `main`:
1. Production applies the migration
2. The `preview` branch inherits the new schema on next reset

If your preview branch gets out of sync:
```bash
# Reset branch to match main's current schema
supabase branches reset preview
```

---

## Cost Summary

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Supabase Branch | Pro (included) | $0 (part of Pro plan) |
| Railway Preview Env | Hobby | ~$5 (usage-based) |
| Vercel Previews | Included | $0 |
| **Total** | | **~$5/month** |

> **Note:** Supabase branches are included in your Pro plan. Each branch uses compute time, but for QA purposes this is negligible.

---

## Next Steps

After setup is complete:

1. Run `bd ready` to find a bead to test with
2. Push a branch and wait for preview deploy
3. Run the QA harness against the preview URL
4. Verify seed data appears in preview Supabase (not production)
