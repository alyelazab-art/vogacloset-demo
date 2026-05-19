// Top-level categories — mirror vogacloset.com/saudi/ar/ nav exactly.

export type Category = {
  slug: string;
  labelAr: string;
  labelEn: string;
  href: string;
  // Hero image lives in /public/voga/heroes/<slug>.webp (downloaded from Voga's CDN)
  heroImage: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "women",
    labelAr: "النساء",
    labelEn: "Women",
    href: "/category/women",
    heroImage: "/voga/heroes/women.webp",
  },
  {
    slug: "men",
    labelAr: "الرجال",
    labelEn: "Men",
    href: "/category/men",
    heroImage: "/voga/heroes/men.webp",
  },
  {
    slug: "kids",
    labelAr: "الأطفال",
    labelEn: "Kids",
    href: "/category/kids",
    heroImage: "/voga/heroes/kids.webp",
  },
  {
    // Real Voga site uses "التجميل" not "الجمال"
    slug: "beauty",
    labelAr: "التجميل",
    labelEn: "Beauty",
    href: "/category/beauty",
    heroImage: "/voga/heroes/beauty.webp",
  },
  {
    slug: "home",
    labelAr: "المنزل",
    labelEn: "Home",
    href: "/category/home",
    heroImage: "/voga/heroes/home.webp",
  },
];

// Regional storefronts — exactly matches the 10 markets in Voga's real footer
// (alphabetical Arabic order on the live site).
export const REGIONS = [
  { code: "bh", labelAr: "البحرين", labelEn: "Bahrain" },
  { code: "iq", labelAr: "العراق", labelEn: "Iraq" },
  { code: "jo", labelAr: "الأردن", labelEn: "Jordan" },
  { code: "kz", labelAr: "كازاخستان", labelEn: "Kazakhstan" },
  { code: "kw", labelAr: "الكويت", labelEn: "Kuwait" },
  { code: "ly", labelAr: "ليبيا", labelEn: "Libya" },
  { code: "om", labelAr: "عمان", labelEn: "Oman" },
  { code: "qa", labelAr: "قطر", labelEn: "Qatar" },
  { code: "sa", labelAr: "المملكة العربية السعودية", labelEn: "Saudi Arabia" },
  { code: "ae", labelAr: "الإمارات العربية المتحدة", labelEn: "UAE" },
];

// Brands carried in the favorite-brands carousel. Real Voga brand logos
// downloaded to /public/voga/brands/. Karen Millen is intentionally
// featured for Use Case 7 (Brand Campaign demo).
export const BRANDS = [
  { slug: "karen-millen", name: "Karen Millen", nameAr: "كارين ميلين", logo: "/voga/brands/karen-millen.webp" },
  { slug: "club-l-london", name: "Club L London", nameAr: "كلوب ال لندن", logo: "/voga/brands/club-l-london.webp" },
  { slug: "boohoo", name: "Boohoo", nameAr: "بوهو", logo: "/voga/brands/boohoo.webp" },
  { slug: "boohoo-man", name: "BoohooMAN", nameAr: "بوهو مان", logo: "/voga/brands/boohoo-man.webp" },
  { slug: "prettylittlething", name: "Prettylittlething", nameAr: "بريتي ليتل ثينق", logo: "/voga/brands/prettylittlething.webp" },
  { slug: "trendyol", name: "Trendyol", nameAr: "ترينديول", logo: "/voga/brands/trendyol.webp" },
  { slug: "kerastase", name: "Kerastase", nameAr: "كيراستاس", logo: "/voga/brands/kerastase.webp" },
];

// Payment methods displayed in the strip beneath the homepage hero.
// Real Voga payment icons downloaded to /public/voga/payments/.
export const PAYMENT_METHODS = [
  { id: "tabby", name: "Tabby", logo: "/voga/payments/tabby.webp" },
  { id: "tamara", name: "Tamara", logo: "/voga/payments/tamara.webp" },
  { id: "mada", name: "مدى", logo: "/voga/payments/mada.webp" },
  { id: "visa", name: "Visa", logo: "/voga/payments/visa.webp" },
  { id: "mastercard", name: "Mastercard", logo: "/voga/payments/mastercard.webp" },
  { id: "applepay", name: "Apple Pay", logo: "/voga/payments/applepay.webp" },
  { id: "paypal", name: "PayPal", logo: "/voga/payments/paypal.webp" },
  { id: "cod", name: "الدفع عند الاستلام", logo: "/voga/payments/cod.webp" },
];

// App download badges — real Voga SVGs downloaded to /public/voga/badges/
export const APP_BADGES = [
  { id: "app-store", label: "App Store", logo: "/voga/badges/app-store.svg", href: "https://app.adjust.com/7z6fvhn" },
  { id: "google-play", label: "Google Play", logo: "/voga/badges/google-play.svg", href: "https://app.adjust.com/7z6fvhn" },
  { id: "appgallery", label: "AppGallery", logo: "/voga/badges/appgallery.svg", href: "https://appgallery.huawei.com/app/C103845009" },
];
