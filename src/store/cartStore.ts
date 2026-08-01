import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, MenuVariant, MenuItem } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (menuItem: MenuItem, variant: MenuVariant, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQty: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (menuItem, variant, quantity) => {
        const existingId = `${menuItem.id}-${variant.label}`;
        const existing = get().items.find((i) => i.id === existingId);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === existingId ? { ...i, quantity: i.quantity + quantity } : i
            ),
          }));
        } else {
          const newItem: CartItem = {
            id: existingId,
            menuItemId: menuItem.id,
            name: menuItem.name,
            category: menuItem.category,
            variant,
            quantity,
            image: menuItem.image,
          };
          set((state) => ({ items: [...state.items, newItem] }));
        }
      },
      removeItem: (itemId) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== itemId) }));
      },
      updateQty: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
        } else {
          set((state) => ({
            items: state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
          }));
        }
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0),
    }),
    { name: 'bak-cart', partialize: (state) => ({ items: state.items }) as CartStore }
  )
);
