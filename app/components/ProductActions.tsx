"use client";

// PDP size/color selector + Add to Cart button.
// Client Component injected into the PDP server page; receives the Product
// via props so the server can still fetch + render the rest of the page.

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

export function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();

  const sizes = product.sizes ?? [];
  const colors = product.colors ?? [];

  // Auto-pick the first option if there's only one (single-size items shouldn't force a click).
  const [size, setSize] = useState<string | undefined>(
    sizes.length === 1 ? sizes[0] : undefined,
  );
  const [color, setColor] = useState<string | undefined>(
    colors.length > 0 ? colors[0].name : undefined,
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const needsSize = sizes.length > 1 && !size;

  function handleAdd(redirectToCart: boolean) {
    if (needsSize) {
      setFeedback("الرجاء اختيار المقاس أولًا");
      return;
    }
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: product.price,
      qty: 1,
      size,
      color,
      image: product.image,
      category: product.category,
      brand: product.brand,
      brandSlug: product.brandSlug,
    });
    if (redirectToCart) {
      router.push("/cart");
    } else {
      setFeedback("✓ تمت الإضافة إلى السلة");
      setTimeout(() => setFeedback(null), 2000);
    }
  }

  return (
    <div className="space-y-5">
      {/* Size selector */}
      {sizes.length > 1 && (
        <div>
          <label className="mb-2 block text-sm font-bold">المقاس</label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s);
                  if (feedback) setFeedback(null);
                }}
                className={`min-w-12 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  size === s
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-white text-text-strong hover:border-primary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color selector */}
      {colors.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-bold">
            اللون: <span className="font-normal text-text-muted">{color}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.name)}
                className={`h-10 w-10 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === c.name ? "border-primary" : "border-border"
                }`}
                style={{ background: c.hex }}
                aria-label={c.name}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => handleAdd(false)}
          className="btn-cta flex-1"
        >
          <svg
            className="me-2 h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          أضف إلى السلة
        </button>
        <button
          type="button"
          aria-label="أضف للمفضلة"
          className="grid h-12 w-12 place-items-center rounded-pill border border-border bg-white hover:border-primary"
        >
          <svg
            className="h-5 w-5 text-text-strong"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        onClick={() => handleAdd(true)}
        className="btn-outline w-full"
      >
        اشتري الآن (انتقال للسلة)
      </button>

      {feedback && (
        <p
          className={`text-center text-sm font-medium ${
            feedback.startsWith("✓") ? "text-primary" : "text-sale"
          }`}
        >
          {feedback}
        </p>
      )}
    </div>
  );
}
