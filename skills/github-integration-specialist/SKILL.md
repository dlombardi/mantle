---
name: github-integration-specialist
description: |
  Handles all GitHub App integration for Reasoning Substrate: OAuth login flow, App installation
  flow, installation token generation, and webhook signature verification. Invoke when working on:
  GitHub authentication, app installation, token management, webhook endpoints, or any files in
  lib/github/, app/auth/, app/api/github/, or components/auth/.
license: MIT
compatibility: GitHub App API, @octokit/auth-app, Supabase Auth, Next.js 14+
allowed-tools: Read Write Bash(npm:*) Bash(npx:*) Glob Grep
metadata:
  role: domain-specialist
  task-count: 8
  critical-path: true
  phase: 1-2
---

# GitHub Integration Specialist

## Purpose

Implement GitHub App authentication, installation flow, and webhook infrastructure. This enables users to connect their repositories and receive webhook events for PR analysis.

## When to Activate This Skill

- GitHub OAuth implementation
- App installation flow
- Token generation utilities
- Webhook endpoints
- Working on files in:
  - `lib/github/*`
  - `app/auth/*`
  - `app/api/github/*`
  - `components/auth/*`

## Prerequisites

Before starting, ensure:
- [ ] Database schema exists (via foundation-specialist)
- [ ] GitHub App registered with required permissions
- [ ] Private key generated and stored securely
- [ ] Supabase Auth configured with GitHub provider
- [ ] Environment variables set:
  - `GITHUB_APP_ID`
  - `GITHUB_APP_PRIVATE_KEY`
  - `GITHUB_WEBHOOK_SECRET`
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`

## Tasks Owned

| Task ID | Description | Priority |
|---------|-------------|----------|
| task-1.4-github-app-setup | Register GitHub App | P0 |
| task-1.5-github-oauth | Implement OAuth flow | P0 |
| task-1.7-installation-flow | App installation handling | P0 |
| task-1.8-installation-token | On-demand token generation | P0 |
| task-5b.1-webhook-endpoint | Webhook signature verification | P0 |
| task-6.1e-github-rate-limits | Rate limit handling | P1 |
| task-6.11-auth-deep-linking | ReturnTo URL preservation | P2 |

## Workflow

### Step 1: Token Utility

1. Install Octokit dependencies:
   ```bash
   npm install @octokit/rest @octokit/auth-app @octokit/webhooks-methods
   ```

2. Create `lib/github/auth.ts`:
   ```typescript
   import { createAppAuth } from '@octokit/auth-app';

   const appAuth = createAppAuth({
     appId: process.env.GITHUB_APP_ID!,
     privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, '\n'),
   });

   export async function getInstallationToken(installationId: number): Promise<string> {
     const auth = await appAuth({
       type: 'installation',
       installationId,
     });
     return auth.token;
   }

   export async function getInstallationOctokit(installationId: number) {
     const token = await getInstallationToken(installationId);
     return new Octokit({ auth: token });
   }
   ```

3. Create `lib/github/octokit.ts`:
   ```typescript
   import { Octokit } from '@octokit/rest';
   import { getInstallationToken } from './auth';

   export async function createInstallationOctokit(installationId: number) {
     const token = await getInstallationToken(installationId);
     return new Octokit({
       auth: token,
       userAgent: 'reasoning-substrate/1.0',
     });
   }
   ```

**Key Decision (D4, D15):** Never store tokens. Only store `installationId` and generate tokens on-demand using `@octokit/auth-app`.

### Step 2: OAuth Flow

1. Create `app/auth/callback/route.ts`:
   ```typescript
   import { createClient } from '@/lib/supabase/server';
   import { NextResponse } from 'next/server';

   export async function GET(request: Request) {
     const { searchParams, origin } = new URL(request.url);
     const code = searchParams.get('code');
     const next = searchParams.get('next') ?? '/';

     if (code) {
       const supabase = await createClient();
       const { error } = await supabase.auth.exchangeCodeForSession(code);

       if (!error) {
         return NextResponse.redirect(`${origin}${next}`);
       }
     }

     return NextResponse.redirect(`${origin}/auth/error`);
   }
   ```

2. Create `lib/github/oauth.ts`:
   ```typescript
   import { createClient } from '@/lib/supabase/client';

   export async function signInWithGitHub(returnTo?: string) {
     const supabase = createClient();
     const redirectTo = `${window.location.origin}/auth/callback${returnTo ? `?next=${encodeURIComponent(returnTo)}` : ''}`;

     const { error } = await supabase.auth.signInWithOAuth({
       provider: 'github',
       options: {
         redirectTo,
         scopes: 'read:user user:email',
       },
     });

     if (error) throw error;
   }
   ```

3. Create `components/auth/login-button.tsx`:
   ```typescript
   'use client';

   import { signInWithGitHub } from '@/lib/github/oauth';
   import { Button } from '@/components/ui/button';

   export function LoginButton({ returnTo }: { returnTo?: string }) {
     return (
       <Button onClick={() => signInWithGitHub(returnTo)}>
         Sign in with GitHub
       </Button>
     );
   }
   ```

### Step 3: Installation Flow

1. Create `app/api/github/callback/route.ts`:
   ```typescript
   import { createAdminClient } from '@/lib/supabase/admin';
   import { createInstallationOctokit } from '@/lib/github/octokit';
   import { NextResponse } from 'next/server';

   export async function GET(request: Request) {
     const { searchParams } = new URL(request.url);
     const installationId = searchParams.get('installation_id');
     const setupAction = searchParams.get('setup_action');

     if (!installationId) {
       return NextResponse.redirect('/error?message=missing_installation_id');
     }

     const supabase = createAdminClient();

     // Fetch repos accessible to this installation
     const octokit = await createInstallationOctokit(Number(installationId));
     const { data: installation } = await octokit.rest.apps.getInstallation({
       installation_id: Number(installationId),
     });

     // Store or update installation
     // Redirect to repo selection
     return NextResponse.redirect(`/repos/select?installation_id=${installationId}`);
   }
   ```

2. Create `components/repos/repo-selector.tsx`:
   ```typescript
   'use client';

   import { useState } from 'react';

   type Repo = {
     id: number;
     full_name: string;
     private: boolean;
   };

   export function RepoSelector({
     repos,
     installationId,
     onSelect,
   }: {
     repos: Repo[];
     installationId: number;
     onSelect: (repoIds: number[]) => void;
   }) {
     const [selected, setSelected] = useState<Set<number>>(new Set());

     const toggle = (id: number) => {
       const next = new Set(selected);
       if (next.has(id)) next.delete(id);
       else next.add(id);
       setSelected(next);
     };

     return (
       <div className="space-y-4">
         <h2 className="text-lg font-semibold">Select repositories to analyze</h2>
         <div className="space-y-2">
           {repos.map((repo) => (
             <label key={repo.id} className="flex items-center gap-2">
               <input
                 type="checkbox"
                 checked={selected.has(repo.id)}
                 onChange={() => toggle(repo.id)}
               />
               <span>{repo.full_name}</span>
               {repo.private && <span className="text-xs text-gray-500">(private)</span>}
             </label>
           ))}
         </div>
         <button onClick={() => onSelect(Array.from(selected))}>
           Connect {selected.size} repositories
         </button>
       </div>
     );
   }
   ```

### Step 4: Webhook Endpoint

1. Create `lib/github/webhook-verify.ts`:
   ```typescript
   import { verify } from '@octokit/webhooks-methods';

   export async function verifyWebhookSignature(
     payload: string,
     signature: string | null
   ): Promise<boolean> {
     if (!signature) return false;

     const secret = process.env.GITHUB_WEBHOOK_SECRET!;
     return verify(secret, payload, signature);
   }
   ```

2. Create `app/api/github/webhook/route.ts`:
   ```typescript
   import { verifyWebhookSignature } from '@/lib/github/webhook-verify';
   import { NextResponse } from 'next/server';

   export async function POST(request: Request) {
     const signature = request.headers.get('x-hub-signature-256');
     const event = request.headers.get('x-github-event');
     const payload = await request.text();

     // Verify signature
     const isValid = await verifyWebhookSignature(payload, signature);
     if (!isValid) {
       console.error('Webhook signature verification failed');
       return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
     }

     const data = JSON.parse(payload);

     // Route to handlers
     switch (event) {
       case 'pull_request':
         await handlePullRequest(data);
         break;
       case 'installation':
         await handleInstallation(data);
         break;
       default:
         console.log(`Unhandled event: ${event}`);
     }

     return NextResponse.json({ received: true });
   }

   async function handlePullRequest(data: any) {
     const { action, pull_request, repository, installation } = data;

     if (action === 'opened' || action === 'synchronize') {
       // Trigger PR analysis job
       // Implementation in enforcement-specialist
     }
   }

   async function handleInstallation(data: any) {
     const { action, installation, repositories } = data;
     // Handle installation/uninstallation
   }
   ```

### Step 5: Rate Limit Handling

Create `lib/github/rate-limit.ts`:
```typescript
import { Octokit } from '@octokit/rest';

