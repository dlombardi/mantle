/**
 * Tests for the useAuth hook.
 *
 * Tests authentication state management, sign in/out methods,
 * and auth state change subscriptions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from './use-auth';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

// Helper to create mock user
function createMockUser(overrides = {}): User {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {
      avatar_url: 'https://github.com/avatar.png',
      user_name: 'testuser',
    },
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  } as User;
}

// Helper to create mock session
function createMockSession(user: User): Session {
  return {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    token_type: 'bearer',
    user,
  } as Session;
}

// Create mock auth methods that we can control per test
const mockGetSession = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChange = vi.fn();

// Mock Supabase module
vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    auth: {
      getSession: mockGetSession,
      signInWithOAuth: mockSignInWithOAuth,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}));

describe('useAuth', () => {
  let authChangeCallback: ((event: AuthChangeEvent, session: Session | null) => void) | null = null;

  beforeEach(() => {
    authChangeCallback = null;
    vi.clearAllMocks();

    // Default mock implementations
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });
    mockOnAuthStateChange.mockImplementation((callback) => {
      authChangeCallback = callback;
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
      };
    });
  });

  describe('initial state', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('should set loading to false after checking session', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('should populate user when session exists', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });
  });

  describe('signInWithGitHub', () => {
    it('should call Supabase signInWithOAuth with github provider', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signInWithGitHub();
      });

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      });
    });

    it('should throw error when OAuth fails', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: { provider: 'github', url: null },
        error: { message: 'OAuth error', name: 'AuthError', status: 400 },
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.signInWithGitHub();
        }),
      ).rejects.toMatchObject({ message: 'OAuth error' });
    });
  });

  describe('signOut', () => {
    it('should call Supabase signOut', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should throw error when signOut fails', async () => {
      mockSignOut.mockResolvedValue({
        error: { message: 'Sign out error', name: 'AuthError', status: 400 },
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.signOut();
        }),
      ).rejects.toMatchObject({ message: 'Sign out error' });
    });
  });

  describe('auth state changes', () => {
    it('should update state when auth changes', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();

      // Simulate auth state change (user signs in)
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);

      act(() => {
        authChangeCallback?.('SIGNED_IN', mockSession);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
    });

    it('should clear state when user signs out', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession(mockUser);

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      // Simulate sign out
      act(() => {
        authChangeCallback?.('SIGNED_OUT', null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });

    it('should unsubscribe on unmount', async () => {
      const unsubscribeMock = vi.fn();
      mockOnAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: unsubscribeMock } },
      });

      const { unmount } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled();
      });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
});
