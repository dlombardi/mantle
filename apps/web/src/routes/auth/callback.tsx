/**
 * OAuth callback route.
 *
 * Handles the redirect from Supabase after GitHub OAuth.
 * Exchanges the auth code for a session and redirects to home.
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../../lib/supabase';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getSupabaseClient();

      // Check for error in URL (query params or hash)
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1));

      const errorParam = params.get('error') || hashParams.get('error');
      const errorDescription = params.get('error_description') || hashParams.get('error_description');

      if (errorParam) {
        setError(errorDescription || errorParam);
        return;
      }

      // Handle PKCE flow (code in query params)
      const code = params.get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        navigate({ to: '/' });
        return;
      }

      // Handle implicit flow (tokens in hash fragment)
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        // Explicitly set the session from hash tokens
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        // Clear the hash from URL for cleaner UX
        window.history.replaceState(null, '', window.location.pathname);
        navigate({ to: '/' });
        return;
      }

      // Check if we already have a session (e.g., page refresh without hash)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate({ to: '/' });
        return;
      }

      // No auth data found
      setError('No authentication data received');
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Return to home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Completing sign in...
        </p>
      </div>
    </main>
  );
}
