import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  priceUsdc: string; // raw 6-decimal, snapshotted at add-to-cart time for display only —
  //                      the backend recomputes the authoritative total at checkout.
  quantity: number;
  selectedVariants?: Record<string, string>;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (productId: string, selectedVariants?: Record<string, string>) => void;
  setQuantity: (productId: string, quantity: number, selectedVariants?: Record<string, string>) => void;
  clear: () => void;
}

function sameLine(a: CartItem, productId: string, selectedVariants?: Record<string, string>) {
  return a.productId === productId && JSON.stringify(a.selectedVariants ?? {}) === JSON.stringify(selectedVariants ?? {});
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item.productId, item.selectedVariants));
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item.productId, item.selectedVariants)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        }),
      remove: (productId, selectedVariants) =>
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, productId, selectedVariants)),
        })),
      setQuantity: (productId, quantity, selectedVariants) =>
        set((state) => ({
          items: state.items
            .map((i) => (sameLine(i, productId, selectedVariants) ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "nexa-cart" }
  )
);

export function cartTotalRaw(items: CartItem[]): bigint {
  return items.reduce((sum, i) => sum + BigInt(i.priceUsdc) * BigInt(i.quantity), 0n);
}
