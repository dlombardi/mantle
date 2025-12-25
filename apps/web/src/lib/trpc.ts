/**
 * tRPC React client configuration.
 *
 * This sets up the tRPC client with React Query integration
 * for type-safe API calls to the backend.
 *
 * @example
 * ```typescript
 * // In a component
 * const { data, isLoading } = trpc.repos.list.useQuery({ page: 1, limit: 20 });
 *
 * // Mutations
 * const { mutate } = trpc.repos.connect.useMutation({
 *   onSuccess: () => utils.repos.list.invalidate(),
 * });
 * ```
 */

import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import { QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';
import type { AppRouter } from '@mantle/trpc';

/**
 * tRPC React hooks instance.
 *
 * Use this to access type-safe query/mutation hooks:
 * - trpc.health.useQuery()
 * - trpc.repos.list.useQuery({ page, limit })
 * - trpc.repos.connect.useMutation()
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Creates and returns a configured tRPC client.
 *
 * The client uses:
 * - httpBatchLink: Batches multiple requests into a single HTTP call
 * - superjson: Preserves Date objects and other JavaScript types
 * - Auth header: Injects Supabase token when available
 */
export function createTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        transformer: superjson,
        headers: async () => {
          // Get auth token from Supabase session
          try {
            const { getSupabaseClient } = await import('./supabase');
            const supabase = getSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
              return { Authorization: `Bearer ${session.access_token}` };
            }
          } catch {
            // Supabase not available or session error
          }
          return {};
        },
      }),
    ],
  });
}

/**
 * Creates a configured QueryClient instance.
 *
 * Settings:
 * - staleTime: 5 minutes (data considered fresh)
 * - retry: 1 attempt on failure
 * - refetchOnWindowFocus: disabled in development
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: import.meta.env.DEV ? false : true,
      },
    },
  });
}
