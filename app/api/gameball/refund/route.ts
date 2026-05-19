// Server-side proxy for the Gameball Refund Transaction API.
// Used by the demo control panel to undo a previously-applied demo action
// (tier-bump or fast-forward) by refunding the order that backed it.

const GAMEBALL_BASE = "https://api.gameball.co/api/v4.0/integrations";

type RefundBody = {
  customerId: string;
  reverseOrderId: string;   // the orderId we want to refund
  refundAmount: number;     // SAR
  originalTransactionTime?: string; // ISO timestamp of the original order
};

export async function POST(request: Request) {
  const apiKey = process.env.GAMEBALL_API_KEY;
  const secretKey = process.env.GAMEBALL_TRANSACTION_KEY;
  if (!apiKey || !secretKey) {
    return Response.json({ error: "Gameball keys not configured" }, { status: 500 });
  }

  let body: RefundBody;
  try {
    body = (await request.json()) as RefundBody;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!body.customerId || !body.reverseOrderId) {
    return Response.json(
      { error: "customerId and reverseOrderId required" },
      { status: 400 },
    );
  }

  // Gameball caps refundTransactionId at 50 chars — short timestamp + rand suffix
  const shortRefundId = `RFD-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const gameballBody = {
    customerId: body.customerId,
    refundTransactionId: shortRefundId,
    reverseTransactionId: body.reverseOrderId,
    transactionTime: body.originalTransactionTime ?? new Date().toISOString(),
    refundAmount: body.refundAmount,
  };

  const res = await fetch(`${GAMEBALL_BASE}/transactions/refund`, {
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
