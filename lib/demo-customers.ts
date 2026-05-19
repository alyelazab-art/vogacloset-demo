// Pre-seeded demo customer accounts.
// Auto-loaded into localStorage on first app boot. Lets Dana / Aly sign in as
// any tier persona with one click on the /auth page.
//
// Password is the same for all demo accounts: `voga`
// (Visible in the auth-page quick-pick UI, so no security pretense.)

import type { Tier } from "./types";

export const DEMO_PASSWORD = "voga";

export type DemoSeed = {
  id: string;          // Stable customerId — same across all clones of this repo
  email: string;
  firstName: string;
  lastName: string;
  birthday: string;
  tier: Tier;
  seedOrders?: {
    daysAgo: number;
    totalPaid: number;
  }[];
  blurb: string;
};

export const DEMO_CUSTOMERS: DemoSeed[] = [
  {
    id: "voga-noura",
    email: "blue@voga.demo",
    firstName: "نورا",
    lastName: "(Blue)",
    birthday: "1996-03-15",
    tier: "blue",
    blurb: "عضوة جديدة — مستوى Blue، بدون طلبات سابقة",
  },
  {
    id: "voga-laila",
    email: "gold@voga.demo",
    firstName: "ليلى",
    lastName: "(Gold)",
    birthday: "1992-07-22",
    tier: "gold",
    seedOrders: [
      { daysAgo: 25, totalPaid: 480 },
      { daysAgo: 12, totalPaid: 220 },
    ],
    blurb: "متسوّقة نشطة — مستوى Gold، طلبان حديثان",
  },
  {
    id: "voga-sara",
    email: "platinum@voga.demo",
    firstName: "سارة",
    lastName: "(Platinum)",
    birthday: "1988-11-03",
    tier: "platinum",
    seedOrders: [
      { daysAgo: 50, totalPaid: 1200 },
      { daysAgo: 20, totalPaid: 850 },
      { daysAgo: 5, totalPaid: 420 },
    ],
    blurb: "إنفاق مرتفع — مستوى Platinum",
  },
  {
    id: "voga-reem",
    email: "diamond@voga.demo",
    firstName: "ريم",
    lastName: "(Diamond)",
    birthday: "1985-05-30",
    tier: "diamond",
    seedOrders: [
      { daysAgo: 80, totalPaid: 2400 },
      { daysAgo: 40, totalPaid: 1850 },
      { daysAgo: 15, totalPaid: 1100 },
      { daysAgo: 3, totalPaid: 760 },
    ],
    blurb: "VIP — مستوى Diamond، إنفاق عالٍ ومتكرر",
  },
  {
    id: "voga-hind",
    email: "lapsed@voga.demo",
    firstName: "هند",
    lastName: "(Lapsed)",
    birthday: "1990-09-18",
    tier: "gold",
    seedOrders: [
      { daysAgo: 95, totalPaid: 600 },
      { daysAgo: 120, totalPaid: 320 },
    ],
    blurb: "عميلة منقطعة — آخر طلب قبل 95 يومًا (يحفّز Win-Back)",
  },
  // Fresh-by-design personas — single-use for First Order Reward demos.
  // Each one is unknown to Gameball until first signin, so the First Order
  // template campaign fires for them. Five gives runway for repeated demos
  // before we need to rotate (or wipe their Gameball records via dashboard).
  {
    id: "voga-fresh-1",
    email: "fresh1@voga.demo",
    firstName: "جنى",
    lastName: "(Fresh 1)",
    birthday: "1995-04-12",
    tier: "blue",
    blurb: "حساب جديد بالكامل — يحفّز First Order Reward",
  },
  {
    id: "voga-fresh-2",
    email: "fresh2@voga.demo",
    firstName: "لينا",
    lastName: "(Fresh 2)",
    birthday: "1994-08-20",
    tier: "blue",
    blurb: "حساب جديد بالكامل — يحفّز First Order Reward",
  },
  {
    id: "voga-fresh-3",
    email: "fresh3@voga.demo",
    firstName: "منى",
    lastName: "(Fresh 3)",
    birthday: "1993-02-05",
    tier: "blue",
    blurb: "حساب جديد بالكامل — يحفّز First Order Reward",
  },
  {
    id: "voga-fresh-4",
    email: "fresh4@voga.demo",
    firstName: "تالا",
    lastName: "(Fresh 4)",
    birthday: "1997-11-29",
    tier: "blue",
    blurb: "حساب جديد بالكامل — يحفّز First Order Reward",
  },
  {
    id: "voga-fresh-5",
    email: "fresh5@voga.demo",
    firstName: "روى",
    lastName: "(Fresh 5)",
    birthday: "1996-06-17",
    tier: "blue",
    blurb: "حساب جديد بالكامل — يحفّز First Order Reward",
  },
];
