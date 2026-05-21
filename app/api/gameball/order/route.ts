// Server-side proxy for the Gameball Order Tracking API.
// Used by both Phase 2.5 (demo control panel — backdated tier-bump + instant-activate
// fast-forward orders) and Phase 3 (real checkout orders).
// Keeps GAMEBALL_TRANSACTION_KEY off the browser.

const GAMEBALL_BASE = "https://api.gameball.co/api/v4.0/integrations";

// Our internal line-item shape (matches lib/types.ts LineItem)
type LineItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category?: string[];
  collection?: string[];
  vendor?: string;
};

type OrderBody = {
  customerId: string;
  orderId: string;
  totalPaid: number;
  // Order-level breakdowns. Gameball reconciles totalPrice = subtotal + shipping + tax
  // against totalPaid + totalDiscount; per-line `taxes` and `discount` make line-item
  // math reconcile too. Without these, Gameball falls back to summing lineItems[].price
  // as the rewardable amount — which under-counts the order.
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  currency?: string;
  // Callers can pass either createdAt (our convention) or orderDate (Gameball's name)
  createdAt?: string;
  orderDate?: string;
  cashbackConfigurations?: { returnWindow?: number };
  lineItems?: LineItem[];
  // Phase 5: when the customer redeemed points via the Apply Points panel,
  // the checkout has a holdReference from /api/gameball/hold. Passing it here
  // tells Gameball to atomically burn the held points alongside recording the order.
  holdReference?: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.GAMEBALL_API_KEY;
  const secretKey = process.env.GAMEBALL_TRANSACTION_KEY;
  if (!apiKey || !secretKey) {
    return Response.json({ error: "Gameball keys not configured" }, { status: 500 });
  }

  let body: OrderBody;
  try {
    body = (await request.json()) as OrderBody;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!body.customerId || !body.orderId || typeof body.totalPaid !== "number") {
    return Response.json(
      { error: "customerId, orderId, and totalPaid required" },
      { status: 400 },
    );
  }

  // Map our shape → Gameball's expected schema.
  // - createdAt → orderDate (required)
  // - lineItems[].id → sku, .name → title (Gameball field names)
  // - subtotal+shipping+tax → totalPrice (gross before discount), shipping → totalShipping,
  //   tax → totalTax, discount → totalDiscount. Per-line tax is pro-rated by the line's
  //   share of subtotal (demo has uniform 15% VAT so the split is exact).
  const subtotal = body.subtotal ?? 0;
  const shipping = body.shipping ?? 0;
  const tax = body.tax ?? 0;
  const discount = body.discount ?? 0;
  const totalPrice = Math.round((subtotal + shipping + tax) * 100) / 100;

  const gameballBody = {
    customerId: body.customerId,
    orderId: body.orderId,
    orderDate: body.orderDate ?? body.createdAt ?? new Date().toISOString(),
    totalPaid: body.totalPaid,
    totalPrice,
    totalShipping: shipping,
    totalTax: tax,
    totalDiscount: discount,
    currency: body.currency ?? "SAR",
    cashbackConfigurations: body.cashbackConfigurations,
    lineItems: body.lineItems?.map((li) => {
      const lineSubtotal = li.price * li.quantity;
      const lineTax =
        subtotal > 0 ? Math.round((lineSubtotal / subtotal) * tax * 100) / 100 : 0;
      return {
        sku: li.id,
        productId: li.id,
        title: li.name,
        quantity: li.quantity,
        price: li.price,
        taxes: lineTax,
        discount: 0,
        category: li.category,
        collection: li.collection,
        vendor: li.vendor,
      };
    }),
    // Gameball nests the hold-burn pointer inside `redemption.pointsHoldReference`
    // (NOT a top-level holdReference). Their docs confirm this is the only way to
    // tell the order to consume a pre-placed hold.
    ...(body.holdReference && {
      redemption: { pointsHoldReference: body.holdReference },
    }),
  };

  const res = await fetch(`${GAMEBALL_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      APIKey: apiKey,
      SecretKey: secretKey,
    },
    body: JSON.stringify(gameballBody),
  });

  const text = await res.text();
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }

  return Response.json(payload, { status: res.status });
}
