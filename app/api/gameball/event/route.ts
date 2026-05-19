// Server-side proxy for Gameball's Track Event API.
// Used to fire custom events that drive automation campaigns where the rule
// can't be expressed in Gameball's native campaign builder — e.g. Use Case #6
// "buy from N distinct categories" (no COUNT(DISTINCT) operator in their UI).
// Keeps GAMEBALL_TRANSACTION_KEY off the browser.

const GAMEBALL_BASE = "https://api.gameball.co/api/v4.0/integrations";

type EventBody = {
  customerId: string;
  eventName: string;
  // Free-form per-event attributes. For category_diversity:
  //   { distinctCategoryCount: 3, orderId: "VC-XYZ" }
  attributes?: Record<string, unknown>;
  // Optional: pass-through for customer attribute updates fired alongside the event
  customerAttributes?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const apiKey = process.env.GAMEBALL_API_KEY;
  const secretKey = process.env.GAMEBALL_TRANSACTION_KEY;
  if (!apiKey || !secretKey) {
    return Response.json({ error: "Gameball keys not configured" }, { status: 500 });
  }

  let body: EventBody;
  try {
    body = (await request.json()) as EventBody;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!body.customerId || !body.eventName) {
    return Response.json(
      { error: "customerId and eventName required" },
      { status: 400 },
    );
  }

  // Gameball v4 events endpoint shape (confirmed via PAYLOAD_ERROR response):
  //   { events: { "<eventName>": { ...attrs } }, customerId, customerAttributes? }
  // NOT playerUniqueId — that's the widget/v1 convention. v4 integrations use customerId.
  const gameballBody = {
    events: {
      [body.eventName]: body.attributes ?? {},
    },
    customerId: body.customerId,
    ...(body.customerAttributes && { customerAttributes: body.customerAttributes }),
  };

  const res = await fetch(`${GAMEBALL_BASE}/events`, {
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
