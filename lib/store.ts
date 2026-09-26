import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from './types';

interface CartState {
  cartItems: CartItem[];
  isCartOpen: boolean;
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  
  // Drawer visibility
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Cart animation trigger
  cartPulseTick: number;
  pulseCart: () => void;
  
  // Computed helpers
  getSubtotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isCartOpen: false,

      addItem: (item: CartItem) => {
        set((state) => {
          const existingIndex = state.cartItems.findIndex(
            (i) => i.productId === item.productId && i.size === item.size
          );

          if (existingIndex > -1) {
            const updated = [...state.cartItems];
            updated[existingIndex].quantity += item.quantity;
            return { cartItems: updated, isCartOpen: true };
          }

          return { cartItems: [...state.cartItems, item], isCartOpen: true };
        });
      },

      removeItem: (productId: string, size: string) => {
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => !(item.productId === productId && item.size === size)
          ),
        }));
      },

      updateQuantity: (productId: string, size: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.productId === productId && item.size === size
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ cartItems: [] });
      },

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      cartPulseTick: 0,
      pulseCart: () => set((state) => ({ cartPulseTick: state.cartPulseTick + 1 })),

      getSubtotal: () => {
        return get().cartItems.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().cartItems.reduce((acc, item) => acc + item.quantity, 0);
      },
    }),
    {
      name: 'chhapa-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cartItems: state.cartItems }),
    }
  )
);
