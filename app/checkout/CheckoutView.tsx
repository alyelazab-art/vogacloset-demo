"use client";

// Checkout view — interactive form. Validates → placeOrder() → clear cart →
// redirect to /checkout/confirmation/[id].
// Session 3 wires the Gameball Order API call between placeOrder and redirect.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { placeOrder } from "@/lib/orders-store";
import { formatSAR } from "@/lib/products";
import type { Order } from "@/lib/types";
import { LoyaltyTease } from "@/app/components/LoyaltyTease";

const MIN_REDEEM_POINTS = 500;

const VAT_RATE = 0.15;
const FREE_SHIPPING_THRESHOLD = 200;

const SHIPPING_OPTIONS: {
  id: NonNullable<Order["shipping_method"]>;
  label: string;
  cost: (subtotal: number) => number;
  hint?: string;
}[] = [
  {
    id: "standard",
    label: "توصيل قياسي (3-5 أيام عمل)",
    cost: (s) => (s >= FREE_SHIPPING_THRESHOLD ? 0 : 20),
    hint: "مجاني للطلبات فوق 200 ر.س",
  },
  { id: "express", label: "توصيل سريع (1-2 يوم عمل)", cost: () => 40 },
  { id: "cod", label: "الدفع عند الاستلام (3-5 أيام عمل)", cost: () => 30 },
];

const PAYMENT_OPTIONS: { id: NonNullable<Order["payment_method"]>; label: string }[] = [
  { id: "mada", label: "بطاقة مدى" },
  { id: "visa", label: "بطاقة ائتمان (Visa / Mastercard)" },
  { id: "applepay", label: "Apple Pay" },
  { id: "tabby", label: "ادفع لاحقًا عبر Tabby" },
  { id: "tamara", label: "قسّمها 4 دفعات بدون فوائد عبر Tamara" },
  { id: "cod", label: "الدفع نقدًا عند الاستلام" },
];

