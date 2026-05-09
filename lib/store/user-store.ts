import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  status: string;
  twoFactorEnabled: boolean;
}

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  clearUser: () => void;
}

/**
 * Global User Store
 * Manages synchronized user state across the entire application.
 * Persists to localStorage to prevent flashes on reload.
 */
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "maand-user-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
