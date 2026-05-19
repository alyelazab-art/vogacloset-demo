# Voga Closet × Gameball — Internal Demo

A Voga-Closet-skinned Next.js storefront wired to Gameball's loyalty platform. Built as an internal POC so the team can click through how Gameball would land on Voga's site end-to-end.

## Quick start

```bash
git clone <this-repo>
cd vogacloset-demo
npm install
npm run dev
```

Open http://localhost:3000. **No setup steps in Gameball.** The repo ships with working API keys for the Voga trial workspace at https://app.gameball.co — everyone using this repo shares that workspace.

## How to test the loyalty flow

The site has 10 pre-seeded demo personas. All passwords = `voga`. Customer IDs are **stable across machines** (everyone's Laila is the same `voga-laila` in Gameball).

**Tiered personas — use for tier / multiplier / repeat-purchase demos:**

| Email | Persona | Tier | Story |
|---|---|---|---|
| `blue@voga.demo` | نورا (Noura) | Blue | Fresh signup, no order history (signed-in once) |
| `gold@voga.demo` | ليلى (Laila) | Gold | Active shopper, 2 recent orders |
| `platinum@voga.demo` | سارة (Sara) | Platinum | High spender, 3 orders |
| `diamond@voga.demo` | ريم (Reem) | Diamond | VIP, 4 orders |
| `lapsed@voga.demo` | هند (Hind) | Gold | Last order 95 days ago — triggers Win-Back |

**Fresh personas — single-use, for First Order Reward demos:**

| Email | Persona | Tier | Use after |
|---|---|---|---|
| `fresh1@voga.demo` | جنى (Fresh 1) | Blue | brand-new — never seen by Gameball until first signin |
| `fresh2@voga.demo` | لينا (Fresh 2) | Blue | brand-new |
| `fresh3@voga.demo` | منى (Fresh 3) | Blue | brand-new |
| `fresh4@voga.demo` | تالا (Fresh 4) | Blue | brand-new |
| `fresh5@voga.demo` | روى (Fresh 5) | Blue | brand-new |

Each fresh persona "burns" once she signs in + places her first order — after that, Gameball knows her, so the First Order Reward campaign won't fire again. Five gives you ~5 repeatable First-Order demos before you need to rotate.

**Easiest flow:**
1. Open http://localhost:3000 — Gameball widget bubble appears bottom-left
2. Click the widget → "Sign in" → lands on `/auth`
3. Click the **ليلى (Gold)** quick-pick → auto-signs you in as Laila
4. Widget identifies her → shows her balance/tier from Gameball
5. Check the Gameball dashboard (https://app.gameball.co → Customers) to see her record

## Repo layout

- `app/` — Next.js App Router (pages, components, API routes)
- `app/api/gameball/` — server-side proxies to Gameball's REST API (keep the secret key off the browser)
- `lib/` — auth + cart + orders contexts, widget wrapper, types
- `lib/demo-customers.ts` — pre-seeded personas (5 tiered + 5 "fresh" for repeat First-Order demos)
- `next.config.ts` — rewrites `/dist/widget/:path*` → Gameball CDN (widget has a localhost self-host special case)

## Architecture notes

Full multi-session build history (what's shipped, what's planned, how Voga's use cases map to Gameball features) lives in Aly's internal Brain workspace, outside this repo. See the [**Voga use cases — Gameball POC status**](#voga-use-cases--gameball-poc-status) section below for the per-use-case scorecard.

## API keys

Committed in `.env.local`. Voga trial workspace only — rotate via the dashboard if compromised.
- `GAMEBALL_API_KEY` — public API key
- `GAMEBALL_TRANSACTION_KEY` — server-only secret key
- `NEXT_PUBLIC_GAMEBALL_API_KEY` — same as API key, browser-exposed for the widget script

## Voga use cases — Gameball POC status

Working tracker for everything Dana (Voga's Loyalty Manager) asked for across the email thread. Six columns: ask ID, short name, the full verbatim spec from her emails (so you don't need to scroll back up), where it stands in code+dashboard, whether it's been actually tested, and notes on what's next or where blockers remain.

**Legend**
- **Status:** ✅ Live · 🟢 Dashboard configured · ⚪ Not configured yet · ⬜ Code-side ready, awaiting dashboard
- **Tested?:** ✅ Fired correctly · ❌ Tested — didn't fire · ⏳ Not tested · — (n/a)
- **Notes:** 🔴 hard platform blocker · 🟡 awaiting clarification · plain text = needs dashboard/config work

| # | Ask | Verbatim spec (Dana's email) | Status | Tested? | Notes |
|---|-----|------------------------------|--------|---------|-------|
| F1 | Earn & Burn Loyalty Points | Customers earn **1 point per $1 spent**. Points awarded after successful order completion in **pending status**. Pending becomes active after **one of**: (a) **30 days from order creation**, OR (b) **21 days after order reaches "Delivered" status**. Customers should be able to **redeem points during checkout**. | ✅ Live | ✅ Verified (Reem 811.9 SAR → 2118 pts at Diamond 3×; Sara burned 500 pts on checkout) | Partial support, either 30 days after order submission or the order gets sent to gameball once it is delivered and we start the 21 days counter |
| F2 | Tier-Based Loyalty Program (4 tiers) | **T1** entry-level after first order → 1 pt/$1 · **T2** spend threshold $100 → 1 pt/$1 · **T3** spend threshold $300 → **2 pts/$1** · **T4** spend threshold $500 → **3 pts/$1** | ✅ Live | ✅ Verified | none |
| 1 | Normal Orders (ongoing) | Customers earn points based on their **current tier**: T1 & T2 → 1 pt/$1 ; T3 → 2 pts/$1 ; T4 → 3 pts/$1. Points valid **6 months from activation date**. Points tagged **"Normal Order"**. | ✅ Live (untagged) | ✅ Verified | Tag — rename the earn rule literally "Normal Order" so Gameball's auto-derived tag matches |
| 2 | Birthday Campaign (ongoing) | Triggered **once yearly on customer's birthday**. Limited to **1 reward per customer annually**. Points should **activate immediately** + **expire after 30 days**. Tagged **"Birthday Points"**. Rewards by tier: **T1: 100 pts · T2: 200 pts · T3: 300 pts · T4: 400 pts**. | 🟢 Configured | ⏳ Can't test on demand (fires on real DOB only) | none |
| 3 | First Order Reward (ongoing) | Triggered on customer's **first order only**. Reward: **500 pts**. Limited to **1 per customer lifetime**. Rules: (a) no previous completed orders exist; (b) basket value > 0. Reward points expire **90 days from activation**, tagged **"Welcome Reward"**. | ✅ Live | ✅ Verified (Fresh-1 placed first order → 500 active welcome pts) | Tag — confirm campaign name = "Welcome Reward" exactly |
| 4 | Basket Value (valid 1 week) | **Spend $100 → 2× points (60d expiry)** · **Spend $101–150 → 3× points (60d)** · **Spend above $150 → 4× points (60d)**. Campaign itself runs for 1 week. | 🟢 Configured | ❌ Tested all 3 brackets with fresh personas — no multiplier applied | Likely dashboard misconfig — recheck activation, subtotal vs totalPaid, bracket bound math |
| 5 | Basket Size (valid 2 weeks) | **Buy 2 items → 2× (60d)** · **Buy 3 items → 3× (60d)** · **Buy 4 items → 4× (60d)** · **Buy 5+ items → 5× (60d)**. Campaign itself runs for 2 weeks. | ⚪ Not configured | — | 🔴 Gameball UI rejects `min == max` ("Missing required fields") — no equals operator. Per-qty tiers can't be expressed as multiplier brackets. |
| 6 | Category Campaign (valid 1 month) | 5 categories exist: **Women, Men, Kids, Beauty, Home**. Bonus by category-diversity in a single order: **2 different categories → +200 pts** · **3 → +300** · **4 → +400** · **5 → +500**. Bonus points valid **60d from activation**, tagged **"Category Bonus Points"**. | ⬜ Code-side wired 2026-05-19 (custom event); awaiting dashboard automations | — | 🔴 Gameball builder has no `COUNT(DISTINCT)` operator → resolved by code-side custom event + 4 dashboard automations segmented on `attributes.distinctCategoryCount == 2/3/4/5` |
| 7 | Brand Campaign — Karen Millen (valid 15 days) | Customers who purchase from the **"Karen Millen" brand** receive **6× points**. Reward limited to **1 time per customer**. Points valid **60d from activation**, tagged **"KM"**. Campaign itself runs for 15 days. | ✅ Configured by Aly 2026-05-19 | ⏳ Not yet tested end-to-end | none |
| 8 | Repeat Purchase / Retention | Place the next order **within 60 days from previous order** → **500 bonus pts**. Reward limited to **1 time per customer**. Bonus points valid **60d from activation**, tagged **"Extra Points"**. | 🟢 Configured | ❌ Tested Fresh-5 with 2-order sequence within 2s — didn't fire | 🔴 Tag override — can't set tag to "Extra Points" (Gameball auto-derives from campaign name). Plus dashboard recheck needed on why trigger didn't fire. |
| A | Spin the Wheel (gamification, discovery ask) | Dana hasn't specified prize amounts — this is a **discovery walkthrough request**. Her exact words: *"we would like to understand how prizes can be configured and distributed across multiple languages and countries, especially for limited rewards such as a single winner."* Sub-questions covered by C/D/E rows below. | 🟢 Configured by Aly 2026-05-19 | ⏳ Not yet tested | 🟡 Three open configuration questions raised during setup: (1) how to set per-language prize copy in the UI — see row D · (2) how "single winner" is actually enforced — Aly set "win once" but with 1% probability, unclear if that means each spin has 1% chance (many possible winners) vs hard 1-total-winner cap — see row E · (3) need Dana to confirm which languages Voga wants prizes localized in (presumably AR + EN at minimum across the 8 markets) |
| B | Gift Box (gamification, discovery ask) | Same as A — Dana grouped "Spin the Wheel" **and** "Gift Box" in the same ask. No specific prize values yet — wants to see what's configurable. | ⚪ — | — | 🔴 Confirmed not doable on Gameball platform (Aly verified 2026-05-19) |
| C | Multi-country prize distribution (sub-ask of A/B) | Sub-question of A/B: *"prizes…distributed across multiple languages and countries"*. Dana wants to know: can a Spin/Gift Box game show different prizes per country (Voga has 8 markets) from a single configuration? | ⚪ — | — | Awaiting Solutions Eng walkthrough |
| D | Multi-language prize distribution (sub-ask of A/B) | Sub-question of A/B: prize names/descriptions localized per language for the same game. | ⚪ — | — | 🟡 Configuration question raised during Spin & Win setup — unclear where in the Gameball UI to set per-language prize copy. Plus needs Dana to confirm which specific languages Voga wants supported. |
| E | Single-winner / limited-prize mechanic (sub-ask of A/B) | Sub-question of A/B: *"especially for limited rewards such as a single winner."* How does Gameball enforce "only 1 customer ever wins this prize" (or N winners total) across spins, across markets? | ⚪ — | — | 🟡 Configuration question raised during Spin & Win setup — "win once" configured with 1% probability. Need Solutions Eng to confirm whether 1% means each spin has 1% chance (so many people can win) vs a hard "1 total winner ever" cap. |
| F | Spending streak mechanics (discovery ask) | *"Spending streak mechanics (e.g., complete X orders within Y period), as well as the flexibility of the rules in this setup (e.g., excluding canceled orders, including only specific order statuses, etc.)."* Discovery walkthrough request — Dana wants to know what's configurable (X and Y, status filters, exclude-cancelled). | ⬜ Approach identified — not yet configured | — | Same shape as #8 (Gameball automation campaign with "X orders in Y period" trigger). Not yet built in dashboard. Once configured, will need testing similar to #8 — and the same firing issues #8 hit may recur (activation, exclude-cancelled filter if Dana wants it). |
| G | Expanded campaign operators | Dana asked for: **`is equal to`**, **`is less than`**, **`is less than or equal to`**, **`is greater than`**, **`is greater than or equal to`**, **`is between`**, **`is one of`**, plus exclusion operators **`not equal to`**, **`not one of`**. | ✅ Confirmed natively supported | — (capability check) | none — verified 2026-05-19 that all of Dana's enumerated operators are available in the Gameball builder |
| H | Multiplier flexibility | Dana's exact words: *"Enabling more flexibility for points multipliers."* No further specifics. | ✅ Confirmed natively supported | — (capability check) | none — verified 2026-05-19 that multiplier flexibility is available in the dashboard. (Worth still clarifying with Dana what specifically she meant if she has a particular pattern in mind — but the capability is present.) |
| R | Referral program (cross-market) | Customers generate a referral code from their profile. Code is **linked to advocate's profile in the market where it was generated**. When referee uses the code: (1) **Advocate earns X points**, credited in the **market where the code was created**, pending X days to ensure referee's order isn't cancelled. (2) Referee gets: **free shipping** on first order, **bonus points** if order exceeds threshold, **highest available discount** (all rules except bonus points managed Voga-side). (3) Codes reusable by same or different users, but **advocate rewarded only once per referee, only if referee's first order**. **Key constraint:** advocate and referee may belong to **different markets**, but **advocate always earns in the market where the code was originally generated**. | ⚪ Not started | — | Architecturally complex — needs dedicated session; cross-market currency handling + multi-workspace logic non-trivial |
| X1 | Multi-currency (8 markets) | Implied across the 8 Voga markets (Saudi Arabia + others). Spec implication: a single customer's loyalty record may span markets/currencies, and the points-to-discount math has to honor each market's redemption rate. | ⚪ Not started | — | POC is SAR-only — multi-workspace setup is a separate session |
| X2 | Point tagging discipline (cross-cutting) | Dana tagged **every campaign** in the 2026-05-17 email: **"Normal Order"** (#1) · **"Birthday Points"** (#2) · **"Welcome Reward"** (#3) · **"Category Bonus Points"** (#6) · **"KM"** (#7) · **"Extra Points"** (#8). This is a structural reporting/operational expectation, not a nice-to-have. | — | — | 🔴 Platform gap — Gameball auto-derives tag from campaign name; can't override. Affects #1, #2, #3, #6, #8. Workaround for some: rename campaign to literally match tag string. |
| X3 | Per-source / per-campaign point expiry (cross-cutting) | Dana named different expiry windows per campaign: **6mo** (#1) · **30d** (#2) · **90d** (#3) · **60d** (#4, #5, #6, #7, #8). She expects per-source expiry as the default, not global expiry. | ✅ Confirmed natively supported | — (capability check) | none — Gameball **does** support per-campaign expiry; each campaign sets its own expiry window in the reward config. The "global expiry only" framing in the original triage was wrong. Voga can configure Dana's full per-source expiry spec (6mo / 30d / 90d / 60d) without workaround. |

### Collection IDs reference (for dashboard Collection rules)

Order API sends `lineItem.collection: [brandSlug, category]` per item — both are matchable as Collection values.

**Brand collection IDs**

| Brand | Collection ID | Products |
|---|---|---|
| Karen Millen | `karen-millen` | 3 |
| Principles by Debenhams | `principles` | 1 |
| Coast Fashion | `coast-fashion` | 2 |
| Club L London | `club-l-london` | 1 |
| Where's That From | `wheres-that-from` | 1 |
| PrettyLittleThing | `prettylittlething` | 2 |
| BoohooMAN | `boohoo-man` | 1 |
| Voga Essentials | `voga-essentials` | 2 |
| Voga Sport | `voga-sport` | 4 |
| NEXT | `next` | 1 |
| River Island | `river-island` | 1 |
| Kerastase | `kerastase` | 1 |
| Makeup Revolution | `makeup-revolution` | 1 |
| Olaplex | `olaplex` | 1 |
| Voga Home | `voga-home` | 4 |

**Category collection IDs**

| Category | Collection ID | Products |
|---|---|---|
| Women | `women` | 9 |
| Men | `men` | 6 |
| Kids | `kids` | 3 |
| Beauty | `beauty` | 3 |
| Home | `home` | 4 |
