# Changelog

## v1.3.0 — Complete Product

The current complete build of Apex Finance. Combines all core features, the v1.1 tracking upgrades, and full edit capability across the app.

### Core (from v1.0)
- **Authentication** via Supabase (email/password) with per-user data isolation (Row Level Security)
- **Dashboard** — net worth, safe-to-spend, accounts, live crypto
- **Yield optimizer** — idle-cash detection, blended APY, opportunity cost
- **Bills & subscriptions** tracking
- **Goals** with progress tracking
- **Risk radar** — real portfolio analysis (emergency fund, concentration, crypto %)
- **AI chatbot** (OpenRouter, server-side key via Supabase Edge Function)
- **Live crypto prices** from CoinGecko (auto-refresh)
- **PWA support** + **Android APK** build path (Capacitor) with custom app icon

### Tracking upgrades (from v1.1)
- **Transaction logging** (Activity tab) — income/expenses with categories + monthly totals
- **Spending breakdown & budget tracking** — category bars + over-budget warnings
- **Net worth history chart** — auto daily snapshot with green/red trend line

### Full edit capability (new in v1.3)
Everything you enter can now be **edited**, not just added or deleted:
- **Accounts** — name, balance, APY
- **Subscriptions** — name, amount, category
- **Crypto holdings** — amount owned
- **Goals** — name, target, current progress, deadline (+ delete)

Each row has a pencil ✏️ icon → inline fields with Save / Cancel, persisted to Supabase.

### Polish
- Consistent number formatting (compact `$1.2K` / `$3.4M`)
- Loading skeletons + friendly empty states
- Refined cards, buttons, and navigation

### Database
Fresh setups: run `supabase/schema.sql` (includes all 7 tables).
Existing v1.0 setups: also run `supabase/migrations/v1.1_transactions_and_history.sql`.

### Navigation
Home · Activity · Bills · Goals · Radar · More (Yield lives under More).

---

## v1.1.0
- Transaction logging, spending breakdown/budgets, net worth history chart, inline account editing, formatting/skeleton/empty-state polish.

## v1.0.0
- Initial release: auth, dashboard, yield optimizer, bills, goals, risk radar, AI chatbot, live crypto, PWA, Android APK.
