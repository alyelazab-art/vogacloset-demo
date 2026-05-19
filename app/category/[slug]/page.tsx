import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { productsByCategory, type Product } from "@/lib/products";
import { ProductCard } from "@/app/components/ProductCard";

// Voga-style Product Listing Page (PLP).
// Single template handles all 5 top-level categories. URL: /category/<slug>.
// Renders a filter sidebar (visual only), sort dropdown (visual only),
// product count, and the grid of cards.

type Params = Promise<{ slug: string }>;

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) notFound();

  const products = productsByCategory(category.slug as Product["category"]);

  return (
    <>
      {/* Breadcrumb */}
      <div className="section pt-4 pb-2">
        <nav className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-primary">
            الرئيسية
          </Link>
          <span>›</span>
          <span className="text-text-strong">{category.labelAr}</span>
        </nav>
      </div>

      {/* Category hero strip */}
      <section className="section pb-4">
        <div className="relative h-32 overflow-hidden rounded-card bg-bg-soft md:h-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={category.heroImage}
            alt={category.labelAr}
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
            <h1 className="rounded-md bg-white/95 px-6 py-2 text-2xl font-black text-text-strong shadow-sm md:text-3xl">
              {category.labelAr}
            </h1>
          </div>
        </div>
      </section>

      {/* Filters + Results */}
      <section className="section flex gap-6 pb-12">
        {/* Filter sidebar (desktop only, visual only) */}
        <aside className="hidden w-60 shrink-0 md:block">
          <h2 className="mb-4 text-base font-bold">تصفية</h2>

          <FilterBlock title="السعر">
            <PriceRange />
          </FilterBlock>

          <FilterBlock title="الماركة">
            <FilterChecks items={["كارين ميلين", "كوست فاشن", "كلوب ال لندن", "بريتي ليتل ثينق", "بوهو مان"]} />
          </FilterBlock>

          <FilterBlock title="المقاس">
            <FilterChecks items={["XS", "S", "M", "L", "XL", "XXL"]} />
          </FilterBlock>

          <FilterBlock title="اللون">
            <div className="flex flex-wrap gap-2">
              {["#000", "#fff", "#a01818", "#1a2942", "#d4af37", "#f9a8d4", "#22c55e"].map((c) => (
                <span
                  key={c}
                  className="h-7 w-7 cursor-pointer rounded-full border border-border"
                  style={{ background: c }}
                />
              ))}
            </div>
          </FilterBlock>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {/* Result bar */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-text-muted">
              {products.length} منتج
            </span>
            <div className="flex items-center gap-2 text-sm">
              <label htmlFor="sort" className="text-text-muted">
                ترتيب:
              </label>
              <select
                id="sort"
                className="rounded-md border border-border bg-white px-3 py-1.5 text-text-strong outline-none"
                defaultValue="newest"
              >
                <option value="newest">الأحدث</option>
                <option value="price-asc">السعر: من الأقل</option>
                <option value="price-desc">السعر: من الأعلى</option>
                <option value="discount">أعلى خصم</option>
                <option value="rating">الأعلى تقييمًا</option>
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-card border border-dashed border-border bg-bg-soft py-16 text-center text-text-muted">
              لا توجد منتجات في هذه الفئة حاليًا.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ──── Filter helpers (visual only this session) ────

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 border-b border-border pb-4">
      <h3 className="mb-3 text-sm font-bold text-text-strong">{title}</h3>
      {children}
    </div>
  );
}

function FilterChecks({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-text-muted">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-primary"
            aria-label={item}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PriceRange() {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="من"
          className="w-20 rounded-md border border-border bg-white px-2 py-1 text-xs outline-none focus:border-primary"
        />
        <input
          type="number"
          placeholder="إلى"
          className="w-20 rounded-md border border-border bg-white px-2 py-1 text-xs outline-none focus:border-primary"
        />
      </div>
      <div className="text-xs text-text-subtle">السعر بالريال السعودي</div>
    </div>
  );
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}
