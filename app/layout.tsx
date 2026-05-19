// Root layout — Gameball widget defaults to bottom-left per its container's
// gb_left class (set in the trial workspace dashboard).
import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Providers } from "./providers";

const GAMEBALL_API_KEY = process.env.NEXT_PUBLIC_GAMEBALL_API_KEY ?? "";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "فوغا كلوزيت | Voga Closet",
  description:
    "اكتشف أحدث صيحات الموضة من ماركاتك المفضلة. توصيل سريع، إرجاع مجاني.",
  icons: {
    icon: "/brand/favicon.png",
    apple: "/brand/voga-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>

        {/* Gameball widget — Phase 1: inits in guest mode (empty playerUniqueId).
            Phase 2 wires post-login identification via window.GbSdk re-init.
            Raw <script> (not next/script) because the widget's downstream
            asset-URL resolution gets confused by Next's dynamic injection. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.GbLoadInit = function() {
              if (typeof GbSdk === 'undefined') return;
              GbSdk.init({
                APIKey: '${GAMEBALL_API_KEY}',
                lang: 'ar',
                playerUniqueId: '',
                playerAttributes: {}
              });
            };`,
          }}
        />
        <script
          defer
          src="https://assets.gameball.co/widget/js/gameball-init.min.js"
        />
      </body>
    </html>
  );
}
