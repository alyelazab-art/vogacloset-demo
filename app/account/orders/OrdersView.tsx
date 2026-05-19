"use client";

// Order history for the signed-in customer. Reads from local orders-store.
// Session 3 layers a Gameball activity-log call on top (X2 / X3 transparency).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getOrdersByCustomer } from "@/lib/orders-store";
import { formatSAR } from "@/lib/products";
import type { Order } from "@/lib/types";

export function OrdersView() {
  const { user, ready } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    setOrders(getOrdersByCustomer(user.id));
  }, [user]);

  if (!ready) {
    return (
      <p className="rounded-card border border-border bg-white p-12 text-center text-sm text-text-muted">
        جاري التحميل...
      </p>
    );
  }

  if (!user) {
    return (
      <div className="rounded-card border border-primary/30 bg-primary-soft p-8 text-center">
        <h2 className="mb-2 text-xl font-bold text-primary">سجّلي الدخول لعرض طلباتك</h2>
        <Link href="/auth" className="btn-cta mt-4">
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-bg-soft p-12 text-center">
        <p className="mb-4 text-sm text-text-muted">لم تقومي بأي طلب بعد.</p>
        <Link href="/category/women" className="btn-cta">
          ابدئي التسوق
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li
          key={o.id}
          className="rounded-card border border-border bg-white p-4 transition-colors hover:border-primary/40"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-text-strong">
                طلب رقم{" "}
                <span className="text-primary">{o.id}</span>
              </p>
              <p className="text-xs text-text-muted">
                {new Date(o.createdAt).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · {o.lineItems.length} منتج
              </p>
            </div>
            <p className="text-base font-bold text-text-strong">
              {formatSAR(o.totalPaid)}
            </p>
          </div>

          <ul className="mt-3 flex flex-wrap gap-2 text-[11px]">
            {o.lineItems.slice(0, 4).map((li) => (
              <li
                key={li.id}
                className="rounded-full bg-bg-soft px-2.5 py-1 text-text-muted"
              >
                {li.name.length > 40 ? li.name.slice(0, 40) + "..." : li.name}
                {li.quantity > 1 && ` × ${li.quantity}`}
              </li>
            ))}
            {o.lineItems.length > 4 && (
              <li className="rounded-full bg-bg-soft px-2.5 py-1 text-text-muted">
                +{o.lineItems.length - 4}
              </li>
            )}
          </ul>

          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <Link
              href={`/checkout/confirmation/${o.id}`}
              className="font-bold text-primary hover:underline"
            >
              عرض التفاصيل
            </Link>
            <span className="rounded bg-primary-soft px-2 py-0.5 font-bold text-primary">
              ⭐ {Math.floor(o.subtotal)} نقطة VOGAVIP
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
