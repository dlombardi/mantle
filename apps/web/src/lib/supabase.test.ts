/**
 * Tests for Supabase client utilities.
 */

import { describe, it, expect } from 'vitest';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

describe('Supabase Client', () => {
  describe('getSupabaseClient', () => {
    it('should return a mocked supabase client', () => {
      const client = getSupabaseClient();

      expect(client).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.from).toBeDefined();
    });

    it('should have auth methods', () => {
      const client = getSupabaseClient();

      expect(client.auth.getUser).toBeDefined();
      expect(client.auth.signInWithOAuth).toBeDefined();
      expect(client.auth.signOut).toBeDefined();
      expect(client.auth.onAuthStateChange).toBeDefined();
    });

    it('should return null user by default in tests', async () => {
      const client = getSupabaseClient();
      const result = await client.auth.getUser();

      expect(result.data.user).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('isSupabaseConfigured', () => {
    it('should return true when env vars are set', () => {
      expect(isSupabaseConfigured()).toBe(true);
    });
  });
});
