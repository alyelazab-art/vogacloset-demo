// Auth page — server shell that picks the tab via ?mode=signup query,
// then renders the interactive AuthForm client component.

import { AuthForm } from "./AuthForm";

type SearchParams = Promise<{ mode?: string }>;

export default async function AuthPage({ searchParams }: { searchParams: SearchParams }) {
  const { mode } = await searchParams;
  const isSignup = mode === "signup";

  return (
    <section className="section grid gap-8 py-8 md:grid-cols-2 md:gap-12 md:py-12">
      {/* Form column */}
      <div className="mx-auto w-full max-w-md">
        <AuthForm isSignup={isSignup} />
      </div>

      {/* Marketing column */}
      <aside className="hidden rounded-card bg-primary-soft p-8 md:block">
        <div className="mx-auto max-w-sm">
          <h2 className="mb-4 text-2xl font-black text-primary">
            مرحبًا بك في عائلة VOGAVIP
          </h2>
          <p className="mb-6 text-sm text-text">
            بمجرد إنشاء حسابك، تنضمين تلقائيًا إلى برنامج المكافآت وتبدئين بكسب النقاط من أول طلب.
          </p>
          <ul className="space-y-3 text-sm">
            <Perk label="اكسبي نقطة عن كل ر.س تنفقينه" />
            <Perk label="استبدلي 500 نقطة فعالة بخصم على طلبك" />
            <Perk label="هدية عيد ميلاد سنوية حصرية" />
            <Perk label="شحن مجاني عند بلوغ مستويات VIP" />
            <Perk label="عروض حصرية لأعضاء VOGAVIP" />
          </ul>
        </div>
      </aside>
    </section>
  );
}

function Perk({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 text-primary">✓</span>
      <span>{label}</span>
    </li>
  );
}
