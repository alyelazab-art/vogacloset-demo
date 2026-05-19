// Server-side proxy for Gameball's Hold Transaction API.
// Used by the checkout "Apply VOGAVIP Points" panel — reserves the points the
// customer wants to redeem so they can't double-spend in parallel sessions.
// Response `holdReference` is then passed into the Order POST to burn the hold.
//
// Pair with /api/gameball/release for the abandon/undo path.
//
// Gameball schema reference: https://docs.gameball.co/api-reference/transactions/hold-management/hold
//   Required body: customerId, transactionTime, and exactly one of
//   { pointsToHold | amountToHold | ruleId }
//   Required headers: apikey, secretkey
//   Response: { customerId, holdAmount, holdEquivalentPoints, holdReference }

const GAMEBALL_BASE = "https://api.gameball.co/api/v4.0/integrations";

type HoldBody = {
  customerId: string;
  points: number; // integer points to reserve (e.g., 500)
};

export async function POST(request: Request) {
  const apiKey = process.env.GAMEBALL_API_KEY;
  const secretKey = process.env.GAMEBALL_TRANSACTION_KEY;
  if (!apiKey || !secretKey) {
    return Response.json(
      { error: "Gameball keys not configured" },
      { status: 500 },
    );
  }

  let body: HoldBody;
  try {
    body = (await request.json()) as HoldBody;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!body.customerId || typeof body.points !== "number" || body.points <= 0) {
    return Response.json(
      { error: "customerId and positive points required" },
      { status: 400 },
    );
  }

  const gameballBody = {
    customerId: body.customerId,
    transactionTime: new Date().toISOString(),
    pointsToHold: Math.floor(body.points),
  };

  const res = await fetch(`${GAMEBALL_BASE}/transactions/hold`, {
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
