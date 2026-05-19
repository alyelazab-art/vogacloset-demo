// Confirmation page — server shell. Reads the orderId from the URL and hands
// it to ConfirmationView (Client Component) which pulls the order from
// localStorage and renders the success surface.

import Link from "next/link";
import { ConfirmationView } from "./ConfirmationView";

type Params = Promise<{ id: string }>;

export default async function ConfirmationPage({ params }: { params: Params }) {
  const { id } = await params;

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
          <span className="text-text-strong">تأكيد الطلب</span>
        </nav>
      </div>

      <section className="section py-8">
        <ConfirmationView orderId={id} />
      </section>
    </>
  );
}
