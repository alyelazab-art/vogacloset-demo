import Link from "next/link";
import type { Category } from "@/lib/categories";

// Voga's homepage hero is a row of 5 large category tiles (one per top-level
// category). On desktop they sit in a single horizontal row; on mobile they
// wrap into 2 columns. We use real Voga hero imagery downloaded to /public/voga/heroes/.

export function CategoryTile({ category }: { category: Category }) {
  return (
    <Link
      href={category.href}
      className="group relative flex aspect-[3/4] flex-col items-center justify-end overflow-hidden rounded-card bg-bg-soft transition-transform hover:scale-[1.02]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={category.heroImage}
        alt={category.labelAr}
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
      />

      <div className="relative z-10 m-3 w-[calc(100%-1.5rem)] rounded-md bg-white/95 py-3 text-center backdrop-blur-sm">
        <h3 className="text-base font-bold text-text-strong md:text-lg">
          {category.labelAr}
        </h3>
        <p className="mt-0.5 text-xs text-text-muted">تسوّق الآن</p>
      </div>
    </Link>
  );
}
