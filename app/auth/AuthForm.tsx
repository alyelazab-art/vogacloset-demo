"use client";

// Sign-in / Sign-up form — Client Component.
// Receives isSignup as a prop from the Server Component page so URL-based
// tab toggling still works without converting the whole page to client.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { DEMO_CUSTOMERS, DEMO_PASSWORD } from "@/lib/demo-customers";

export function AuthForm({ isSignup }: { isSignup: boolean }) {
  const router = useRouter();
  const { signUp, signIn } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [birthday, setBirthday] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isSignup) {
        if (!firstName || !lastName || !email || !password) {
          throw new Error("الرجاء تعبئة الحقول المطلوبة");
        }
        await signUp({
          firstName,
          lastName,
          email,
          phone,
          password,
          birthday: birthday || undefined,
        });
      } else {
        if (!email || !password) {
          throw new Error("الرجاء إدخال البريد وكلمة المرور");
        }
        await signIn(email, password);
      }
      // Per session 2 plan: always land in /account after auth — strongest loyalty surface.
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleQuickPick(demoEmail: string) {
    setError(null);
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setSubmitting(true);
    try {
      await signIn(demoEmail, DEMO_PASSWORD);
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تسجيل الدخول السريع");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Demo quick-pick (always visible — this site IS a demo) */}
      <div className="mb-6 rounded-card border border-primary/30 bg-primary-soft/40 p-4">
        <p className="mb-2 text-xs font-bold text-primary">
          🎬 حسابات تجريبية جاهزة
        </p>
        <p className="mb-3 text-[11px] text-text-muted">
          اضغطي على أي حساب لتسجيل الدخول مباشرةً — لمعاينة كل مستوى VOGAVIP
        </p>
        <div className="grid grid-cols-1 gap-2">
          {DEMO_CUSTOMERS.map((d) => (
            <button
              key={d.email}
              type="button"
              disabled={submitting}
              onClick={() => handleQuickPick(d.email)}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-white px-3 py-2 text-right text-xs transition-colors hover:border-primary disabled:opacity-50"
            >
              <span>
                <span className="block font-bold text-text-strong">
                  {d.firstName} {d.lastName}
                </span>
                <span className="text-[10px] text-text-muted">{d.blurb}</span>
              </span>
              <span className="rounded bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary">
                {d.email}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 grid grid-cols-2 rounded-md border border-border bg-bg-soft p-1 text-sm font-bold">
        <Link
          href="/auth"
          className={`rounded py-2 text-center transition-colors ${
            !isSignup ? "bg-white text-text-strong shadow-sm" : "text-text-muted"
          }`}
        >
          تسجيل الدخول
        </Link>
        <Link
          href="/auth?mode=signup"
          className={`rounded py-2 text-center transition-colors ${
            isSignup ? "bg-white text-text-strong shadow-sm" : "text-text-muted"
          }`}
        >
          إنشاء حساب جديد
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-text-strong">
        {isSignup ? "أهلًا بك في فوغا" : "تسجيل الدخول"}
      </h1>
      <p className="mb-6 text-sm text-text-muted">
        {isSignup
          ? "أنشئي حسابك في دقائق وانضمي إلى عائلة VOGAVIP."
          : "سجّلي دخولك للاطلاع على طلباتك ونقاط VOGAVIP."}
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {isSignup && (
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="الاسم الأول"
              placeholder="مثال: نور"
              value={firstName}
              onChange={setFirstName}
              required
            />
            <Field
              label="الاسم الأخير"
              placeholder="مثال: العبدالله"
              value={lastName}
              onChange={setLastName}
              required
            />
          </div>
        )}

        <Field
          label="البريد الإلكتروني"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={setEmail}
          required
        />

        {isSignup && (
          <Field
            label="رقم الجوال"
            type="tel"
            placeholder="‎+966 5_ ___ ____"
            value={phone}
            onChange={setPhone}
          />
        )}

        <Field
          label="كلمة المرور"
          type="password"
          placeholder={isSignup ? "8 أحرف على الأقل" : "كلمة المرور"}
          value={password}
          onChange={setPassword}
          required
        />

        {isSignup && (
          <Field
            label="تاريخ الميلاد (للحصول على هدية عيد ميلادك)"
            type="date"
            value={birthday}
            onChange={setBirthday}
          />
        )}

        {!isSignup && (
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-text-muted">
              <input type="checkbox" className="h-4 w-4 accent-primary" />
              تذكّريني
            </label>
            <Link href="#" className="text-primary hover:underline">
              نسيت كلمة المرور؟
            </Link>
          </div>
        )}

        {isSignup && (
          <label className="flex items-start gap-2 text-xs text-text-muted">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-primary"
              defaultChecked
            />
            <span>
              بإنشاء الحساب، أوافق على{" "}
              <Link href="/terms" className="text-primary underline">
                الشروط والأحكام
              </Link>{" "}
              وأرغب بالانضمام إلى VOGAVIP لكسب النقاط والمكافآت.
            </span>
          </label>
        )}

        {error && (
          <p className="rounded-md border border-sale/30 bg-sale/5 px-3 py-2 text-xs text-sale">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-cta w-full disabled:opacity-60">
          {submitting
            ? "جاري المعالجة..."
            : isSignup
              ? "إنشاء الحساب"
              : "تسجيل الدخول"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-text-subtle">
        <span className="flex-1 border-t border-border" />
        <span>أو</span>
        <span className="flex-1 border-t border-border" />
      </div>

      <div className="space-y-2">
        <SocialButton label="المتابعة باستخدام Google" />
        <SocialButton label="المتابعة باستخدام Apple" />
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-text-strong">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function SocialButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="w-full rounded-md border border-border bg-white px-4 py-2.5 text-sm font-medium text-text-strong transition-colors hover:bg-bg-soft"
    >
      {label}
    </button>
  );
}
