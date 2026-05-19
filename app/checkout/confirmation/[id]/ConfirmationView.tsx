"use client";

// Confirmation view — reads the just-placed order from localStorage and
// renders the success surface. The "you earned X pts" block is a placeholder
// until Session 3 wires the real Gameball balance read.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrderById } from "@/lib/orders-store";
import { formatSAR } from "@/lib/products";
import type { Order } from "@/lib/types";

export function ConfirmationView({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOrder(getOrderById(orderId) ?? null);
    setReady(true);
  }, [orderId]);

  if (!ready) {
    return (
      <p className="rounded-card border border-border bg-white p-12 text-center text-sm text-text-muted">
        جاري التحميل...
      </p>
    );
  }

  if (!order) {
    return (
      <div className="rounded-card border border-dashed border-border bg-bg-soft p-12 text-center">
        <p className="text-text-muted">لا يوجد طلب بهذا الرقم.</p>
        <Link href="/" className="btn-cta mt-4">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Main column */}
      <div className="space-y-6 md:col-span-2">
        {/* Success banner */}
        <div className="rounded-card bg-primary-soft p-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary text-2xl text-white">
            ✓
          </div>
          <h1 className="text-2xl font-black text-text-strong md:text-3xl">
            شكرًا لكِ — تم استلام طلبك!
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            سيصلك بريد إلكتروني بتفاصيل الطلب خلال دقائق قليلة.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-text-strong shadow-sm">
            رقم الطلب:
            <span className="text-primary">{order.id}</span>
          </div>
        </div>

        {/* VOGAVIP — placeholder this session, becomes real Gameball read in Session 3 */}
        <div className="rounded-card border border-primary/30 bg-white p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-lg text-white">
              ⭐
            </span>
            <div className="flex-1">
              <p className="text-base font-black text-primary">
                ستحصلين على {Math.floor(order.subtotal)} نقطة VOGAVIP
              </p>
              <p className="mt-1 text-sm text-text-muted">
                النقاط معلّقة الآن وستُفعّل تلقائيًا بعد 30 يومًا (نهاية فترة الإرجاع).
                ابدئي استبدال 500 نقطة فعالة بخصومات على طلباتك القادمة.
              </p>
              <p className="mt-2 text-[11px] text-text-subtle">
                ⏳ هذه قيمة تقديرية. الربط الفعلي مع Gameball يحدث في الجلسة القادمة.
              </p>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="rounded-card border border-border bg-white p-5">
          <h2 className="mb-4 text-base font-bold text-text-strong">منتجات الطلب</h2>
          <ul className="space-y-3 divide-y divide-border">
            {order.lineItems.map((li) => (
              <li key={li.id} className="flex justify-between gap-2 pt-3 first:pt-0">
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-bold text-text-strong">
                    {li.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {li.vendor} · الكمية {li.quantity}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold">
                  {formatSAR(li.price * li.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/account/orders" className="btn-cta">
            عرض طلباتي
          </Link>
          <Link href="/" className="btn-outline">
            متابعة التسوق
          </Link>
        </div>
      </div>

      {/* Summary sidebar */}
      <aside>
        <div className="sticky top-4 space-y-4 rounded-card border border-border bg-white p-5">
          <h2 className="text-base font-bold text-text-strong">ملخص الطلب</h2>

          <dl className="space-y-2 text-sm">
            <Row label="تاريخ الطلب" value={orderDate} />
            <Row label="طريقة الشحن" value={shippingLabel(order.shipping_method)} />
            <Row label="طريقة الدفع" value={paymentLabel(order.payment_method)} />
          </dl>

          <div className="space-y-2 border-t border-border pt-3 text-sm">
            <Row label="المجموع الفرعي" value={formatSAR(order.subtotal)} />
            <Row label="الشحن" value={order.shipping === 0 ? "مجاني" : formatSAR(order.shipping)} />
            <Row label="الضريبة" value={formatSAR(order.tax)} />
          </div>

          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <span className="text-base font-bold">الإجمالي المدفوع</span>
            <span className="text-xl font-bold text-primary">{formatSAR(order.totalPaid)}</span>
          </div>

          {order.shipping_address && (
            <div className="rounded-md bg-bg-soft p-3 text-xs">
              <p className="mb-1 font-bold text-text-strong">عنوان الشحن</p>
              <p className="text-text-muted">
                {order.shipping_address.firstName} {order.shipping_address.lastName}
                <br />
                {order.shipping_address.address}
                <br />
                {order.shipping_address.district} · {order.shipping_address.city}
                <br />
                {order.shipping_address.phone}
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-text-muted">{label}</dt>
      <dd className="font-medium text-text-strong">{value}</dd>
    </div>
  );
}

function shippingLabel(method?: Order["shipping_method"]): string {
  if (method === "express") return "توصيل سريع";
  if (method === "cod") return "دفع عند الاستلام";
  return "توصيل قياسي";
}

function paymentLabel(method?: Order["payment_method"]): string {
  switch (method) {
    case "mada":
      return "بطاقة مدى";
    case "visa":
      return "بطاقة ائتمان";
    case "applepay":
      return "Apple Pay";
    case "tabby":
      return "Tabby";
    case "tamara":
      return "Tamara";
    case "cod":
      return "نقدًا عند الاستلام";
    default:
      return "—";
  }
}
