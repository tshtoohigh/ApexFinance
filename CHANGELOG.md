# Changelog

## v1.1.0

New features and polish focused on making Apex Finance a daily-use app.

### ✨ New Features
- **Transaction logging** — a new **Activity** tab to log income & expenses with categories. Shows monthly income/spent totals.
- **Spending breakdown + budget tracking** — see this month's spending grouped by category, with a budget-used progress bar that warns when you go over.
- **Net worth history chart** — the Dashboard now tracks your net worth over time and draws a trend line (green when growing, red when shrinking). One snapshot recorded per day automatically.
- **Inline account editing** — edit an account's name, balance, and APY directly from Settings (pencil icon) instead of deleting and re-adding.

### 💅 Polish
- **Number formatting** — consistent currency formatting with compact `$1.2K` / `$3.4M` display for large values.
- **Loading skeletons** — shimmer placeholders while crypto prices load, instead of blank/`...` states.
- **Better empty states** — friendly guidance with a call-to-action when a section has no data yet.
- Refined cards, buttons, and navigation from the earlier UI polish pass.

### 🗄️ Database
- Two new Supabase tables: `transactions` and `net_worth_history`, both with Row Level Security.
- **Migration:** run `supabase/migrations/v1.1_transactions_and_history.sql` in the Supabase SQL Editor if you already set up v1.0. Fresh setups get everything from `supabase/schema.sql`.

### 🧭 Navigation changes
- Bottom nav now: **Home · Activity · Bills · Goals · Radar · More**
- The **Yield Optimizer** moved under **More** (Settings → More Tools).

---

## v1.0.0
- Initial release: auth (Supabase), dashboard, yield optimizer, bills, goals, risk radar, AI chatbot, live crypto prices, PWA support, Android APK build.
