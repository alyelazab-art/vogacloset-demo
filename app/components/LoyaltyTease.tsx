"use client";

// Tier-aware "you'll earn X points" promo card.
//
// For signed-in users: fires Gameball's Calculate Order Cashback API
// (POST /api/gameball/cashback) so the displayed number matches what
// the order will actually award — including campaign multipliers,
// shipping/tax earning, and tier rates as configured in the dashboard.
//
// Renders the local estimate (price × TIER_MULTIPLIER) immediately to
// avoid layout shift, then upgrades to the API value when it arrives.
// On API error or guest user, keeps the local estimate.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { TIER_MULTIPLIER, TIER_LABEL_EN } from "@/lib/types";
import type { CartItem } from "@/lib/types";
import type { Product } from "@/lib/products";

type Props =
  | { product: Product; compact?: boolean }
  | {
      items: CartItem[];
      subtotal: number;
      shipping?: number;
      tax?: number;
      discount?: number;
      compact?: boolean;
    };

type CashbackResponse = {
  totalPoints?: number;
  lineItems?: Array<{
    campaignName?: string;
    campaignImpactPoints?: number;
  }>;
};

const DEBOUNCE_MS = 250;
const TIMEOUT_MS = 3000;

export function LoyaltyTease(props: Props) {
  const { user } = useAuth();
  const compact = props.compact ?? false;

  // Build the cashback payload + the local-estimate price from the discriminated props.
  const { localPrice, payload } = useMemo(
    () => buildPayloadAndLocalPrice(props, user?.id),
    [props, user?.id],
  );

  const tier = user?.tier;
  const multiplier = tier ? TIER_MULTIPLIER[tier] : 1;
  const localPts = Math.floor(localPrice * multiplier);
  const showMultiplierBadge = multiplier > 1;

  // API-driven preview state. `apiPts === null` = haven't loaded yet / failed.
  const [apiPts, setApiPts] = useState<number | null>(null);
  const [campaignName, setCampaignName] = useState<string | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    // Guests don't get a personalized preview (Gameball needs customerId
    // for tier-based math). Keep local estimate + the "join VOGAVIP" copy.
    if (!user) {
      setApiPts(null);
      setCampaignName(null);
      return;
    }

    // Debounce + abort-on-supersession: only the latest payload's response wins.
    const myReqId = ++reqIdRef.current;
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    const fetchId = setTimeout(async () => {
      try {
        const res = await fetch("/api/gameball/cashback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: ctrl.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as CashbackResponse;
        if (myReqId !== reqIdRef.current) return; // superseded by newer request
        if (typeof data.totalPoints === "number") {
          setApiPts(Math.floor(data.totalPoints));
        }
        const firstCampaign = data.lineItems?.find(
          (li) => li.campaignName && (li.campaignImpactPoints ?? 0) > 0,
        )?.campaignName;
        setCampaignName(firstCampaign ?? null);
      } catch {
        // Network error / abort / timeout — keep local estimate, fail silent.
      } finally {
        clearTimeout(timeoutId);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(fetchId);
      clearTimeout(timeoutId);
      ctrl.abort();
    };
  }, [user, payload]);

  const displayPts = apiPts ?? localPts;

  if (compact) {
    return (
      <div className="text-xs">
        <p>
          <span className="font-bold text-primary">
            ستكسبين {displayPts.toLocaleString("ar-SA")} نقطة VOGAVIP
          </span>{" "}
          {showMultiplierBadge ? (
            <span className="text-text-muted">
              ({multiplier}× {TIER_LABEL_EN[tier!]})
            </span>
          ) : !user ? (
            <span className="text-text-muted">— انضمي للحصول على مضاعفات</span>
          ) : null}
        </p>
        {campaignName && (
          <p className="mt-0.5 text-[10px] text-primary/80">عبر حملة: {campaignName}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-card bg-primary-soft p-4 text-sm">
      <div className="flex items-start gap-2">
        <span className="text-lg">⭐</span>
        <div>
          <p className="font-bold text-primary">
            اربح {displayPts.toLocaleString("ar-SA")} نقطة فوغاVIP عند الشراء
            {showMultiplierBadge && (
              <span className="ms-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-white">
                {multiplier}× {TIER_LABEL_EN[tier!]}
              </span>
            )}
          </p>
          {campaignName && (
            <p className="mt-1 text-xs text-primary">عبر حملة: {campaignName}</p>
          )}
          {user ? (
            showMultiplierBadge ? (
              <p className="mt-1 text-xs text-text-muted">
                مستوى {TIER_LABEL_EN[tier!]} يضاعف نقاطك {multiplier}× على كل طلب
              </p>
            ) : (
              <p className="mt-1 text-xs text-text-muted">
                ارفعي مستواكي للحصول على مضاعفات النقاط
              </p>
            )
          ) : (
            <p className="mt-1 text-xs text-text-muted">
              انضمي إلى{" "}
              <Link href="/account/vogavip" className="font-medium text-primary underline">
                برنامج VOGAVIP
              </Link>{" "}
              واحصلي على مضاعفات حسب مستواكي
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Build the cashback payload and the local-estimate price from either prop shape.
function buildPayloadAndLocalPrice(props: Props, customerId: string | undefined) {
  if ("product" in props) {
    const p = props.product;
    const payload = {
      ...(customerId && { customerId }),
      totalPaid: p.price,
      subtotal: p.price,
      shipping: 0,
      tax: 0,
      discount: 0,
      currency: "SAR",
      lineItems: [
        {
          id: p.id,
          name: p.nameAr,
          quantity: 1,
          price: p.price,
          category: [p.category],
          collection: [p.brandSlug, p.category],
          vendor: p.brand,
        },
      ],
    };
    return { localPrice: p.price, payload };
  }

  const subtotal = props.subtotal;
  const shipping = props.shipping ?? 0;
  const tax = props.tax ?? 0;
  const discount = props.discount ?? 0;
  const totalPaid =
    Math.round((subtotal + shipping + tax - discount) * 100) / 100;

  const payload = {
    ...(customerId && { customerId }),
    totalPaid,
    subtotal,
    shipping,
    tax,
    discount,
    currency: "SAR",
    lineItems: props.items.map((it) => ({
      id: it.sku,
      name: it.nameAr,
      quantity: it.qty,
      price: it.price,
      category: [it.category],
      collection: [it.brandSlug, it.category],
      vendor: it.brand,
    })),
  };
  // Local estimate compares against totalPaid (matches what the old prop "total" was).
  return { localPrice: totalPaid, payload };
}
