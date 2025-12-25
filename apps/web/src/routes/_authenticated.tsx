import { createFileRoute, redirect } from '@tanstack/react-router';
import { AuthenticatedLayout } from '@/layouts/authenticated-layout';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw redirect({
        to: '/',
        search: { redirect: location.pathname },
      });
    }
  },
  component: AuthenticatedLayout,
});
