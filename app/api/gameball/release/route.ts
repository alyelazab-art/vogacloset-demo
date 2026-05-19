// Server-side proxy for Gameball's Release Hold API.
// Called when the customer undoes Apply Points, when the cart changes after
// a hold was placed (auto-release), or on checkout unmount (best-effort).
//
// Gameball schema reference: https://docs.gameball.co/api-reference/transactions/hold-management/release
//   Method: DELETE /transactions/hold/{holdReferenceId}
//   No body — holdReferenceId is a path param
//   Required headers: apikey, secretkey
//
// We expose a POST to the client (so we can keep `keepalive: true` semantics on
// unmount), and the proxy translates to Gameball's DELETE.

const GAMEBALL_BASE = "https://api.gameball.co/api/v4.0/integrations";

type ReleaseBody = {
  holdReference: string;
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

  let body: ReleaseBody;
  try {
    body = (await request.json()) as ReleaseBody;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!body.holdReference) {
    return Response.json({ error: "holdReference required" }, { status: 400 });
  }

  const res = await fetch(
    `${GAMEBALL_BASE}/transactions/hold/${encodeURIComponent(body.holdReference)}`,
    {
      method: "DELETE",
      headers: {
        APIKey: apiKey,
        SecretKey: secretKey,
      },
    },
  );

  // Gameball returns 204 No Content on successful release — Response.json() can't
  // build a 204 with a body, so short-circuit to a plain empty response.
  if (res.status === 204) {
    return new Response(null, { status: 204 });
  }

  const text = await res.text();
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }

  return Response.json(payload, { status: res.status });
}
