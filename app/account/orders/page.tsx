// Order history page — server shell + Client OrdersView.

import Link from "next/link";
import { OrdersView } from "./OrdersView";

export default function AccountOrdersPage() {
  return (
    <section className="section grid gap-6 py-8 md:grid-cols-[260px_1fr]">
      <aside className="space-y-1 rounded-card border border-border bg-white p-2">
        <NavItem href="/account" label="نظرة عامة" />
        <NavItem href="/account/orders" label="طلباتي" active />
        <NavItem href="/account?tab=wishlist" label="المفضلة" />
        <NavItem href="/account?tab=addresses" label="العناوين" />
        <NavItem href="/account/vogavip" label="نقاط VOGAVIP" badge="VIP" />
        <NavItem href="/account?tab=settings" label="الإعدادات" />
      </aside>

      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-text-strong">طلباتي</h1>
          <p className="mt-1 text-sm text-text-muted">
            كل طلباتك السابقة في مكان واحد.
          </p>
        </header>
        <OrdersView />
      </div>
    </section>
  );
}

function NavItem({
  href,
  label,
  active,
  badge,
}: {
  href: string;
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-primary-soft font-bold text-primary"
          : "text-text-strong hover:bg-bg-soft"
      }`}
    >
      <span>{label}</span>
      {badge && (
        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}
