import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user, token) => set({ user, token }),

      logout: () => set({ user: null, token: null }),

      isLoggedIn: () => !!get().user,
      isSuperadmin: () => get().user?.role === 'SUPERADMIN',
      isKontributor: () => get().user?.role === 'KONTRIBUTOR',
      isTuris: () => get().user?.role === 'TURIS',
    }),
    {
      name: 'warisan-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
