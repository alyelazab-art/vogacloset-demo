// Server-side proxy for Gameball's Calculate Order Cashback API.
// Same payload shape as Order Tracking but doesn't commit anything — just
// returns what the customer WOULD earn if this order were placed right now.
// Used by LoyaltyTease to show an accurate "you'll earn X points" preview
// on the product page, cart, and checkout summary.
//
// Schema reference: https://docs.gameball.co/api-reference/order/calculate-order-cashback

const GAMEBALL_BASE = "https://api.gameball.co/api/v4.0/integrations";

type LineItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category?: string[];
  collection?: string[];
  vendor?: string;
};

type CashbackBody = {
  customerId?: string;
  totalPaid: number;
  // Order-level breakdowns. Same convention as /api/gameball/order — pass them
  // through so Gameball can reconcile and apply per-line rules accurately.
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  currency?: string;
  lineItems?: LineItem[];
};

export async function POST(request: Request) {
  const apiKey = process.env.GAMEBALL_API_KEY;
  const secretKey = process.env.GAMEBALL_TRANSACTION_KEY;
  if (!apiKey || !secretKey) {
    return Response.json({ error: "Gameball keys not configured" }, { status: 500 });
  }

  let body: CashbackBody;
  try {
    body = (await request.json()) as CashbackBody;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (typeof body.totalPaid !== "number") {
    return Response.json({ error: "totalPaid required" }, { status: 400 });
  }

  const subtotal = body.subtotal ?? 0;
  const shipping = body.shipping ?? 0;
  const tax = body.tax ?? 0;
  const discount = body.discount ?? 0;
  const totalPrice = Math.round((subtotal + shipping + tax) * 100) / 100;

  // Map our shape → Gameball's expected schema. Pro-rated per-line tax math
  // mirrors /api/gameball/order so the preview matches what the order will
  // actually post.
  const gameballBody = {
    ...(body.customerId && { customerId: body.customerId }),
    totalPaid: body.totalPaid,
    totalPrice,
    totalShipping: shipping,
    totalTax: tax,
    totalDiscount: discount,
    currency: body.currency ?? "SAR",
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
  };

  const res = await fetch(`${GAMEBALL_BASE}/orders/cashback`, {
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
