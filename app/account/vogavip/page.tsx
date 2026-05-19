import Link from "next/link";

// VOGAVIP loyalty page — mirrors vogacloset.com/saudi/ar/voga-vip/ closely
// so Dana recognizes "her" program in the demo. Critical mechanics from her
// live site (verified 2026-05-17):
//   • 1 SAR spent = 1 point earned
//   • 500 active points required before any redemption
//   • Tier mechanic = based on active points, 12 months rolling from
//     registration date (live site says "active points" — NOT spend, despite
//     the trial use cases asking for spend-based tiers)
//   • Tier benefits: free shipping, birthday gifts, additional rewards
// Tier names in email thread: Blue / Gold / Platinum / Diamond.

const TIERS = [
  {
    code: "blue",
    name: "Blue",
    nameAr: "أزرق",
    threshold: "أول طلب",
    earnRate: "1× نقطة لكل 1 ر.س",
    perks: ["جمع النقاط من أول طلب", "هدية عيد الميلاد", "عروض حصرية"],
    color: "from-sky-200 to-sky-400",
    icon: "🔵",
  },
  {
    code: "gold",
    name: "Gold",
    nameAr: "ذهبي",
    threshold: "100 ر.س إنفاق سنوي",
    earnRate: "1× نقطة لكل 1 ر.س",
    perks: ["كل ميزات Blue", "شحن مجاني للطلبات فوق 100 ر.س", "وصول مبكر للتنزيلات"],
    color: "from-amber-200 to-amber-400",
    icon: "🥇",
  },
  {
    code: "platinum",
    name: "Platinum",
    nameAr: "بلاتيني",
    threshold: "300 ر.س إنفاق سنوي",
    earnRate: "2× نقطة لكل 1 ر.س",
    perks: ["كل ميزات Gold", "شحن مجاني دائم", "إرجاع مجاني خلال 60 يوم"],
    color: "from-slate-300 to-slate-500",
    icon: "💎",
  },
  {
    code: "diamond",
    name: "Diamond",
    nameAr: "ماسي",
    threshold: "500 ر.س إنفاق سنوي",
    earnRate: "3× نقطة لكل 1 ر.س",
    perks: [
      "كل ميزات Platinum",
      "هدية ترحيب VIP",
      "خصومات حصرية على الماركات الفاخرة",
      "مدير حساب شخصي",
    ],
    color: "from-purple-300 to-purple-500",
    icon: "💠",
  },
];

const STEPS = [
  {
    n: 1,
    title: "سجّلي مجانًا",
    body: "أنشئي حسابك في فوغا وستنضمين تلقائيًا إلى برنامج VOGAVIP في مستوى Blue.",
  },
  {
    n: 2,
    title: "تسوّقي واكسبي نقاط",
    body: "اكسبي نقطة واحدة عن كل ريال تنفقينه. كلما زاد إنفاقك، ارتقيت إلى مستوى أعلى مع نقاط أكثر.",
  },
  {
    n: 3,
    title: "استبدلي نقاطك",
    body: "بمجرد تجميع 500 نقطة فعّالة، يمكنك تطبيقها كخصم عند إتمام الشراء.",
  },
  {
    n: 4,
    title: "استمتعي بالمزايا الحصرية",
    body: "هدية عيد ميلاد، شحن مجاني، عروض حصرية، وأكثر — كلما ارتقيت المستوى.",
  },
];

export default function VogaVIPPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-soft to-white py-12 md:py-20">
        <div className="section text-center">
          <span className="inline-block rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">
            برنامج المكافآت
          </span>
          <h1 className="mt-4 text-3xl font-black text-text-strong md:text-5xl">
            VOGAVIP
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-text-muted md:text-lg">
            كافئ حبك للموضة واستمتعي بميزات حصرية لك
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-text-subtle">
            جاهز للانضمام؟ العملية سهلة ومجانية!
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/auth?mode=signup" className="btn-cta">
              انضمي الآن
            </Link>
            <Link href="#how-it-works" className="btn-outline">
              كيف يعمل البرنامج
            </Link>
          </div>
        </div>
      </section>

      {/* Quick facts (the real Voga values, mirrored from live site) */}
      <section className="section -mt-8 md:-mt-12">
        <div className="grid gap-3 rounded-card border border-border bg-white p-6 shadow-sm md:grid-cols-3 md:gap-6">
          <Fact
            big="1 : 1"
            label="ر.س = نقطة"
            sub="اكسبي نقطة عن كل ريال تنفقينه"
          />
          <Fact
            big="500"
            label="نقطة فعّالة للاستبدال"
            sub="الحد الأدنى لتطبيق النقاط على طلبك"
          />
          <Fact
            big="12"
            label="شهر تجديد المستوى"
            sub="يُحدّد مستواك من تاريخ التسجيل سنويًا"
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="section py-16">
        <h2 className="mb-2 text-center text-3xl font-black text-text-strong">
          كيف يعمل VOGAVIP
        </h2>
        <p className="mb-12 text-center text-sm text-text-muted">
          4 خطوات بسيطة للبدء بكسب المكافآت
        </p>

        <div className="grid gap-6 md:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.n} className="rounded-card border border-border bg-white p-6 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary text-lg font-black text-white">
                {step.n}
              </div>
              <h3 className="mb-2 text-base font-bold text-text-strong">
                {step.title}
              </h3>
              <p className="text-xs leading-relaxed text-text-muted">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-bg-soft py-16">
        <div className="section">
          <h2 className="mb-2 text-center text-3xl font-black text-text-strong">
            مستويات VOGAVIP
          </h2>
          <p className="mb-12 text-center text-sm text-text-muted">
            ارتقي عبر 4 مستويات وافتحي مكافآت أكبر مع كل طلب
          </p>

          <div className="grid gap-4 md:grid-cols-4">
            {TIERS.map((tier) => (
              <article
                key={tier.code}
                className="overflow-hidden rounded-card border border-border bg-white"
              >
                <div
                  className={`flex h-28 items-center justify-center bg-gradient-to-br ${tier.color}`}
                >
                  <span className="text-5xl">{tier.icon}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-text-strong">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-text-muted">{tier.nameAr}</p>
                  <div className="mt-3 space-y-1 text-xs">
                    <p className="text-text-muted">
                      <span className="font-bold text-text-strong">المؤهلية: </span>
                      {tier.threshold}
                    </p>
                    <p className="text-text-muted">
                      <span className="font-bold text-text-strong">معدل الكسب: </span>
                      {tier.earnRate}
                    </p>
                  </div>
                  <ul className="mt-4 space-y-2 border-t border-border pt-4 text-xs">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span className="text-text">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section py-16 text-center">
        <h2 className="mb-3 text-3xl font-black text-text-strong">
          جاهزة للانضمام؟
        </h2>
        <p className="mb-6 text-base text-text-muted">
          سجّلي الآن وابدئي بكسب نقاطك من أول طلب
        </p>
        <Link href="/auth?mode=signup" className="btn-cta">
          انضمي إلى VOGAVIP
        </Link>
        <p className="mt-4 text-xs text-text-subtle">
          العضوية مجانية بالكامل · لا توجد رسوم اشتراك
        </p>
      </section>
    </>
  );
}

function Fact({ big, label, sub }: { big: string; label: string; sub: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-black text-primary md:text-5xl">{big}</p>
      <p className="mt-2 text-sm font-bold text-text-strong">{label}</p>
      <p className="mt-1 text-xs text-text-muted">{sub}</p>
    </div>
  );
}
