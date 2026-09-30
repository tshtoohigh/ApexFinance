# RS Finance

*Powered by RS Corp* · v2.0.0

A personal finance app built around **total net worth**, not just bank balances. Your cash, investments, crypto, and physical assets — watches, sneakers, jewelry, cars, resale inventory — all in one number.

Your data lives in **Supabase** (Postgres, per-user row-level security), so it follows you across devices instead of being trapped in one browser.

---

## What it actually does

| Area | What it does |
|------|-------------|
| **Net worth** | Cash + investments + live crypto + physical assets, tracked daily as a trend |
| **Assets** | Log anything with value across 16 categories, grouped by *why* you own it |
| **Activity** | Log income and expenses; quick-tap buttons for common expenses |
| **Bills** | Recurring subscriptions with monthly and yearly burn totals |
| **Goals** | Savings targets with a projected completion date from your contribution rate |
| **Crypto** | Prices pulled live from CoinGecko every 60s — you store only the amount you hold |
| **Yield** | Flags idle cash and estimates what you're leaving on the table at current APYs |
| **Risk Radar** | Scores your actual allocation for concentration, liquidity, and volatility |

### The intent model

Every physical asset is tagged with **why you own it** — the thing that actually changes how it should be counted:

- **Personal** — you own it and use it. Counted in net worth, excluded from returns.
- **Investment** — bought to hold and appreciate. Counted as deployed capital.
- **Resale** — inventory you intend to flip. Counted as deployed capital.

Return on investment is only calculated on *deployed capital* (investment + resale). Your couch shouldn't drag down your portfolio performance, and your daily-wear watch isn't a loss just because it depreciated.

---

## Setup

You need **Node.js 18+** and a free **Supabase** account. Nothing else is required — CoinGecko needs no key.

### 1. Create the database

In your Supabase project: **SQL Editor → New Query**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql), and hit **Run**.

That one file creates all 9 tables, every security policy, and the signup trigger. It's safe to run more than once, so if anything fails you can fix it and re-run the whole thing.

Then turn off email confirmation so you can log in immediately: **Authentication → Providers → Email → uncheck "Confirm email" → Save**.

### 2. Point the app at your project

In `src/lib/supabase.ts`, set your project URL and anon key (found in Supabase under **Project Settings → API**). The anon key is safe to ship in the client — row-level security is what protects the data.

### 3. Run it

```bash
git clone https://github.com/tshtoohigh/ApexFinance.git
cd ApexFinance
npm install
npm run dev
```

Open `http://localhost:5173`, sign up, and the onboarding flow will walk you through your name, income, budget, and first accounts.

To open it on your phone on the same Wi-Fi, run `npm run dev -- --host` and use the network URL it prints.

---

## Android APK

The app is a PWA, so it installs from the browser via **Add to Home Screen**. For a real installable APK, see [`BUILD_APK.md`](BUILD_APK.md) — the short version:

```bash
npm run build
npx cap sync
npx cap open android   # then Build → Generate App Bundles or APKs → Generate APKs
```

---

## AI assistant (optional)

The AI advisor runs through a **Supabase Edge Function**, not the browser, so your OpenRouter key is never exposed to clients. Deploy it with:

```bash
supabase functions deploy chat --no-verify-jwt --use-api
supabase secrets set OPENROUTER_API_KEY=your_key_here
```

It tries several free models in order and degrades gracefully if they're all rate-limited. The app works fully without it.

---

## Tech stack

React 18 · TypeScript · Vite 5 · Tailwind CSS · Zustand · Recharts · Supabase (auth + Postgres + Edge Functions) · Capacitor · CoinGecko API

Full architectural detail and rationale in [`TECH_STACK.md`](TECH_STACK.md).

---

## Privacy and honesty

- Your rows are readable only by you, enforced in Postgres by row-level security — not just by app code.
- The AI assistant receives a summary of your finances only while you're actively chatting, and nothing is stored on OpenRouter's side.
- CoinGecko receives no personal data — only the coin symbols being priced.
- **Settings → "Delete All Data & Log Out"** wipes everything.

RS Finance does not connect to your bank, move money, or execute trades. Balances are entered by you. Yield and risk figures are estimates to help you think, not financial advice. See [`src/pages/Terms.tsx`](src/pages/Terms.tsx) for the full disclaimer.
