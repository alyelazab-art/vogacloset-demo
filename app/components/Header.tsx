import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { HeaderActions } from "./HeaderActions";

// Voga Closet header.
// Structure mirrors vogacloset.com/saudi/ar/:
//   1) Top promo strip — small announcement bar (purple-tinted background)
//   2) Main header — logo (right in RTL), search bar (center), icons (left)
//   3) Nav strip — 5 top-level categories
// Built as a server component; no client interactivity yet (search form
// posts to /search, which we don't implement this session — visual only).

export function Header() {
  return (
    <header className="border-b border-border bg-white">
      {/* Top promo strip */}
      <div className="bg-primary-soft text-text">
        <div className="section flex h-9 items-center justify-between text-xs">
          <span className="hidden md:inline">
            شحن مجاني للطلبات فوق 200 ر.س
          </span>
          <span className="md:hidden">شحن مجاني فوق 200 ر.س</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:underline">
              English
            </Link>
            <span className="text-text-subtle">|</span>
            <Link href="/account/vogavip" className="font-medium hover:underline">
              VOGAVIP
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="section flex h-16 items-center gap-4 md:h-20 md:gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="Voga Closet">
          <span className="text-2xl font-black tracking-tight text-text md:text-3xl">
            VOGA<span className="text-primary">CLOSET</span>
          </span>
        </Link>

        {/* Search */}
        <form
          action="/search"
          role="search"
          className="hidden flex-1 md:flex"
        >
          <div className="relative w-full">
            <input
              type="search"
              name="q"
              placeholder="ابحث عن منتج أو ماركة..."
              className="h-11 w-full rounded-md border border-border bg-bg-soft pe-4 ps-11 text-sm outline-none transition-colors placeholder:text-text-subtle focus:border-primary focus:bg-white"
            />
            {/* search icon */}
            <svg
              className="pointer-events-none absolute inset-y-0 end-3 my-auto h-5 w-5 text-text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </form>

        {/* Right-side icon cluster (visually left in RTL) — interactive */}
        <HeaderActions />
      </div>

      {/* Mobile search (below header on small screens) */}
      <div className="section pb-3 md:hidden">
        <form action="/search" role="search">
          <input
            type="search"
            name="q"
            placeholder="ابحث..."
            className="h-10 w-full rounded-md border border-border bg-bg-soft px-4 text-sm outline-none placeholder:text-text-subtle focus:border-primary focus:bg-white"
          />
        </form>
      </div>

      {/* Category nav strip */}
      <nav
        className="border-t border-border-soft"
        aria-label="التصنيفات الرئيسية"
      >
        <ul className="section flex items-center gap-1 overflow-x-auto py-2 text-sm font-medium md:gap-2 md:py-3 md:text-base">
          {CATEGORIES.map((cat) => (
            <li key={cat.slug} className="shrink-0">
              <Link
                href={cat.href}
                className="rounded-full px-3 py-1.5 text-text-strong transition-colors hover:bg-primary-soft hover:text-primary md:px-4 md:py-2"
              >
                {cat.labelAr}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
