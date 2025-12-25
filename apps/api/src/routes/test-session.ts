/**
 * Test Session Routes - Generate authenticated sessions for QA automation
 *
 * SECURITY: Only available in development and preview environments.
 * Protected by environment check - will return 403 in production.
 *
 * This endpoint uses Supabase Admin API to create test user sessions
 * that can be injected into a browser for automated QA verification.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { getSupabaseClient } from '../lib/supabase/client';

// Well-known test user (matches packages/test-utils/src/scenarios/with-test-user.ts)
const TEST_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@example.com',
  githubId: 12345,
  githubUsername: 'testuser',
};

/**
 * Check if we're in a testable environment (dev or preview)
 */
function isTestableEnvironment(): boolean {
  const vercelEnv = process.env.VERCEL_ENV;
  const nodeEnv = process.env.NODE_ENV;

  // Allow test sessions in:
  // - Local development (no VERCEL_ENV, NODE_ENV !== 'production')
  // - Vercel preview deployments (VERCEL_ENV === 'preview')
  if (vercelEnv === 'preview') return true;
  if (!vercelEnv && nodeEnv !== 'production') return true;

  return false;
}

// Response schemas for documentation and testing
export const testSessionResponseSchema = z.object({
  session: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number(),
    expires_at: z.number(),
    token_type: z.literal('bearer'),
    user: z.object({
      id: z.string(),
      email: z.string(),
      user_metadata: z.record(z.unknown()),
    }),
  }),
  storageKey: z.string(),
  storageData: z.record(z.unknown()),
});

export const testSessionRoutes = new Hono();

/**
 * POST /api/test/session - Generate a test user session
 *
 * Creates or retrieves the test user in Supabase Auth, then generates
 * a session that can be injected into browser localStorage.
 *
 * Response includes:
 * - session: The raw Supabase session object
 * - storageKey: The localStorage key to use (sb-<ref>-auth-token)
 * - storageData: Pre-formatted data to store in localStorage
 */
testSessionRoutes.post('/', async (c) => {
  // Security check: only allow in dev/preview
  if (!isTestableEnvironment()) {
    return c.json(
      {
        error: {
          code: 'FORBIDDEN',
          message: 'Test session endpoint is only available in development and preview environments',
        },
      },
      403,
    );
  }

  try {
    const supabase = getSupabaseClient();

    // Extract project ref from URL for storage key
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is not configured');
    }

    // URL format: https://<project-ref>.supabase.co
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
    const storageKey = `sb-${projectRef}-auth-token`;

    // Check if test user exists
    const { data: existingUser } = await supabase.auth.admin.getUserById(TEST_USER.id);

    let userId = TEST_USER.id;

    if (!existingUser.user) {
      // Create the test user with admin API
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        id: TEST_USER.id,
        email: TEST_USER.email,
        email_confirm: true, // Skip email verification
        user_metadata: {
          github_id: TEST_USER.githubId,
          user_name: TEST_USER.githubUsername,
          avatar_url: `https://avatars.githubusercontent.com/u/${TEST_USER.githubId}`,
          provider_id: String(TEST_USER.githubId),
          full_name: 'Test User',
        },
        app_metadata: {
          provider: 'github',
          providers: ['github'],
        },
      });

      if (createError) {
        // If user exists with different ID, try to find them
        if (createError.message.includes('already been registered')) {
          const { data: listData } = await supabase.auth.admin.listUsers();
          const foundUser = listData.users.find((u) => u.email === TEST_USER.email);
          if (foundUser) {
            userId = foundUser.id;
          } else {
            throw createError;
          }
        } else {
          throw createError;
        }
      } else if (createData.user) {
        userId = createData.user.id;
      }
    }

    // Generate a magic link to create a session
    // We use 'magiclink' type which creates a session when the link is "used"
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: TEST_USER.email,
      options: {
        // Short expiry since we're using it immediately
        redirectTo: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
      },
    });

    if (linkError) {
      throw linkError;
    }

    if (!linkData.properties?.hashed_token) {
      throw new Error('Failed to generate session token');
    }

    // Verify the token to get a session
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email: TEST_USER.email,
      token: linkData.properties.hashed_token,
      type: 'magiclink',
    });

    if (verifyError) {
      // verifyOtp doesn't work with hashed_token directly
      // Use alternative approach: generate session via signInWithPassword
      // by setting a known password for the test user
      const testPassword = `test-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      await supabase.auth.admin.updateUserById(userId, {
        password: testPassword,
      });

      // Now sign in with password to get a real session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: TEST_USER.email,
        password: testPassword,
      });

      if (signInError || !signInData.session) {
        throw signInError ?? new Error('Failed to create session');
      }

      const session = signInData.session;

      // Format for localStorage
      const storageData = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        expires_at: session.expires_at,
        token_type: 'bearer',
        user: {
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
          app_metadata: session.user.app_metadata,
          aud: 'authenticated',
          role: 'authenticated',
        },
      };

      return c.json({
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_in: session.expires_in ?? 3600,
          expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: {
            id: session.user.id,
            email: session.user.email ?? TEST_USER.email,
            user_metadata: session.user.user_metadata ?? {},
          },
        },
        storageKey,
        storageData,
      });
    }

    // verifyOtp worked - use that session
    const session = verifyData.session;
    if (!session) {
      throw new Error('No session returned from verification');
    }

    const storageData = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
      expires_at: session.expires_at,
      token_type: 'bearer',
      user: {
        id: session.user.id,
        email: session.user.email,
        user_metadata: session.user.user_metadata,
        app_metadata: session.user.app_metadata,
        aud: 'authenticated',
        role: 'authenticated',
      },
    };

    return c.json({
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in ?? 3600,
        expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: {
          id: session.user.id,
          email: session.user.email ?? TEST_USER.email,
          user_metadata: session.user.user_metadata ?? {},
        },
      },
      storageKey,
      storageData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Test session error:', error);

    return c.json(
      {
        error: {
          code: 'SESSION_ERROR',
          message,
        },
      },
      500,
    );
  }
});

/**
 * GET /api/test/session - Check if test session endpoint is available
 */
testSessionRoutes.get('/', async (c) => {
  if (!isTestableEnvironment()) {
    return c.json(
      {
        error: {
          code: 'FORBIDDEN',
          message: 'Test session endpoint is only available in development and preview environments',
        },
      },
      403,
    );
  }

  return c.json({
    available: true,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
    testUser: {
      email: TEST_USER.email,
      githubUsername: TEST_USER.githubUsername,
    },
  });
});
