import Link from "next/link";
import { BRANDS } from "@/lib/categories";

// "Favorite Brands" carousel on Voga's homepage. Real brand logos served from
// /public/voga/brands/. Karen Millen is intentionally outlined since it's the
// target brand for the Brand Campaign use case (Use Case 7).

export function BrandCarousel() {
  return (
    <section className="section py-12">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-2xl font-bold text-text-strong">
          ماركاتنا المفضلة
        </h2>
        <Link
          href="/brands"
          className="text-sm font-medium text-primary hover:underline"
        >
          باقي الماركات
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {BRANDS.map((brand) => {
          const isFeatured = brand.slug === "karen-millen";
          return (
            <Link
              key={brand.slug}
              href={`/brand/${brand.slug}`}
              className={`relative flex h-28 w-44 shrink-0 items-center justify-center overflow-hidden rounded-card border bg-white p-4 transition-all hover:border-primary hover:shadow-sm ${
                isFeatured ? "border-primary/40 ring-2 ring-primary/20" : "border-border"
              }`}
              aria-label={brand.nameAr}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.logo}
                alt={brand.nameAr}
                loading="lazy"
                className="max-h-full max-w-full object-contain"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
