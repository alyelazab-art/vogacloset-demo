// Shared types for the Voga POC demo state.
// Naming + shape deliberately mirror what the Gameball Order/Customer API
// expects, so Session 3 wiring is a thin adapter, not a refactor.

export type Tier = "blue" | "gold" | "platinum" | "diamond";

export type User = {
  id: string;                // stable customer ID (sent to Gameball as customerId)
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthday?: string;         // ISO yyyy-mm-dd
  createdAt: string;         // ISO timestamp
  tier?: Tier;               // override tier for demo purposes; null = derived later from Gameball
};

export type CartItem = {
  productId: string;         // matches Product.id
  sku: string;               // productId + size + color (for line item uniqueness)
  nameAr: string;
  nameEn: string;
  price: number;             // unit price in SAR
  qty: number;
  size?: string;
  color?: string;
  image?: string;
  category: string;          // for Use Case 6 (cross-category detection)
  brand: string;             // for Use Case 7 (brand campaign)
  brandSlug: string;         // collection slug for Gameball
};

export type LineItem = {
  id: string;                // sku
  name: string;              // nameAr
  quantity: number;
  price: number;
  category: string[];
  collection: string[];      // [brandSlug] — matches Gameball lineItems.collection
  vendor: string;            // brand
};

export type Order = {
  id: string;                // sent to Gameball as orderId
  customerId: string;
  createdAt: string;         // ISO timestamp
  currency: "SAR";
  totalPaid: number;         // grand total after shipping + tax (the number Gameball multiplies)
  subtotal: number;
  shipping: number;
  tax: number;
  lineItems: LineItem[];
  // shipping address (kept for the confirmation page; not sent to Gameball)
  shipping_address?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    district: string;
    address: string;
  };
  shipping_method?: "standard" | "express" | "cod";
  payment_method?: "mada" | "visa" | "applepay" | "tabby" | "tamara" | "cod";
};

// Per-tier earn multiplier — placeholder values matching the VOGAVIP page.
// Used by the demo control panel to preview tier-based behavior before Session 3
// wires the real Gameball tier multiplier.
export const TIER_MULTIPLIER: Record<Tier, number> = {
  blue: 1,
  gold: 1,
  platinum: 2,
  diamond: 3,
};

export const TIER_LABEL_AR: Record<Tier, string> = {
  blue: "أزرق",
  gold: "ذهبي",
  platinum: "بلاتيني",
  diamond: "ماسي",
};

export const TIER_LABEL_EN: Record<Tier, string> = {
  blue: "Blue",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond",
};
