import { create } from 'zustand';
import { persist, PersistStorage } from 'zustand/middleware';

interface CartItem {
  id: number;
  name: string;
  price: number;         
  displayPrice?: string; // optional formatted string
  image: string;
  quantity: number;
  meta?: string; // optional metadata like size, color, etc.
}

interface CartStore {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

const useCartStore = create<CartStore, [['zustand/persist', CartStore]]>(
  persist(
    (set) => ({
      cartItems: [],

      addToCart: (product) =>
        set((state) => {
          const existing = state.cartItems.find(item => item.id === product.id);
          if (existing) {
            return {
              cartItems: state.cartItems.map(item =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          } else {
            return {
              cartItems: [...state.cartItems, { ...product, quantity: 1 }],
            };
          }
        }),

      removeFromCart: (id) =>
        set((state) => ({
          cartItems: state.cartItems.filter(item => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cartItems: state.cartItems.map(item =>
            item.id === id ? { ...item, quantity } : item
          ),
        })),

      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
