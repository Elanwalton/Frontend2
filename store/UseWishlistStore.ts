import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface WishlistStore {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  clearWishlist: () => void;
}

const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlistItems: [],

      addToWishlist: (product) =>
        set((state) => {
          const existing = state.wishlistItems.find(item => item.id === product.id);
          if (!existing) {
            return {
              wishlistItems: [...state.wishlistItems, product],
            };
          }
          return state;
        }),

      removeFromWishlist: (id) =>
        set((state) => ({
          wishlistItems: state.wishlistItems.filter(item => item.id !== id),
        })),

      isInWishlist: (id) => {
        return get().wishlistItems.some(item => item.id === id);
      },

      clearWishlist: () => set({ wishlistItems: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);

export default useWishlistStore;