"use client";

// Cart context — localStorage-backed cart with line items shaped to mirror
// Gameball Order API line items. Session 3 maps these straight to the payload.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "./types";
import { LS_KEYS, readJSON, writeJSON } from "./storage";

type AddInput = Omit<CartItem, "sku"> & { sku?: string };

type CartValue = {
  items: CartItem[];
  ready: boolean;
  count: number;            // total qty across all line items (for header badge)
  subtotal: number;
  addItem: (input: AddInput) => void;
  updateQty: (sku: string, qty: number) => void;
  removeItem: (sku: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // Boot: restore cart from localStorage
  useEffect(() => {
    setItems(readJSON<CartItem[]>(LS_KEYS.CART, []));
    setReady(true);
  }, []);

  // Persist on every change (post-boot)
  useEffect(() => {
    if (!ready) return;
    writeJSON(LS_KEYS.CART, items);
  }, [items, ready]);

  const addItem = useCallback((input: AddInput) => {
    const sku = input.sku ?? buildSku(input);
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.sku === sku);
      if (idx >= 0) {
        // already in cart — bump qty
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + input.qty };
        return next;
      }
      return [...prev, { ...input, sku }];
    });
  }, []);

  const updateQty = useCallback((sku: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((it) => it.sku !== sku);
      return prev.map((it) => (it.sku === sku ? { ...it, qty } : it));
    });
  }, []);

  const removeItem = useCallback((sku: string) => {
    setItems((prev) => prev.filter((it) => it.sku !== sku));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const count = useMemo(() => items.reduce((acc, it) => acc + it.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + it.price * it.qty, 0),
    [items],
  );

  const value = useMemo<CartValue>(
    () => ({ items, ready, count, subtotal, addItem, updateQty, removeItem, clearCart }),
    [items, ready, count, subtotal, addItem, updateQty, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

function buildSku(input: AddInput): string {
  return [input.productId, input.size ?? "_", input.color ?? "_"].join("|");
}
