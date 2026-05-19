import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { PRODUCTS } from "@/lib/products";
import { CategoryTile } from "./components/CategoryTile";
import { BrandCarousel } from "./components/BrandCarousel";
import { PaymentMethodsStrip } from "./components/PaymentMethodsStrip";
import { ProductCard } from "./components/ProductCard";

// Voga Closet homepage. Structure mirrors vogacloset.com/saudi/ar/:
//   1. Hero — 5 category tiles
//   2. Best sellers / new arrivals — product grid
//   3. Favorite brands carousel
//   4. Payment methods strip
//   5. Marketing copy / mission section
//   6. Popular searches block

export default function Home() {
  // For "new arrivals" rail, pick a curated mix across categories.
  const newArrivals = PRODUCTS.slice(0, 8);

  return (
    <>
      {/* HERO — 5 category tiles */}
      <section className="section pt-6 md:pt-10">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          {CATEGORIES.map((cat) => (
            <CategoryTile key={cat.slug} category={cat} />
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS rail */}
      <section className="section py-12">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-text-strong">
            وصل حديثًا
          </h2>
          <Link
            href="/category/women"
            className="text-sm font-medium text-primary hover:underline"
          >
            عرض الكل
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* FAVORITE BRANDS carousel */}
      <BrandCarousel />

      {/* PAYMENT METHODS strip */}
      <PaymentMethodsStrip />

      {/* MARKETING COPY section */}
      <section className="section py-16 text-center">
        <h2 className="mb-3 text-3xl font-black text-text-strong md:text-4xl">
          تسوّق ماركاتك المفضلة في مكان واحد
        </h2>
        <p className="mx-auto max-w-2xl text-base text-text-muted md:text-lg">
          أكثر من 100 ماركة عالمية، توصيل سريع لجميع مدن المملكة، وإرجاع
          مجاني خلال 30 يومًا. انضمي إلى عائلة فوغا واستمتعي بأحدث صيحات
          الموضة.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/account/vogavip" className="btn-cta">
            انضمي إلى VOGAVIP
          </Link>
          <Link href="/category/women" className="btn-outline">
            ابدأ التسوق
          </Link>
        </div>
      </section>

      {/* POPULAR SEARCHES */}
      <section className="section border-t border-border py-10">
        <h3 className="mb-4 text-base font-bold text-text-strong">
          يبحث عنها الجميع
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            "كارن ميلين",
            "فساتين سهرة",
            "أحذية رياضية",
            "حقائب يد",
            "بدل رجالي",
            "عطور نسائية",
            "ملابس أطفال",
            "ديكور منزلي",
            "بلوزات",
            "جينز",
            "بوت كاحل",
            "شموع معطرة",
          ].map((q) => (
            <Link
              key={q}
              href={`/search?q=${encodeURIComponent(q)}`}
              className="rounded-pill border border-border bg-white px-4 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
            >
              {q}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