export async function withRateLimit<T>(
  octokit: Octokit,
  fn: () => Promise<T>
): Promise<T> {
  const MAX_RETRIES = 3;
  const BACKOFF_BASE_MS = 1000;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 403 && error.message.includes('rate limit')) {
        // Check rate limit headers
        const { data: rateLimit } = await octokit.rest.rateLimit.get();
        const resetTime = rateLimit.resources.core.reset * 1000;
        const waitTime = Math.max(resetTime - Date.now(), BACKOFF_BASE_MS);

        console.log(`Rate limited. Waiting ${waitTime}ms before retry.`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      if (error.status === 403 && error.message.includes('secondary rate limit')) {
        // Exponential backoff for secondary limits
        const waitTime = BACKOFF_BASE_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      throw error;
    }
  }

  throw new Error('Max retries exceeded for rate-limited request');
}

export async function checkRateLimit(octokit: Octokit): Promise<{
  remaining: number;
  reset: Date;
  shouldBackoff: boolean;
}> {
  const { data } = await octokit.rest.rateLimit.get();
  const { remaining, reset } = data.resources.core;

  return {
    remaining,
    reset: new Date(reset * 1000),
    shouldBackoff: remaining < 100,
  };
}
```

### Step 6: Installation Management

Create `lib/github/installation.ts`:
```typescript
import { createInstallationOctokit } from './octokit';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getInstallationRepos(installationId: number) {
  const octokit = await createInstallationOctokit(installationId);
  const { data } = await octokit.rest.apps.listReposAccessibleToInstallation();
  return data.repositories;
}

