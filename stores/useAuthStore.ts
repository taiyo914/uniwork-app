import { create } from 'zustand';
import { supabase } from '@/utils/supabase/client';

interface AuthState {
  userId: string | null;
  fetchUserId: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  fetchUserId: async () => {
    const state = useAuthStore.getState();
    
    if (state.userId) return;

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error fetching user:', error);
      set({ userId: null });
      return;
    }
    
    set({ userId: user?.id ?? null });
  },
}));