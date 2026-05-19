// Account dashboard — server shell + Client AccountView.

import Link from "next/link";
import { AccountView } from "./AccountView";

export default function AccountPage() {
  return (
    <section className="section grid gap-6 py-8 md:grid-cols-[260px_1fr]">
      <aside className="space-y-1 rounded-card border border-border bg-white p-2">
        <NavItem href="/account" label="نظرة عامة" active />
        <NavItem href="/account/orders" label="طلباتي" />
        <NavItem href="/account?tab=wishlist" label="المفضلة" />
        <NavItem href="/account?tab=addresses" label="العناوين" />
        <NavItem href="/account/vogavip" label="نقاط VOGAVIP" badge="VIP" />
        <NavItem href="/account?tab=settings" label="الإعدادات" />
      </aside>

      <AccountView />
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
