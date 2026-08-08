import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  username: string;
  token: string;
}

interface AuthStore {
  admin: AdminUser | null;
  login: (username: string, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      admin: null,
      login: (username, token) => set({ admin: { username, token } }),
      logout: () => set({ admin: null }),
      isAuthenticated: () => !!get().admin?.token,
    }),
    { name: 'bak-admin-auth' }
  )
);
