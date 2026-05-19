// Cart page — server shell renders breadcrumbs + heading, hands off to
// CartView (Client Component) for the interactive line items + totals.

import Link from "next/link";
import { CartView } from "./CartView";

export default function CartPage() {
  return (
    <>
      <div className="section pt-4 pb-2">
        <nav className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-primary">
            الرئيسية
          </Link>
          <span>›</span>
          <span className="text-text-strong">سلة التسوق</span>
        </nav>
      </div>

      <section className="section py-8">
        <h1 className="mb-8 text-2xl font-black text-text-strong md:text-3xl">
          سلة التسوق
        </h1>

        <CartView />
      </section>
    </>
  );
}
