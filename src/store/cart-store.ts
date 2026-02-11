import { create } from "zustand";

export interface CartProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  age_range: string | null;
  rating: number | null;
  net_weight_g: number | null;
  preparation: string | null;
  is_organic: boolean;
  is_gluten_free: boolean;
  is_new: boolean;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
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
  specific_notes: string | null;
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
          specific_notes: notes ?? next[existing].specific_notes,
        };
        return { items: next };
      }
      const newItem: CartItem = {
        id: generateId(),
        product,
        child,
        quantity,
        specific_notes: notes,
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
