import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/utils/supabase/client';

export function useAuth() {
  const { userId, fetchUserId } = useAuthStore();

  useEffect(() => {
    fetchUserId();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        useAuthStore.setState({ userId: session.user.id });
      } else {
        useAuthStore.setState({ userId: null });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserId]);

  return { userId };
}