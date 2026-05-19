"use client";

// Header right-side icon cluster — Client Component so it can subscribe to
// auth + cart contexts. Renders:
//   • account icon (with greeting when logged in)
//   • wishlist icon (visual only)
//   • cart icon with live count badge

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { TIER_LABEL_AR } from "@/lib/types";
import type { Tier } from "@/lib/types";

export function HeaderActions() {
  const { user, gameballProfile } = useAuth();
  const { count } = useCart();

  // Tier source-of-truth = Gameball. Fall back to local override during the
  // brief window before bots/PlayerInfo responds (or if it fails entirely).
  const gbTierName = gameballProfile?.tier?.name?.toLowerCase();
  const displayTier: Tier | undefined =
    gbTierName === "blue" || gbTierName === "gold" || gbTierName === "platinum" || gbTierName === "diamond"
      ? gbTierName
      : user?.tier;

  return (
    <nav className="ms-auto flex items-center gap-1 md:gap-2">
      {user && (
        <Link
          href="/account"
          className="hidden items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/15 md:flex"
          aria-label={`نقاط VOGAVIP: ${gameballProfile?.activePoints ?? 0}`}
          title="نقاط VOGAVIP الفعالة"
        >
          <span>⭐</span>
          <span>{(gameballProfile?.activePoints ?? 0).toLocaleString("ar-SA")}</span>
        </Link>
      )}
      <Link
        href="/account"
        className="flex items-center gap-1.5 rounded-md p-2 text-sm hover:bg-bg-soft"
        aria-label="حسابي"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
        </svg>
        <span className="hidden md:inline">
          {user ? `أهلًا، ${user.firstName}` : "حسابي"}
        </span>
        {displayTier && (
          <span className="hidden rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary md:inline">
            {TIER_LABEL_AR[displayTier]}
          </span>
        )}
      </Link>

      <Link
        href="/account?tab=wishlist"
        className="flex items-center rounded-md p-2 text-sm hover:bg-bg-soft"
        aria-label="المفضلة"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </Link>

      <Link
        href="/cart"
        className="relative flex items-center gap-1.5 rounded-md p-2 text-sm hover:bg-bg-soft"
        aria-label="السلة"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        <span className="hidden md:inline">السلة</span>
        {count > 0 && (
          <span className="absolute -top-1 -end-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </Link>
    </nav>
  );
}