export async function syncRepoInstallation(
  userId: string,
  installationId: number,
  selectedRepoIds: number[]
) {
  const supabase = createAdminClient();
  const repos = await getInstallationRepos(installationId);

  const reposToCreate = repos
    .filter((r) => selectedRepoIds.includes(r.id))
    .map((r) => ({
      user_id: userId,
      name: r.name,
      full_name: r.full_name,
      installation_id: installationId,
    }));

  const { data, error } = await supabase
    .from('repos')
    .upsert(reposToCreate, { onConflict: 'full_name' })
    .select();

  if (error) throw error;
  return data;
}
```

## Output Specification

After running this skill, the following should exist:

### Files Created
```
lib/github/
├── auth.ts              # Token generation
├── octokit.ts           # Client factory
├── oauth.ts             # OAuth helpers
├── webhook-verify.ts    # Signature verification
├── rate-limit.ts        # Rate limit handling
└── installation.ts      # Installation management

app/auth/
└── callback/route.ts    # OAuth callback

app/api/github/
├── callback/route.ts    # Installation callback
└── webhook/route.ts     # Webhook endpoint

components/auth/
└── login-button.tsx     # Login button component

components/repos/
└── repo-selector.tsx    # Repo selection UI
```

### Validation Checks
- [ ] OAuth flow completes without errors
- [ ] Installation tokens are valid for GitHub API calls
- [ ] Webhook signatures validate correctly
- [ ] Rate limit handling works (test with low limit simulation)

## Error Handling

| Error | Resolution |
|-------|------------|
| Invalid credentials | Clear error message with setup instructions |
| Rate limit hit | Exponential backoff, queue retry |
| Webhook signature mismatch | Return 401, log for security audit |
| Installation not found | Re-trigger installation flow |

## Key Decisions Referenced

| ID | Decision | Impact |
|----|----------|--------|
| D4 | GitHub App auth model | Use `@octokit/auth-app`, not OAuth tokens |
| D15 | No token storage | Only store `installationId`, generate tokens on-demand |

## Security Considerations

1. **Private Key Security**: Store in environment variable, never commit
2. **Webhook Verification**: Always verify signatures before processing
3. **Token Scope**: Request minimal required scopes
4. **Audit Logging**: Log failed auth attempts for security review

## Handoffs

- **Token utility ready** → ingestion-specialist can fetch repo content
- **Webhook endpoint ready** → enforcement-specialist handles PR events
- **OAuth flow ready** → Users can sign in and connect repos
