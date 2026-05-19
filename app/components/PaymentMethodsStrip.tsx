import { PAYMENT_METHODS } from "@/lib/categories";

// Voga's homepage shows a strip of accepted payment methods near the footer.
// Real payment icons served from /public/voga/payments/.

export function PaymentMethodsStrip() {
  return (
    <section className="section border-y border-border bg-bg-soft py-8">
      <div className="mb-4 text-center">
        <h3 className="text-base font-semibold text-text-strong">طرق الدفع</h3>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {PAYMENT_METHODS.map((pm) => (
          <div
            key={pm.id}
            className="flex h-12 w-20 items-center justify-center rounded-md border border-border bg-white p-2 shadow-sm"
            title={pm.name}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pm.logo}
              alt={pm.name}
              loading="lazy"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