export function CheckoutView() {
  const router = useRouter();
  const { user, ready: authReady, refreshGameballProfile, gameballProfile } = useAuth();
  const { items, ready: cartReady, subtotal, clearCart } = useCart();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [shippingMethod, setShippingMethod] = useState<NonNullable<Order["shipping_method"]>>("standard");
  const [paymentMethod, setPaymentMethod] = useState<NonNullable<Order["payment_method"]>>("mada");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phase 5: Apply VOGAVIP Points state
  const [holdReference, setHoldReference] = useState<string | null>(null);
  const [appliedPoints, setAppliedPoints] = useState(0);
  const [holdBusy, setHoldBusy] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);
  const [staleHint, setStaleHint] = useState(false);
  // Ref mirrors holdReference so the unmount cleanup can read the latest value
  // without us having to re-declare the effect on every change.
  const holdRefRef = useRef<string | null>(null);
  useEffect(() => {
    holdRefRef.current = holdReference;
  }, [holdReference]);
  // Track previous subtotal so we only auto-release when the cart genuinely changes
  // AFTER a hold was active (not on first render).
  const prevSubtotalRef = useRef(subtotal);

  // Hydrate form from session user once available (one-shot).
  // Address defaults to a demo-friendly Riyadh value so Aly/Dana never see an
  // empty-required field when testing the order flow.
  useEffect(() => {
    if (user && !firstName && !email) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setPhone(user.phone ?? "+966 55 555 0000");
      setCity("الرياض");
      setDistrict("العليا");
      setAddress("شارع الملك فهد، مبنى ١٢٣٤");
    }
    // intentionally only depend on user.id — re-run if user changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Auto-release hold when the cart changes (subtotal mutation = stale hold).
  // Silent release + hint asking the user to re-apply if they want to keep the discount.
  useEffect(() => {
    if (prevSubtotalRef.current !== subtotal) {
      if (holdReference) {
        const ref = holdReference;
        // fire-and-forget; we don't block on the release
        fetch("/api/gameball/release", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ holdReference: ref }),
        }).catch(() => {});
        setHoldReference(null);
        setAppliedPoints(0);
        setHoldError(null);
        setStaleHint(true);
      }
      prevSubtotalRef.current = subtotal;
    }
  }, [subtotal, holdReference]);

  // Best-effort release on unmount so abandoned holds don't linger forever.
  // keepalive: true lets the request survive the page navigation/close.
  useEffect(() => {
    return () => {
      const ref = holdRefRef.current;
      if (ref) {
        fetch("/api/gameball/release", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ holdReference: ref }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, []);

  if (!authReady || !cartReady) {
    return (
      <p className="rounded-card border border-border bg-white p-12 text-center text-sm text-text-muted">
        جاري التحميل...
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-bg-soft p-12 text-center">
        <p className="text-text-muted">سلتك فارغة — أضيفي منتجات قبل المتابعة.</p>
        <Link href="/category/women" className="btn-cta mt-4">
          تسوّق الآن
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-card border border-primary/30 bg-primary-soft p-8 text-center">
        <h2 className="mb-2 text-xl font-bold text-primary">سجّلي الدخول لإتمام الشراء</h2>
        <p className="mb-6 text-sm text-text-muted">
          لإكمال طلبك واحتساب نقاط VOGAVIP، تحتاجين إلى حساب فوغا.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/auth" className="btn-cta">
            تسجيل الدخول
          </Link>
          <Link href="/auth?mode=signup" className="btn-outline">
            إنشاء حساب جديد
          </Link>
        </div>
      </div>
    );
  }

  const shippingOpt = SHIPPING_OPTIONS.find((o) => o.id === shippingMethod)!;
  const shipping = shippingOpt.cost(subtotal);
  const tax = Math.round(subtotal * VAT_RATE * 100) / 100;
  const baseTotal = Math.round((subtotal + shipping + tax) * 100) / 100;

  // Phase 5 — discount math
  const redemptionFactor = gameballProfile?.redemptionFactor ?? 0.01;
  const activePoints = gameballProfile?.activePoints ?? 0;
  const discountSAR = Math.round(appliedPoints * redemptionFactor * 100) / 100;
  const total = Math.round((baseTotal - discountSAR) * 100) / 100;
  // Max pts the customer could appliably redeem on this order: capped by both
  // their active balance AND the order total (no redeeming for more than you owe).
  const maxAppliablePoints = Math.min(
    activePoints,
    Math.floor(baseTotal / redemptionFactor),
  );
  const canRedeem = activePoints >= MIN_REDEEM_POINTS;

  async function applyPoints(points: number) {
    if (!user) return;
    if (points < MIN_REDEEM_POINTS) return;
    setHoldBusy(true);
    setHoldError(null);
    setStaleHint(false);
    try {
      const res = await fetch("/api/gameball/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: user.id, points }),
      });
      const data = (await res.json()) as { holdReference?: string; error?: string };
      if (!res.ok || !data.holdReference) {
        setHoldError("تعذّر تطبيق النقاط — حاولي مجددًا");
        return;
      }
      setHoldReference(data.holdReference);
      setAppliedPoints(points);
    } catch {
      setHoldError("خطأ في الاتصال بـ Gameball");
    } finally {
      setHoldBusy(false);
    }
  }

  async function releasePoints() {
    if (!holdReference) return;
    const ref = holdReference;
    setHoldReference(null);
    setAppliedPoints(0);
    setHoldError(null);
    setStaleHint(false);
    try {
      await fetch("/api/gameball/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdReference: ref }),
      });
    } catch {
      // silent — the hold will reclaim server-side eventually
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firstName || !lastName || !phone || !city || !district || !address) {
      setError("الرجاء تعبئة جميع حقول الشحن قبل المتابعة");
      return;
    }
    setSubmitting(true);
    try {
      const order = placeOrder({
        customerId: user!.id,
        items,
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        shipping_address: {
          firstName,
          lastName,
          email,
          phone,
          city,
          district,
          address,
        },
        discountSAR,
      });
      // Fire the Gameball Order API. Voga spec: 30-day pending → active.
      // If a hold is active (Apply Points used), pass holdReference so Gameball
      // atomically burns the held points + records the order in one call.
      // Best-effort: a failure here doesn't block the customer's checkout;
      // Gameball dedupes on orderId so a manual replay is safe.
      try {
        const res = await fetch("/api/gameball/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: order.customerId,
            orderId: order.id,
            totalPaid: order.totalPaid,
            currency: order.currency,
            createdAt: order.createdAt,
            cashbackConfigurations: { returnWindow: 30 },
            lineItems: order.lineItems,
            ...(holdReference && { holdReference }),
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          console.error(`Gameball order POST failed: ${res.status}`, text.slice(0, 300));
        } else {
          // Mark the hold as consumed so the unmount cleanup doesn't try to release
          // a reference Gameball has already burned.
          holdRefRef.current = null;
          // Refresh balance so the header pill + /account tile reflect new pending points
          refreshGameballProfile();

          // Use Case #6 — Category diversity bonus. Gameball's builder has no
          // COUNT(DISTINCT) operator, so we pre-aggregate the distinct-category
          // count here and fire it as a custom event. Dashboard has 4 automations
          // segmented on attributes.distinctCategoryCount == 2/3/4/5 issuing the
          // tiered bonus (+200/+300/+400/+500 pts, tag "Category Bonus Points").
          const distinctCategoryCount = new Set(items.map((it) => it.category)).size;
          if (distinctCategoryCount >= 2) {
            try {
              await fetch("/api/gameball/event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  customerId: order.customerId,
                  eventName: "category_diversity",
                  attributes: {
                    distinctCategoryCount,
                    orderId: order.id,
                  },
                }),
              });
            } catch (evErr) {
              console.error("Gameball event POST threw:", evErr);
            }
          }
        }
      } catch (gbErr) {
        console.error("Gameball order POST threw:", gbErr);
      }
      clearCart();
      router.push(`/checkout/confirmation/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء الطلب");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-3">
      {/* Forms */}
      <div className="space-y-6 md:col-span-2">
        <h1 className="text-2xl font-black text-text-strong md:text-3xl">إتمام الشراء</h1>

        <StepCard step={1} title="معلومات الشحن" active>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="الاسم الأول" value={firstName} onChange={setFirstName} required />
            <Field label="الاسم الأخير" value={lastName} onChange={setLastName} required />
            <Field
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={setEmail}
              required
              className="md:col-span-2"
            />
            <Field
              label="رقم الجوال"
              type="tel"
              placeholder="‎+966 5_ ___ ____"
              value={phone}
              onChange={setPhone}
              required
              className="md:col-span-2"
            />
            <Field
              label="المدينة"
              placeholder="الرياض / جدة / الدمام..."
              value={city}
              onChange={setCity}
              required
            />
            <Field label="الحي" value={district} onChange={setDistrict} required />
            <Field
              label="العنوان"
              placeholder="رقم الشارع، المبنى، الشقة"
              value={address}
              onChange={setAddress}
              required
              className="md:col-span-2"
            />
          </div>
        </StepCard>

        <StepCard step={2} title="طريقة الشحن">
          <ul className="space-y-2">
            {SHIPPING_OPTIONS.map((o) => (
              <li key={o.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 transition-colors hover:border-primary">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === o.id}
                    onChange={() => setShippingMethod(o.id)}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{o.label}</p>
                    {o.hint && <p className="mt-0.5 text-xs text-primary">{o.hint}</p>}
                  </div>
                  <span className="text-sm font-semibold">
                    {o.cost(subtotal) === 0 ? "مجاني" : formatSAR(o.cost(subtotal))}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </StepCard>

        <StepCard step={3} title="الدفع">
          <ul className="space-y-2">
            {PAYMENT_OPTIONS.map((o) => (
              <li key={o.id}>
                <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 transition-colors hover:border-primary">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === o.id}
                    onChange={() => setPaymentMethod(o.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="flex-1 text-sm font-medium">{o.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </StepCard>
      </div>

      {/* Order summary */}
      <aside className="md:col-span-1">
        <div className="sticky top-4 space-y-4 rounded-card border border-border bg-white p-5">
          <h2 className="text-base font-bold text-text-strong">ملخص الطلب</h2>

          {/* Line items mini */}
          <ul className="max-h-48 space-y-2 overflow-y-auto pe-1 text-xs">
            {items.map((it) => (
              <li key={it.sku} className="flex justify-between gap-2">
                <span className="line-clamp-1 text-text-muted">
                  {it.nameAr} × {it.qty}
                </span>
                <span className="shrink-0 font-medium text-text-strong">
                  {formatSAR(it.price * it.qty)}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-border pt-3 text-sm">
            <SummaryRow label="المجموع الفرعي" value={formatSAR(subtotal)} />
            <SummaryRow
              label="الشحن"
              value={shipping === 0 ? "مجاني" : formatSAR(shipping)}
            />
            <SummaryRow label="ضريبة القيمة المضافة (15%)" value={formatSAR(tax)} />
            {discountSAR > 0 && (
              <SummaryRow
                label={`خصم النقاط (${appliedPoints.toLocaleString("ar-SA")} نقطة)`}
                value={`-${formatSAR(discountSAR)}`}
                highlight
              />
            )}
          </div>

          {/* VOGAVIP teaser — tier-aware earn estimate based on what they'll actually pay */}
          <div className="rounded-md border border-primary/20 bg-primary-soft p-3">
            <LoyaltyTease price={total} compact />
          </div>

          {/* Apply VOGAVIP Points panel — Phase 5 burn flow */}
          {gameballProfile && (
            <ApplyPointsPanel
              activePoints={activePoints}
              redemptionFactor={redemptionFactor}
              maxAppliablePoints={maxAppliablePoints}
              canRedeem={canRedeem}
              appliedPoints={appliedPoints}
              discountSAR={discountSAR}
              holdActive={!!holdReference}
              holdBusy={holdBusy}
              holdError={holdError}
              staleHint={staleHint}
              onApply={applyPoints}
              onRelease={releasePoints}
            />
          )}

          <div className="flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-base font-bold">الإجمالي</span>
            <span className="text-xl font-bold text-text-strong">{formatSAR(total)}</span>
          </div>

          {error && (
            <p className="rounded-md border border-sale/30 bg-sale/5 px-3 py-2 text-xs text-sale">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-cta w-full disabled:opacity-60">
            {submitting ? "جاري إنشاء الطلب..." : "تأكيد الطلب"}
          </button>

          <p className="text-center text-[11px] text-text-subtle">
            بالمتابعة، فإنك توافقين على{" "}
            <Link href="/terms" className="text-primary underline">
              الشروط والأحكام
            </Link>
          </p>
        </div>
      </aside>
    </form>
  );
}

function StepCard({
  step,
  title,
  active,
  children,
}: {
  step: number;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-card border bg-white p-5 ${active ? "border-primary/40" : "border-border"}`}
    >
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`grid h-7 w-7 place-items-center rounded-full text-sm font-bold ${
            active ? "bg-primary text-white" : "bg-bg-softer text-text-muted"
          }`}
        >
          {step}
        </span>
        <h2 className="text-base font-bold text-text-strong">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  className = "",
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-text-strong">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={highlight ? "text-primary" : "text-text-muted"}>{label}</span>
      <span className={`font-medium ${highlight ? "text-primary" : "text-text-strong"}`}>
        {value}
      </span>
    </div>
  );
}

