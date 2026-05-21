// localStorage-backed order ledger.
// Order shape mirrors the Gameball Order API payload exactly, so Session 3's
// callGameball() wrapper just passes the record through (plus headers).

import type { Order, CartItem, LineItem } from "./types";
import { LS_KEYS, readJSON, writeJSON } from "./storage";

const VAT_RATE = 0.15;
const FREE_SHIPPING_THRESHOLD = 200;
const STANDARD_SHIPPING = 20;
const EXPRESS_SHIPPING = 40;
const COD_SHIPPING = 30;

export function getAllOrders(): Order[] {
  return readJSON<Order[]>(LS_KEYS.ORDERS, []);
}

function saveAllOrders(orders: Order[]): void {
  writeJSON(LS_KEYS.ORDERS, orders);
}

export function getOrdersByCustomer(customerId: string): Order[] {
  return getAllOrders()
    .filter((o) => o.customerId === customerId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // newest first
}

export function getOrderById(orderId: string): Order | undefined {
  return getAllOrders().find((o) => o.id === orderId);
}

export type PlaceOrderInput = {
  customerId: string;
  items: CartItem[];
  shipping_method: Order["shipping_method"];
  payment_method: Order["payment_method"];
  shipping_address: Order["shipping_address"];
  // Demo override: allow back-dating createdAt for "lapsed customer" personas
  createdAtOverride?: string;
  // Phase 5: SAR equivalent of any VOGAVIP points the customer redeemed at checkout.
  // Subtracted from totalPaid so the stored record matches what they actually paid.
  discountSAR?: number;
};

export function placeOrder(input: PlaceOrderInput): Order {
  const items = input.items;
  if (items.length === 0) throw new Error("السلة فارغة");

  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  const shipping = computeShipping(input.shipping_method, subtotal);
  const tax = Math.round(subtotal * VAT_RATE * 100) / 100;
  const discount = input.discountSAR ?? 0;
  const totalPaid = Math.round((subtotal + shipping + tax - discount) * 100) / 100;

  const lineItems: LineItem[] = items.map((it) => ({
    id: it.sku,
    name: it.nameAr,
    quantity: it.qty,
    price: it.price,
    category: [it.category],
    // Gameball Collection-based campaigns match on this array. Including BOTH
    // the brand slug (Use Case 7) AND the category (Use Case 6 single-category
    // targeting) lets one campaign-builder field do double duty.
    collection: [it.brandSlug, it.category],
    vendor: it.brand,
  }));

  const order: Order = {
    id: generateOrderId(),
    customerId: input.customerId,
    createdAt: input.createdAtOverride ?? new Date().toISOString(),
    currency: "SAR",
    totalPaid,
    subtotal,
    shipping,
    tax,
    discount,
    lineItems,
    shipping_address: input.shipping_address,
    shipping_method: input.shipping_method,
    payment_method: input.payment_method,
  };

  const all = getAllOrders();
  all.push(order);
  saveAllOrders(all);
  return order;
}

export function getLastOrderDate(customerId: string): string | null {
  const orders = getOrdersByCustomer(customerId);
  return orders.length > 0 ? orders[0].createdAt : null;
}

export function getOrderCount(customerId: string): number {
  return getAllOrders().filter((o) => o.customerId === customerId).length;
}

// Demo helper: pre-seed a backdated order for "lapsed" personas
export function seedBackdatedOrder(order: Order): void {
  const all = getAllOrders();
  if (all.some((o) => o.id === order.id)) return;
  all.push(order);
  saveAllOrders(all);
}

function computeShipping(method: Order["shipping_method"], subtotal: number): number {
  if (method === "express") return EXPRESS_SHIPPING;
  if (method === "cod") return COD_SHIPPING;
  // standard
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
}

function generateOrderId(): string {
  const ts = Date.now().toString(36).slice(-6).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `VC-${ts}${rand}`;
}
