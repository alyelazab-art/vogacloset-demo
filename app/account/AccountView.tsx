"use client";

// Account dashboard — auth-aware overview. Shows tier + order count from
// real local state. Tier badge value will pivot to the Gameball read in
// Session 3; the demo control panel still overrides it.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getOrdersByCustomer } from "@/lib/orders-store";
import { formatSAR } from "@/lib/products";
import {
  TIER_LABEL_AR,
  TIER_LABEL_EN,
  TIER_MULTIPLIER,
} from "@/lib/types";
import type { Order, Tier } from "@/lib/types";

const TIER_GRADIENT: Record<Tier, string> = {
  blue: "from-sky-200 to-sky-400",
  gold: "from-amber-200 to-amber-400",
  platinum: "from-slate-300 to-slate-500",
  diamond: "from-purple-300 to-purple-500",
};

export function AccountView() {
  const { user, ready, signOut, gameballProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    setOrders(getOrdersByCustomer(user.id));
  }, [user]);

  if (!ready) {
    return (
      <p className="rounded-card border border-border bg-white p-12 text-center text-sm text-text-muted">
        جاري التحميل...
      </p>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="rounded-card bg-primary-soft p-6">
          <p className="text-sm text-text-muted">أهلًا بعودتك</p>
          <h1 className="mt-1 text-2xl font-bold text-text-strong">
            مرحبًا بك في حسابك
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            سجّلي دخولك لمتابعة طلباتك، نقاط VOGAVIP، والعناوين المحفوظة.
          </p>
          <Link href="/auth" className="mt-4 inline-flex btn-cta">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  // Tier source-of-truth = Gameball (matches widget). Fall back to local
  // persona override only if Gameball hasn't returned yet OR PlayerInfo failed.
  const gbTierName = gameballProfile?.tier?.name?.toLowerCase();
  const tier: Tier =
    gbTierName === "blue" || gbTierName === "gold" || gbTierName === "platinum" || gbTierName === "diamond"
      ? gbTierName
      : (user.tier ?? "blue");
  const lifetimeSpend = orders.reduce((acc, o) => acc + o.totalPaid, 0);
  // Prefer the real Gameball balance; fall back to local estimate while it's loading.
  const localEstimate = Math.floor(lifetimeSpend) * TIER_MULTIPLIER[tier];
  const activePoints = gameballProfile?.activePoints ?? localEstimate;
  const pendingPoints = gameballProfile?.pendingPoints ?? 0;
  const lastOrder = orders[0];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div
        className={`rounded-card bg-gradient-to-bl ${TIER_GRADIENT[tier]} p-6 text-text-strong`}
      >
        <p className="text-sm">أهلًا بعودتك</p>
        <h1 className="mt-1 text-2xl font-black md:text-3xl">
          {user.firstName} {user.lastName}
        </h1>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-sm font-bold backdrop-blur-sm">
          <span>مستوى</span>
          <span className="text-primary">{TIER_LABEL_EN[tier]}</span>
          <span className="text-text-muted">·</span>
          <span>{TIER_LABEL_AR[tier]}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="مستوى VOGAVIP"
          value={TIER_LABEL_EN[tier]}
          hint={`اكسبي ${TIER_MULTIPLIER[tier]}× نقاط على كل طلب`}
        />
        <StatCard
          label="نقاط VOGAVIP الفعالة"
          value={activePoints.toLocaleString("ar-SA")}
          hint={
            pendingPoints > 0
              ? `+ ${pendingPoints.toLocaleString("ar-SA")} نقطة معلّقة`
              : gameballProfile
                ? "محدّث من Gameball"
                : "جاري المزامنة مع Gameball..."
          }
        />
        <StatCard
          label="إجمالي الطلبات"
          value={orders.length.toLocaleString("ar-SA")}
          hint={
            lastOrder
              ? `آخر طلب: ${new Date(lastOrder.createdAt).toLocaleDateString("ar-SA")}`
              : "لا يوجد طلبات بعد"
          }
        />
      </div>

      {/* Recent orders preview */}
      <div className="rounded-card border border-border bg-white p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-text-strong">آخر الطلبات</h2>
          {orders.length > 0 && (
            <Link
              href="/account/orders"
              className="text-xs font-bold text-primary hover:underline"
            >
              عرض الكل ›
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="rounded-md border border-dashed border-border bg-bg-soft py-10 text-center">
            <p className="text-sm text-text-muted">لم تقومي بأي طلب بعد.</p>
            <Link href="/category/women" className="mt-4 inline-flex btn-outline">
              ابدئي التسوق
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {orders.slice(0, 3).map((o) => (
              <li key={o.id} className="flex items-baseline justify-between py-3 first:pt-0">
                <div>
                  <p className="text-sm font-bold text-text-strong">{o.id}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(o.createdAt).toLocaleDateString("ar-SA")} · {o.lineItems.length} منتج
                  </p>
                </div>
                <p className="text-sm font-bold">{formatSAR(o.totalPaid)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* VOGAVIP cross-sell */}
      <div className="rounded-card bg-primary-soft p-6">
        <h3 className="mb-2 text-lg font-bold text-primary">
          مستواك الحالي: {TIER_LABEL_AR[tier]}
        </h3>
        <p className="mb-4 text-sm text-text-muted">
          تعرّفي على كل ميزات مستواك والمستويات الأعلى في صفحة برنامج VOGAVIP.
        </p>
        <Link href="/account/vogavip" className="btn-cta">
          استعرضي البرنامج
        </Link>
      </div>

      {/* Sign out */}
      <div className="text-end">
        <button
          type="button"
          onClick={signOut}
          className="text-xs text-text-muted underline-offset-2 hover:text-sale hover:underline"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-card border border-border bg-white p-4">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-text-strong">{value}</p>
      {hint && <p className="mt-1 text-xs text-text-subtle">{hint}</p>}
    </div>
  );
}
