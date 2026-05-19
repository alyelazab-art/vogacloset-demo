"use client";

// Tier-aware "you'll earn X points" promo card.
// Signed-in customer sees their tier multiplier applied (e.g., Diamond 3× = 2,118 pts).
// Guest sees the base earn rate + a soft push to sign up for the multiplier.
//
// Math is local (TIER_MULTIPLIER from lib/types). Matches what Gameball returns
// per Phase 3 verification (Diamond placed a 706 SAR order → 2,118 pts).

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { TIER_MULTIPLIER, TIER_LABEL_EN } from "@/lib/types";

type Props = {
  price: number;
  // when true, render an inline compact variant for cart/checkout summary
  compact?: boolean;
};

export function LoyaltyTease({ price, compact = false }: Props) {
  const { user } = useAuth();
  const tier = user?.tier;
  const multiplier = tier ? TIER_MULTIPLIER[tier] : 1;
  const pts = Math.floor(price * multiplier);
  const showMultiplierBadge = multiplier > 1;

  if (compact) {
    return (
      <p className="text-xs">
        <span className="font-bold text-primary">
          ستكسبين {pts.toLocaleString("ar-SA")} نقطة VOGAVIP
        </span>{" "}
        {showMultiplierBadge ? (
          <span className="text-text-muted">
            ({multiplier}× {TIER_LABEL_EN[tier!]})
          </span>
        ) : !user ? (
          <span className="text-text-muted">— انضمي للحصول على مضاعفات</span>
        ) : null}
      </p>
    );
  }

  return (
    <div className="rounded-card bg-primary-soft p-4 text-sm">
      <div className="flex items-start gap-2">
        <span className="text-lg">⭐</span>
        <div>
          <p className="font-bold text-primary">
            اربح {pts.toLocaleString("ar-SA")} نقطة فوغاVIP عند الشراء
            {showMultiplierBadge && (
              <span className="ms-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-white">
                {multiplier}× {TIER_LABEL_EN[tier!]}
              </span>
            )}
          </p>
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
