import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  darkMode: boolean;
  highContrast: boolean;
  cartSheetOpen: boolean;
  toggleDarkMode: () => void;
  toggleHighContrast: () => void;
  setCartSheetOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      darkMode: false,
      highContrast: false,
      cartSheetOpen: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
      setCartSheetOpen: (open) => set({ cartSheetOpen: open }),
    }),
    {
      name: 'bak-ui',
      partialize: (state) =>
        ({ darkMode: state.darkMode, highContrast: state.highContrast }) as UIStore,
    }
  )
);
