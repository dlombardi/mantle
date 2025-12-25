/**
 * Authentication hook for GitHub OAuth via Supabase.
 *
 * Provides user state, sign in/out methods, and loading state.
 * Uses Supabase Auth under the hood.
 */

import { useCallback, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

interface UseAuthReturn extends AuthState {
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGitHub = useCallback(async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('GitHub sign in error:', error.message);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error.message);
      throw error;
    }
  }, []);

  return {
    ...state,
    signInWithGitHub,
    signOut,
  };
}
