"use client";

// Cart view — interactive line items, qty controls, remove, totals.
// Pulled out of cart/page.tsx so the page can stay simple.

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatSAR } from "@/lib/products";
import { LoyaltyTease } from "@/app/components/LoyaltyTease";

const FREE_SHIPPING_THRESHOLD = 200;

export function CartView() {
  const { items, ready, count, subtotal, updateQty, removeItem } = useCart();

  if (!ready) {
    return (
      <div className="rounded-card border border-border bg-white p-12 text-center text-sm text-text-muted">
        جاري التحميل...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <div className="rounded-card border border-dashed border-border bg-bg-soft px-8 py-16 text-center">
          <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-white">
            <svg
              className="h-10 w-10 text-text-subtle"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-text-strong">سلتك فارغة</h2>
          <p className="mx-auto mb-6 max-w-md text-sm text-text-muted">
            ابدئي التسوق واستكشفي أحدث صيحات الموضة من ماركاتك المفضلة.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/category/women" className="btn-cta">
              تسوّق قسم النساء
            </Link>
            <Link href="/" className="btn-outline">
              الذهاب للرئيسية
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-card bg-primary-soft p-6 text-center md:p-8">
          <h3 className="mb-2 text-lg font-bold text-primary">
            انضمي إلى VOGAVIP
          </h3>
          <p className="mx-auto mb-4 max-w-xl text-sm text-text-muted">
            اكسبي نقطة عن كل ر.س تنفقينه، واستبدلي 500 نقطة فعالة للحصول على خصومات حصرية.
          </p>
          <Link href="/account/vogavip" className="btn-cta">
            اعرفي المزيد
          </Link>
        </div>
      </>
    );
  }

  const standardShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 20;
  const remainingToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <section className="grid gap-6 md:grid-cols-[1fr_360px]">
      {/* Line items */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-text-muted">
            <span className="font-bold text-text-strong">{count}</span> منتج في السلة
          </p>
        </div>

        <ul className="space-y-3">
          {items.map((it) => (
            <li
              key={it.sku}
              className="grid grid-cols-[88px_1fr_auto] gap-4 rounded-card border border-border bg-white p-3"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden rounded-md bg-bg-soft">
                {it.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={it.image}
                    alt={it.nameAr}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-2xl">
                    👗
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="min-w-0">
                <p className="text-xs text-text-muted">{it.brand}</p>
                <p className="line-clamp-2 text-sm font-bold text-text-strong">
                  {it.nameAr}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {it.size && <>المقاس: <strong className="text-text-strong">{it.size}</strong></>}
                  {it.size && it.color && <> · </>}
                  {it.color && <>اللون: <strong className="text-text-strong">{it.color}</strong></>}
                </p>

                {/* Qty + remove */}
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      type="button"
                      onClick={() => updateQty(it.sku, it.qty - 1)}
                      className="h-7 w-7 text-text-strong hover:bg-bg-soft"
                      aria-label="إنقاص"
                    >
                      −
                    </button>
                    <span className="min-w-7 text-center text-sm font-bold">{it.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(it.sku, it.qty + 1)}
                      className="h-7 w-7 text-text-strong hover:bg-bg-soft"
                      aria-label="زيادة"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(it.sku)}
                    className="text-xs text-text-muted underline-offset-2 hover:text-sale hover:underline"
                  >
                    حذف
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="text-end">
                <p className="text-sm font-bold text-text-strong">
                  {formatSAR(it.price * it.qty)}
                </p>
                {it.qty > 1 && (
                  <p className="text-[10px] text-text-muted">
                    ({formatSAR(it.price)} × {it.qty})
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Summary */}
      <aside>
        <div className="sticky top-4 space-y-4 rounded-card border border-border bg-white p-5">
          <h2 className="text-base font-bold text-text-strong">ملخص الطلب</h2>

          {remainingToFreeShipping > 0 && (
            <div className="rounded-md bg-primary-soft p-3 text-xs">
              <p className="text-text-muted">
                أضيفي{" "}
                <strong className="text-primary">
                  {formatSAR(remainingToFreeShipping)}
                </strong>{" "}
                للحصول على شحن مجاني
              </p>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <SummaryRow label="المجموع الفرعي" value={formatSAR(subtotal)} />
            <SummaryRow
              label="الشحن (قياسي)"
              value={standardShipping === 0 ? "مجاني" : formatSAR(standardShipping)}
            />
            <p className="text-[11px] text-text-subtle">
              الضريبة + رسوم الشحن النهائية تُحسب في صفحة الدفع
            </p>
          </div>

          {/* VOGAVIP teaser — tier-aware */}
          <div className="rounded-md bg-primary-soft p-3">
            <LoyaltyTease price={subtotal} compact />
            <p className="mt-1 text-[11px] text-text-muted">
              استبدلي 500 نقطة بخصومات على طلبك القادم
            </p>
          </div>

          <div className="flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-base font-bold">المجموع</span>
            <span className="text-xl font-bold text-text-strong">
              {formatSAR(subtotal + standardShipping)}
            </span>
          </div>

          <Link href="/checkout" className="btn-cta w-full">
            إتمام الشراء
          </Link>
          <Link href="/" className="block text-center text-xs text-text-muted hover:text-primary">
            متابعة التسوق
          </Link>
        </div>
      </aside>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text-strong">{value}</span>
    </div>
  );
}
