import Link from "next/link";
import { REGIONS, APP_BADGES } from "@/lib/categories";

// Voga Closet footer.
// Mirrors vogacloset.com/saudi/ar/ footer: country selector + useful links +
// help & contact + app downloads + company info.

const USEFUL_LINKS = [
  { label: "عن فوغا كلوسيت", href: "/about" },
  { label: "هل أنت مدون أزياء؟", href: "/blogger" },
  { label: "كن مسوقًا بعمولة", href: "/affiliate" },
  { label: "شريك فوغا كلوسيت", href: "/partner" },
  { label: "الشروط والأحكام", href: "/terms" },
  { label: "برنامج مكافآت فوغاVIP", href: "/account/vogavip" },
];

const HELP_LINKS = [
  { label: "اتصل بنا", href: "/contact" },
  { label: "الشحن والتوصيل", href: "/shipping" },
  { label: "خدمة الإرجاع و استرداد النقود", href: "/returns" },
  { label: "طرق الدفع والعروض", href: "/payment" },
  { label: "الأسئلة المتكررة", href: "/faq" },
  { label: "سياسة الخصوصية وملفات تعريف الارتباط", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-bg-soft text-sm text-text">
      <div className="section grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        {/* Countries */}
        <div>
          <h3 className="mb-4 text-base font-bold">قائمة الدول</h3>
          <ul className="space-y-2">
            {REGIONS.map((r) => (
              <li key={r.code}>
                <Link
                  href={`/region/${r.code}`}
                  className="text-text-muted transition-colors hover:text-primary"
                >
                  {r.labelAr}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Useful links */}
        <div>
          <h3 className="mb-4 text-base font-bold">روابط مفيدة</h3>
          <ul className="space-y-2">
            {USEFUL_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-text-muted transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help & contact */}
        <div>
          <h3 className="mb-4 text-base font-bold">المساعدة والاتصال</h3>
          <ul className="space-y-2">
            {HELP_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-text-muted transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* App downloads */}
        <div>
          <h3 className="mb-4 text-base font-bold">حمّل التطبيق</h3>
          <p className="mb-4 text-xs text-text-muted">
            تسوّق من ماركاتك المفضلة في أي وقت
          </p>
          <div className="flex flex-col gap-2">
            {APP_BADGES.map((b) => (
              <a
                key={b.id}
                href={b.href}
                aria-label={b.label}
                className="flex h-12 items-center justify-center rounded-md bg-black p-2 transition-opacity hover:opacity-90"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.logo}
                  alt={b.label}
                  className="h-full w-auto"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-border bg-white">
        <div className="section flex flex-col items-center justify-between gap-3 py-6 text-xs text-text-muted md:flex-row">
          <span>© 2026 فوغا كلوسيت. جميع الحقوق محفوظة.</span>
          <span>
            شركة فوغا كلوست المحدودة | رقم التسجيل الضريبي: 312843885800003
          </span>
        </div>
      </div>
    </footer>
  );
}