function ApplyPointsPanel({
  activePoints,
  redemptionFactor,
  maxAppliablePoints,
  canRedeem,
  appliedPoints,
  discountSAR,
  holdActive,
  holdBusy,
  holdError,
  staleHint,
  onApply,
  onRelease,
}: {
  activePoints: number;
  redemptionFactor: number;
  maxAppliablePoints: number;
  canRedeem: boolean;
  appliedPoints: number;
  discountSAR: number;
  holdActive: boolean;
  holdBusy: boolean;
  holdError: string | null;
  staleHint: boolean;
  onApply: (points: number) => void;
  onRelease: () => void;
}) {
  const valueSAR = Math.round(activePoints * redemptionFactor * 100) / 100;

  return (
    <div className="rounded-md border border-primary/30 bg-white p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-xs font-bold text-text-strong">
          ⭐ استخدمي نقاط VOGAVIP
        </span>
        <span className="text-[10px] text-text-muted">
          متوفر: {activePoints.toLocaleString("ar-SA")} (≈ {valueSAR.toFixed(2)} ر.س)
        </span>
      </div>

      {!canRedeem && (
        <p className="text-[11px] text-text-muted">
          تحتاجين {MIN_REDEEM_POINTS.toLocaleString("ar-SA")} نقطة على الأقل للاستبدال
        </p>
      )}

      {canRedeem && !holdActive && (
        <div className="grid grid-cols-3 gap-1.5">
          <PresetButton
            label="500"
            disabled={holdBusy || maxAppliablePoints < 500}
            onClick={() => onApply(500)}
          />
          <PresetButton
            label="1,000"
            disabled={holdBusy || maxAppliablePoints < 1000}
            onClick={() => onApply(1000)}
          />
          <PresetButton
            label="الحد الأقصى"
            disabled={holdBusy || maxAppliablePoints < MIN_REDEEM_POINTS}
            onClick={() => onApply(maxAppliablePoints)}
          />
        </div>
      )}

      {holdActive && (
        <div className="flex items-center justify-between rounded-md bg-emerald-50 px-2.5 py-2 text-[11px] font-bold text-emerald-700">
          <span>
            ✓ تم تطبيق {appliedPoints.toLocaleString("ar-SA")} نقطة (-{discountSAR.toFixed(2)} ر.س)
          </span>
          <button
            type="button"
            onClick={onRelease}
            disabled={holdBusy}
            className="text-emerald-700 underline underline-offset-2 hover:text-emerald-900 disabled:opacity-50"
          >
            تراجع
          </button>
        </div>
      )}

      {holdBusy && !holdActive && (
        <p className="mt-1.5 text-[10px] text-text-muted">جاري التطبيق...</p>
      )}

      {staleHint && !holdActive && (
        <p className="mt-1.5 text-[10px] text-amber-700">
          تطبيق النقاط أُلغي بعد تعديل السلة — أعيدي التطبيق
        </p>
      )}

      {holdError && (
        <p className="mt-1.5 text-[10px] text-sale">{holdError}</p>
      )}
    </div>
  );
}

function PresetButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-primary/40 bg-white px-2 py-1.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
    >
      {label}
    </button>
  );
}
