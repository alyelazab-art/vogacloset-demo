import { notFound } from "next/navigation";
import Link from "next/link";
import { productBySlug, PRODUCTS, formatSAR } from "@/lib/products";
import { ProductCard } from "@/app/components/ProductCard";
import { ProductActions } from "@/app/components/ProductActions";
import { LoyaltyTease } from "@/app/components/LoyaltyTease";

// Voga-style Product Detail Page (PDP).
// URL: /product/<slug>. Renders gallery, title/brand, price, size selector,
// color selector, add-to-cart, description, and a "you may also like" rail.
// Add-to-cart is wired in a later session — currently visual only.

type Params = Promise<{ slug: string }>;

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  const hasSale =
    product.originalPrice !== undefined && product.originalPrice > product.price;
  const discountPct = hasSale
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  // Recommend up to 4 other products from the same category.
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 4);

  return (
    <>
      {/* Breadcrumb */}
      <div className="section pt-4 pb-2">
        <nav className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-primary">
            الرئيسية
          </Link>
          <span>›</span>
          <Link href={`/category/${product.category}`} className="hover:text-primary">
            {categoryLabel(product.category)}
          </Link>
          <span>›</span>
          <span className="text-text-strong line-clamp-1">{product.nameAr}</span>
        </nav>
      </div>

      {/* Two-column layout: gallery + details */}
      <section className="section grid gap-6 pb-12 md:grid-cols-2 md:gap-10">
        {/* Gallery (single image this session — full carousel later) */}
        <div className="space-y-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded-card bg-bg-soft">
            {product.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.image}
                alt={product.nameAr}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span
                className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${product.bgGradient ?? ""} text-9xl`}
              >
                {product.emoji}
              </span>
            )}

            {hasSale && (
              <span className="absolute top-3 end-3 rounded-md bg-sale px-2.5 py-1 text-sm font-bold text-white">
                -{discountPct}%
              </span>
            )}
          </div>

          {/* Thumbnail strip (visual only — placeholders) */}
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                type="button"
                className={`relative aspect-square w-20 overflow-hidden rounded-md border-2 ${
                  i === 0 ? "border-primary" : "border-border"
                } bg-bg-soft`}
                aria-label={`صورة ${i + 1}`}
              >
                {product.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={product.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-90"
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <span className="text-sm font-medium text-primary">{product.brandAr}</span>
            <h1 className="mt-1 text-2xl font-bold text-text-strong md:text-3xl">
              {product.nameAr}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-amber-500">★</span>
            <span className="text-sm font-medium text-text-strong">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-sm text-text-muted">
              ({product.reviewCount} تقييم)
            </span>
          </div>

          <div className="flex items-baseline gap-3 border-y border-border py-4">
            <span className={`text-3xl font-bold ${hasSale ? "text-sale" : "text-text-strong"}`}>
              {formatSAR(product.price)}
            </span>
            {hasSale && (
              <>
                <span className="text-base text-text-subtle line-through">
                  {formatSAR(product.originalPrice!)}
                </span>
                <span className="rounded-md bg-sale/10 px-2 py-0.5 text-sm font-bold text-sale">
                  وفّر {discountPct}%
                </span>
              </>
            )}
          </div>

          {/* Interactive size/color/add-to-cart (Client Component) */}
          <ProductActions product={product} />

          {/* Shipping perks */}
          <div className="space-y-2 rounded-card bg-bg-soft p-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span>شحن مجاني للطلبات فوق 200 ر.س</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span>إرجاع مجاني خلال 30 يومًا</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">✓</span>
              <span>الدفع نقدًا عند الاستلام متاح</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-2 text-base font-bold text-text-strong">الوصف</h2>
            <p className="text-sm leading-relaxed text-text-muted">
              {product.description}
            </p>
          </div>

          {/* Loyalty tease — tier-aware; signed-in users get a live Cashback preview */}
          <LoyaltyTease product={product} />
        </div>
      </section>

      {/* You may also like */}
      {related.length > 0 && (
        <section className="section pb-12">
          <h2 className="mb-6 text-2xl font-bold text-text-strong">قد يعجبك أيضًا</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function categoryLabel(slug: string): string {
  const map: Record<string, string> = {
    women: "النساء",
    men: "الرجال",
    kids: "الأطفال",
    beauty: "التجميل",
    home: "المنزل",
  };
  return map[slug] ?? slug;
}
