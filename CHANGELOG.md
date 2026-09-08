# Changelog

## v1.8.0 — Contrast Overhaul

Fixes the flat "dark-blue-on-dark-blue" look — the app now has real visual depth and hierarchy.

- **Layered surfaces with clear brightness steps** — the page (`#070A11`), cards (`#161E2E`), and inner tiles (`#232E43`) are now distinctly separated, so cards visibly lift off the background instead of blending in.
- **Brighter, more readable text tiers** — secondary text (`#AEBAD0`) and labels (`#6B7A93`) are lifted for legibility.
- **Visible borders** — card edges (`#2E3B52`) actually show now.
- **Stronger elevation shadows** so cards have depth against the deeper background.
- **Punchier accent + status colors** (cyan, green, red, amber, purple) that pop against the more neutral surroundings.
- Updated chart, tooltip, PWA manifest, and theme colors to match.

## v1.7.0 — Professional Polish

- **New professional app icon** — a custom RS monogram with a growth-bar motif and cyan gradient, replacing the generic placeholder. Applied to the PWA icons, favicon, and Android app.
- **Reusable BrandMark component** — consistent RS logo on the login and onboarding screens (no more generic layers icon).
- **Refined Dashboard** — time-of-day greeting, a user avatar, a bolder net-worth hero with a glassy sheen, stat tiles on a surface background, and consistent currency formatting throughout (fixed the mismatched raw number formatting).
- **Design-system upgrades** — softer layered shadows, a subtle card sheen edge, and a rise-in animation for hero numbers, so the app feels more polished and less template-y.

## v1.6.0 — RS Finance Rebrand

- **Renamed from Apex Finance → RS Finance** across the entire app: login, onboarding, terms, chatbot, update screens, PWA manifest, page title, and Android app config.
- **"Powered by RS Corp"** branding added to the login screen, Settings footer, and Terms page.
- Android app ID updated to `com.rscorp.rsfinance`.
- AI assistant renamed to **RS AI**.
- No functional/logic changes — this is a branding release.

## v1.5.0 — Quick-Tap Logging

Makes expense tracking effortless — no more typing every field.

- **Quick Log grid** on the Activity tab — 12 colorful category tiles (Food, Coffee, Groceries, Transport, etc.). Tap one to log in seconds.
- **Number-pad entry** — a calculator-style bottom sheet opens on tap: enter the amount, add an optional note, confirm. Logging takes ~3 seconds.
- **"Spent Today" spotlight** — the Activity tab now leads with today's spending so you get an instant answer to "how am I doing?"
- **Category colors & icons everywhere** — a shared category config gives every expense a consistent icon + color across the Quick Log grid, transaction history, and spending breakdown. The app feels alive instead of monochrome.
- **One-tap Income** button for logging money in.
- **Manual entry** is still available (collapsible) as a fallback for edge cases.

## v1.4.0 — Version Gate

- **Server-controlled update system** (like Pokémon GO's "update to continue").
  - New `app_config` table in Supabase holds `min_version` + `latest_version`.
  - On launch the app compares its built-in version against the server.
  - Below `min_version` → full-screen **Update Required** block.
  - Below `latest_version` (but above min) → dismissible **Update Available** banner.
  - Fails open: if config can't be read, the app is never blocked.
- **To use it:** run `supabase/migrations/v1.4_app_config.sql`, then edit the `app_config` row in Supabase whenever you want to prompt/force updates.

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
