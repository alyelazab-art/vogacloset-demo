import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatSAR } from "@/lib/products";

// Voga-style product card. Used by PLP grids, search results, and "popular" rails.
// Placeholder visual is a gradient block with the product emoji — swap for real
// product imagery in a later session.

export function ProductCard({ product }: { product: Product }) {
  const hasSale =
    product.originalPrice !== undefined && product.originalPrice > product.price;
  const discountPct = hasSale
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) * 100,
      )
    : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-white transition-all hover:border-primary hover:shadow-sm"
    >
      {/* Image — real Voga product photo when available, gradient placeholder otherwise */}
      <div
        className={`relative aspect-[3/4] w-full overflow-hidden ${
          product.image ? "bg-bg-soft" : `bg-gradient-to-br ${product.bgGradient ?? ""}`
        }`}
      >
        {product.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.image}
            alt={product.nameAr}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-7xl">
            {product.emoji}
          </span>
        )}

        {hasSale && (
          <span className="absolute top-2 end-2 rounded-md bg-sale px-2 py-0.5 text-xs font-bold text-white">
            -{discountPct}%
          </span>
        )}

        {/* Wishlist visual indicator (no interactivity this session — to be wired later) */}
        <span
          aria-hidden="true"
          className="absolute top-2 start-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-text-muted"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs font-medium text-text-muted">
          {product.brandAr}
        </span>
        <h3 className="line-clamp-2 text-sm font-medium text-text-strong">
          {product.nameAr}
        </h3>

        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span
            className={`text-base font-bold ${hasSale ? "text-sale" : "text-text-strong"}`}
          >
            {formatSAR(product.price)}
          </span>
          {hasSale && (
            <span className="text-xs text-text-subtle line-through">
              {formatSAR(product.originalPrice!)}
            </span>
          )}
        </div>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <span className="text-amber-500">★</span>
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-text-subtle">({product.reviewCount})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
