// Server-side proxy for the Gameball Create/Update Customer API.
// Keeps GAMEBALL_TRANSACTION_KEY off the browser. POST is idempotent on
// playerUniqueId — same body twice is fine (upsert).

const GAMEBALL_BASE = "https://api.gameball.co/api/v4.0/integrations";

type ClientBody = {
  customerId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  dateOfBirth?: string;
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

  let body: ClientBody;
  try {
    body = (await request.json()) as ClientBody;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!body.customerId) {
    return Response.json({ error: "customerId required" }, { status: 400 });
  }

  // Schema: top-level is `customerId`; profile fields nest under `customerAttributes`.
  // See https://docs.gameball.co/api-reference/customers/management/create-customer
  const gameballBody = {
    customerId: body.customerId,
    email: body.email,
    mobile: body.mobile,
    customerAttributes: {
      firstName: body.firstName,
      lastName: body.lastName,
      displayName: [body.firstName, body.lastName].filter(Boolean).join(" ").trim() || undefined,
      email: body.email,
      mobile: body.mobile,
      dateOfBirth: body.dateOfBirth,
    },
  };

  const res = await fetch(`${GAMEBALL_BASE}/customers`, {
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
