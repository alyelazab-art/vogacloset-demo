// Checkout page — server shell renders breadcrumbs + hands off to interactive view.

import Link from "next/link";
import { CheckoutView } from "./CheckoutView";

export default function CheckoutPage() {
  return (
    <>
      <div className="section pt-4 pb-2">
        <nav className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-primary">
            الرئيسية
          </Link>
          <span>›</span>
          <Link href="/cart" className="hover:text-primary">
            السلة
          </Link>
          <span>›</span>
          <span className="text-text-strong">إتمام الشراء</span>
        </nav>
      </div>

      <section className="section py-8">
        <CheckoutView />
      </section>
    </>
  );
}
