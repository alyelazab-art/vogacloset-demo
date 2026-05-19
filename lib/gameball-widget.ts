// Client-side wrapper for the Gameball widget SDK (window.GbSdk).
// Handles two cases:
//  - identifyWidget(user) — re-binds the widget to a logged-in player
//  - identifyWidget(null) — flips the widget back to guest mode
//
// Critical race condition we work around:
//   The page-load flow is: inline script defines GbLoadInit → Gameball script
//   loads & calls GbLoadInit → GbSdk.init({}) creates the widget's internal
//   Ractive component asynchronously. If we call initReload BEFORE the
//   Ractive component exists, Gameball's internals throw "Cannot set
//   properties of undefined (setting 'ractive')" and leave the widget in a
//   broken state (bubble renders, clicking opens a blank panel).
//
//   So we wait for window.GbSdk.app.ractive to exist (a reliable signal that
//   init() finished) before calling initReload.
//
//   Note: app.reloadPlayer LOOKS like a lighter alternative but empirically
//   does NOT update settings.playerUniqueId — only initReload actually swaps
//   the player. Stick with initReload.

import type { User } from "./types";

type GbApp = {
  ractive?: unknown;
};

type GbSdkShape = {
  app?: GbApp;
  initReload?: (args: { playerUniqueId: string; playerAttributes: Record<string, unknown> }) => void;
};

declare global {
  interface Window {
    GbSdk?: GbSdkShape;
  }
}

const POLL_INTERVAL_MS = 100;
const MAX_WAIT_MS = 5000;

async function waitForReadyWidget(): Promise<GbSdkShape | null> {
  if (typeof window === "undefined") return null;

  // Both must exist: the SDK AND the inner Ractive component (proves init() finished).
  // Polling for ractive is what guards against the race that throws "Cannot set
  // properties of undefined (setting 'ractive')".
  const isReady = (): GbSdkShape | null => {
    const sdk = window.GbSdk;
    if (!sdk?.app?.ractive || !sdk?.initReload) return null;
    return sdk;
  };

  let ready = isReady();
  if (ready) return ready;

  const deadline = Date.now() + MAX_WAIT_MS;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    ready = isReady();
    if (ready) return ready;
  }
  return null;
}

// Sanitize player attributes — drop undefined values so the widget doesn't
// receive {mobile: undefined} for personas without phone numbers.
function buildPlayerAttributes(user: User): Record<string, unknown> {
  const attrs: Record<string, unknown> = {
    email: user.email,
    displayName: `${user.firstName} ${user.lastName}`.trim(),
  };
  if (user.phone) attrs.mobile = user.phone;
  if (user.birthday) attrs.dateOfBirth = user.birthday;
  return attrs;
}

export async function identifyWidget(user: User | null): Promise<void> {
  const sdk = await waitForReadyWidget();
  if (!sdk?.initReload) {
    console.warn("[gameball-widget] widget not ready after 5s; skipping identify");
    return;
  }

  const args = user
    ? { playerUniqueId: user.id, playerAttributes: buildPlayerAttributes(user) }
    : { playerUniqueId: "", playerAttributes: {} };

  try {
    sdk.initReload(args);
  } catch (err) {
    console.error("[gameball-widget] initReload threw:", err);
  }
}

// Force the widget to re-pull balance + tier from Gameball.
// Use after any action that changes server-side state (orders, refunds, redemptions).
export async function refreshWidget(user: User | null): Promise<void> {
  return identifyWidget(user);
}
