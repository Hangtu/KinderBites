import { create } from "zustand";

export interface CartProduct {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  imageUrl: string | null;
  category: string;
  ageRange: string | null;
  rating: number | null;
  netWeightG: number | string | null;
  preparation: string | null;
  isOrganic: boolean | null;
  isGlutenFree: boolean | null;
  isNew: boolean | null;
  isAvailable: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CartChild {
  id: string;
  name: string;
}

export interface CartItem {
  id: string;
  product: CartProduct;
  child: CartChild;
  quantity: number;
  specificNotes: string | null;
}

interface CartState {
  items: CartItem[];
  isSubscription: boolean;
  addItem: (
    product: CartProduct,
    child: CartChild,
    quantity?: number,
    notes?: string | null
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setIsSubscription: (value: boolean) => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
}

const generateId = () =>
  `cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isSubscription: true,

  addItem: (product, child, quantity = 1, notes = null) => {
    set((state) => {
      const existing = state.items.findIndex(
        (i) => i.product.id === product.id && i.child.id === child.id
      );
      if (existing >= 0) {
        const next = [...state.items];
        next[existing] = {
          ...next[existing],
          quantity: next[existing].quantity + quantity,
          specificNotes: notes ?? next[existing].specificNotes,
        };
        return { items: next };
      }
      const newItem: CartItem = {
        id: generateId(),
        product,
        child,
        quantity,
        specificNotes: notes,
      };
      return { items: [...state.items, newItem] };
    });
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
    }));
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  setIsSubscription: (value) => set({ isSubscription: value }),

  getSubtotal: () =>
    get().items.reduce(
      (sum, i) => sum + Number(i.product.price) * i.quantity,
      0
    ),

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().isSubscription ? subtotal * 0.15 : 0;
    return subtotal - discount;
  },

  getItemCount: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
