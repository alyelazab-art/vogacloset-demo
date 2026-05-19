// Server-side proxy for Gameball's bots/Balance + bots/PlayerInfo endpoints.
// Fires both in parallel and merges into one tight response so the client
// (header pill, /account tile, Apply Points panel) gets balance + tier in
// a single round trip.
//
// Why two bot endpoints:
//   - bots/Balance returns pointsBalance + pendingPoints + redemptionFactor
//   - bots/PlayerInfo returns the player's current tier (level.name + levelOrder)
//   The widget itself uses both. The v4.0 customer endpoint returns neither.

const GAMEBALL_BOTS_BASE = "https://api.gameball.co/api/v1.0/bots";

type BalanceShape = {
  response?: {
    balance?: { pointsBalance?: number; pendingPoints?: number; pointsValue?: number; currency?: string };
    defaultRedemptionRule?: { redemptionFactor?: number };
  };
  success?: boolean;
};

type PlayerInfoShape = {
  response?: {
    playerInfo?: {
      level?: { name?: string; levelOrder?: number; iconPath?: string };
    };
  };
  success?: boolean;
};

export async function GET(request: Request) {
  const apiKey = process.env.GAMEBALL_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Gameball APIKey not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  if (!customerId) {
    return Response.json({ error: "customerId required" }, { status: 400 });
  }

  const playerQs = `playerUniqueId=${encodeURIComponent(customerId)}&`;
  const balanceReq = fetch(`${GAMEBALL_BOTS_BASE}/Balance?${playerQs}`, {
    method: "GET",
    headers: { apiKey },
    cache: "no-store",
  });
  const playerInfoReq = fetch(`${GAMEBALL_BOTS_BASE}/PlayerInfo?${playerQs}`, {
    method: "GET",
    headers: { apiKey },
    cache: "no-store",
  });

  const [balanceRes, playerInfoRes] = await Promise.all([balanceReq, playerInfoReq]);

  // Balance is required; PlayerInfo is best-effort (tier is a nice-to-have).
  const balanceText = await balanceRes.text();
  let balance: BalanceShape | null = null;
  try {
    balance = JSON.parse(balanceText);
  } catch {
    return Response.json({ error: "Gameball returned non-JSON", raw: balanceText.slice(0, 200) }, { status: 502 });
  }
  if (!balanceRes.ok || !balance?.success) {
    return Response.json(
      { error: "Gameball balance call failed", raw: balance ?? balanceText.slice(0, 200) },
      { status: balanceRes.status || 502 },
    );
  }

  let tier: { name: string; levelOrder: number; iconUrl: string | null } | null = null;
  if (playerInfoRes.ok) {
    try {
      const playerInfo = (await playerInfoRes.json()) as PlayerInfoShape;
      const level = playerInfo?.response?.playerInfo?.level;
      if (level?.name && typeof level.levelOrder === "number") {
        tier = {
          name: level.name,
          levelOrder: level.levelOrder,
          iconUrl: level.iconPath ?? null,
        };
      }
    } catch {
      // PlayerInfo parse failed — leave tier null, client falls back to local
    }
  }

  // Project balance to a tight shape.
  //
  // Gameball's `pointsBalance` is the TOTAL balance (active + pending), not
  // the customer's truly-spendable amount — the widget itself derives
  // "Available" by subtracting pendingPoints. We do the same so the Apply
  // Points panel never offers more than the customer can actually redeem.
  const bal = balance.response?.balance;
  const rule = balance.response?.defaultRedemptionRule;
  const totalPts = bal?.pointsBalance ?? 0;
  const pending = bal?.pendingPoints ?? 0;
  return Response.json({
    activePoints: Math.max(0, totalPts - pending),
    pendingPoints: pending,
    totalPoints: totalPts,
    pointsValueSAR: bal?.pointsValue ?? 0,
    currency: bal?.currency ?? "SAR",
    // redemptionFactor = SAR per 1 point (e.g., 0.01 = 100 pts per 1 SAR)
    redemptionFactor: rule?.redemptionFactor ?? 0.01,
    tier,
  });
}
