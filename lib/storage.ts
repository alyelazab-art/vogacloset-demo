// SSR-safe localStorage helpers. Always guard `window` access.

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or disabled — ignore */
  }
}

export function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const LS_KEYS = {
  CUSTOMERS: "voga.customers",   // CustomerRecord[]
  SESSION: "voga.session",       // { userId } | null
  CART: "voga.cart",             // CartItem[]
  ORDERS: "voga.orders",         // Order[]
  DEMO: "voga.demo",             // DemoOverrides (legacy, unused after 2.5c)
  DEMO_ACTIONS: "voga.demo.actions", // DemoAction[] — Gameball-side demo state log for undo
} as const;
