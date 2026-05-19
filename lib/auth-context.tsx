"use client";

// Auth context — fake auth backed by localStorage.
// Phase 2: on every auth-state change, pushes the player to Gameball
// (backend Customer API, idempotent upsert) AND re-identifies the widget
// (window.GbSdk.initReload). Signout flips the widget back to guest mode.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Tier, User } from "./types";
import {
  createCustomer,
  getCustomerById,
  getAllCustomers,
  verifyCredentials,
  updateCustomer,
  type SignUpInput,
} from "./customers-store";
import { DEMO_CUSTOMERS, DEMO_PASSWORD } from "./demo-customers";
import { seedBackdatedOrder } from "./orders-store";
import { LS_KEYS, readJSON, writeJSON, removeKey } from "./storage";
import { identifyWidget } from "./gameball-widget";

type Session = { userId: string } | null;

export type GameballProfile = {
  activePoints: number;   // truly-spendable (Gameball total - pending)
  pendingPoints: number;
  totalPoints: number;    // raw pointsBalance from Gameball (active + pending)
  pointsValueSAR: number;
  currency: string;
  redemptionFactor: number;
  // Tier sourced from Gameball's bots/PlayerInfo. The widget's tier card uses this.
  // Null if PlayerInfo wasn't reachable or didn't return level info — clients
  // fall back to the local user.tier in that case.
  tier: { name: string; levelOrder: number; iconUrl: string | null } | null;
};

type AuthValue = {
  user: User | null;
  ready: boolean;
  gameballProfile: GameballProfile | null;
  refreshGameballProfile: () => Promise<void>;
  signUp: (input: SignUpInput) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => void;
  setTierOverride: (tier: Tier) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [gameballProfile, setGameballProfile] = useState<GameballProfile | null>(null);
  // Track the last user.id we synced to Gameball so we don't double-fire on
  // every render (e.g., when setTierOverride updates user without identity change).
  const lastSyncedIdRef = useRef<string | null>(null);

  const refreshGameballProfile = useCallback(async () => {
    if (!user) {
      setGameballProfile(null);
      return;
    }
    try {
      const res = await fetch(`/api/gameball/balance?customerId=${encodeURIComponent(user.id)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const profile = (await res.json()) as GameballProfile;
      setGameballProfile(profile);
    } catch (err) {
      console.warn("[gameball] balance fetch failed:", err);
    }
  }, [user]);

  // Boot: seed demo customers (idempotent), then restore session.
  useEffect(() => {
    seedDemoCustomersIfMissing();
    const session = readJSON<Session>(LS_KEYS.SESSION, null);
    if (session?.userId) {
      const rec = getCustomerById(session.userId);
      if (rec) setUser(rec.user);
      else removeKey(LS_KEYS.SESSION); // stale session
    }
    setReady(true);
  }, []);

  // Sync auth state to Gameball: fire Customer API + widget identify on
  // every user-identity change. Idempotent — same user.id won't re-fire.
  useEffect(() => {
    if (!ready) return;
    const currentId = user?.id ?? null;
    if (currentId === lastSyncedIdRef.current) return;
    lastSyncedIdRef.current = currentId;

    if (user) {
      // Fire backend Customer API (upsert) — fire-and-forget, errors logged.
      fetch("/api/gameball/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          mobile: user.phone,
          dateOfBirth: user.birthday,
        }),
      }).catch((err) => {
        console.warn("[gameball] customer upsert failed:", err);
      });
      identifyWidget(user);
      // Initial balance fetch — populates header pill + /account tile.
      // Customer upsert may need a moment server-side; small delay reduces miss rate.
      setTimeout(() => refreshGameballProfile(), 400);
    } else {
      // Signed out — flip widget back to guest mode + clear cached balance.
      identifyWidget(null);
      setGameballProfile(null);
    }
  }, [user, ready, refreshGameballProfile]);

  const signUp = useCallback(async (input: SignUpInput) => {
    const rec = createCustomer(input);
    writeJSON<Session>(LS_KEYS.SESSION, { userId: rec.user.id });
    setUser(rec.user);
    return rec.user;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const rec = verifyCredentials(email, password);
    if (!rec) throw new Error("البريد أو كلمة المرور غير صحيحة");
    writeJSON<Session>(LS_KEYS.SESSION, { userId: rec.user.id });
    setUser(rec.user);
    return rec.user;
  }, []);

  const signOut = useCallback(() => {
    removeKey(LS_KEYS.SESSION);
    setUser(null);
  }, []);

  const setTierOverride = useCallback(
    (tier: Tier) => {
      if (!user) return;
      const updated = updateCustomer(user.id, { tier });
      if (updated) setUser(updated);
    },
    [user],
  );

  const value = useMemo<AuthValue>(
    () => ({ user, ready, gameballProfile, refreshGameballProfile, signUp, signIn, signOut, setTierOverride }),
    [user, ready, gameballProfile, refreshGameballProfile, signUp, signIn, signOut, setTierOverride],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// Seed pre-built demo accounts on first boot. Re-seeding is safe — createCustomer
// throws on duplicate email, so we check first.
function seedDemoCustomersIfMissing(): void {
  const existing = new Set(getAllCustomers().map((r) => r.user.email.toLowerCase()));
  for (const seed of DEMO_CUSTOMERS) {
    if (existing.has(seed.email.toLowerCase())) continue;
    try {
      const rec = createCustomer({
        id: seed.id,
        firstName: seed.firstName,
        lastName: seed.lastName,
        email: seed.email,
        password: DEMO_PASSWORD,
        birthday: seed.birthday,
        tier: seed.tier,
      });
      // Seed back-dated orders for the persona
      if (seed.seedOrders) {
        for (const so of seed.seedOrders) {
          const createdAt = new Date(Date.now() - so.daysAgo * 86400000).toISOString();
          seedBackdatedOrder({
            id: `SEED-${rec.user.id.slice(-4)}-${so.daysAgo}`,
            customerId: rec.user.id,
            createdAt,
            currency: "SAR",
            totalPaid: so.totalPaid,
            subtotal: so.totalPaid,
            shipping: 0,
            tax: 0,
            lineItems: [
              {
                id: `seed-${so.daysAgo}`,
                name: "طلب سابق (Seed)",
                quantity: 1,
                price: so.totalPaid,
                category: ["women"],
                collection: ["seed"],
                vendor: "Seed",
              },
            ],
          });
        }
      }
    } catch {
      /* duplicate or other error — skip */
    }
  }
}
