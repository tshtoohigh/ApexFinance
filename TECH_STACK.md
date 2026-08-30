# Apex Finance — Technical Overview

A complete breakdown of every tool, language, and architectural decision used to build this app. Written so a developer can understand and rebuild the project themselves with minimal AI assistance.

---

## 1. Languages

| Language | Where it's used | Why |
|----------|----------------|-----|
| **TypeScript** | All app code (`.ts`, `.tsx`) | Type safety catches bugs before runtime. A typed superset of JavaScript. |
| **JSX / TSX** | React components | HTML-like syntax inside TypeScript for building UI |
| **CSS** | `index.css` + Tailwind utility classes | Styling |
| **SQL (PostgreSQL dialect)** | `supabase/schema.sql` | Database tables, security policies, triggers |
| **HTML** | `index.html` | Single entry point the app mounts into |

---

## 2. Core Framework & Build Tools

| Tool | Version | Role | Docs |
|------|---------|------|------|
| **React** | 18.3 | UI library — component-based rendering | react.dev |
| **Vite** | 5.2 | Build tool + dev server (fast hot-reload) | vitejs.dev |
| **Node.js** | 18+ | JavaScript runtime that runs the tooling | nodejs.org |
| **npm** | bundled with Node | Package manager | — |

> **Why Vite over Create-React-App?** Vite is dramatically faster (native ES modules) and CRA is deprecated. It's the modern default.

---

## 3. Styling

| Tool | Role |
|------|------|
| **Tailwind CSS 3.4** | Utility-first CSS — style with classes like `flex gap-2 text-white` instead of separate CSS files |
| **PostCSS + Autoprefixer** | Processes Tailwind and adds browser prefixes |
| **clsx + tailwind-merge** | Conditionally combine class names without conflicts (the `cn()` helper in `src/lib/cn.ts`) |

> The entire design system (colors, fonts, spacing) is defined once in `tailwind.config.ts`. e.g. `bg-accent` → `#00F0FF`.

---

## 4. Routing & State Management

| Tool | Role | Why chosen |
|------|------|-----------|
| **React Router 6** | Navigation between pages (`/`, `/yield`, `/bills`…) | Industry standard for React single-page apps |
| **Zustand** | Global state management | Simpler than Redux — one store file, minimal boilerplate. Holds all financial data and syncs it to Supabase |

> **Zustand pattern:** `src/stores/useFinanceStore.ts` holds all app state. Every action updates local state AND writes to the database in the same function.

---

## 5. Backend / Database — Supabase

Supabase is a **Backend-as-a-Service** built on PostgreSQL. It replaces the need to build a custom server.

| Feature | What it does |
|---------|-------------|
| **Supabase Auth** | Email/password + Google sign-in, JWT session management |
| **PostgreSQL Database** | Stores all user data in relational tables |
| **Row Level Security (RLS)** | Database-level rules so a user can only access their own rows |
| **Edge Functions** | Serverless Deno functions (used to hide the AI API key server-side) |
| **`@supabase/supabase-js`** | Client library to talk to Supabase from React |

> **Key security concept — RLS:** Instead of checking permissions in app code (bypassable), the *database itself* enforces `auth.uid() = user_id`. Even if the frontend is compromised, other users' data stays private.

---

## 6. External APIs

| API | Purpose | Cost |
|-----|---------|------|
| **CoinGecko API** | Live crypto prices (BTC, ETH, SOL…) | Free, no key required |
| **OpenRouter API** | AI chatbot (Llama 3.1 model) | Free tier |

> The OpenRouter key lives in a **Supabase Edge Function** (server-side), so it's never exposed in the browser — a critical security practice.

---

## 7. Icons & Charts

| Tool | Role |
|------|------|
| **Lucide React** | SVG icon library (Home, TrendingUp, etc.) — replaces emojis |
| **Recharts** | Chart library for the wealth-projection graphs |

---

## 8. PWA (Progressive Web App)

Makes the web app **installable** on phones like a native app.

| File | Role |
|------|------|
| `public/manifest.json` | App name, icons, theme color, standalone display mode |
| `public/sw.js` | Service worker — caches assets for offline use |
| `index.html` meta tags | Apple / Android "Add to Home Screen" support |

---

## 9. Version Control & Workflow

| Tool | Role |
|------|------|
| **Git** | Version control |
| **GitHub** | Remote repo hosting + code review via Pull Requests |
| **Feature branch → PR → merge** | Never push directly to `main`; changes are reviewed on a branch first |

---

## 10. Project Architecture

```
ApexFinance/
├── index.html                  # Entry point
├── package.json                # Dependencies
├── vite.config.ts              # Build config
├── tailwind.config.ts          # Design tokens (colors, fonts)
├── tsconfig.json               # TypeScript config
│
├── src/
│   ├── main.tsx                # React mounts here
│   ├── App.tsx                 # Router + auth gating logic
│   ├── index.css               # Global styles + Tailwind directives
│   │
│   ├── lib/                    # Pure logic (no UI)
│   │   ├── supabase.ts         # Database client
│   │   ├── cn.ts               # Class-name merge helper
│   │   ├── yield-engine.ts     # Yield calculations
│   │   ├── risk-engine.ts      # Risk analysis rules
│   │   └── dashboard-engine.ts # Safe-to-spend math
│   │
│   ├── stores/
│   │   └── useFinanceStore.ts  # Zustand global state
│   │
│   ├── hooks/                  # Reusable stateful logic
│   │   ├── useAuth.ts          # Login / signup / session
│   │   ├── useChatbot.ts       # AI chat
│   │   └── useCryptoPrices.ts  # CoinGecko fetching
│   │
│   ├── components/
│   │   ├── ui/                 # Reusable primitives (Button, Card, Input…)
│   │   ├── layout/             # NavBar, PageWrapper
│   │   └── chatbot/            # Chat panel
│   │
│   └── pages/                  # One file per screen
│       ├── Login.tsx
│       ├── Onboarding.tsx
│       ├── Dashboard.tsx
│       ├── Yield.tsx
│       ├── Bills.tsx
│       ├── Goals.tsx
│       ├── Radar.tsx
│       └── Settings.tsx
│
└── supabase/
    ├── schema.sql              # Database tables + RLS policies
    └── functions/chat/         # AI proxy Edge Function
```

**Architectural principle — Separation of concerns:**
- `lib/` = pure math/logic (testable, no UI)
- `stores/` = global state
- `hooks/` = reusable stateful logic
- `components/` = presentational, reusable UI pieces
- `pages/` = screens that compose everything together

---

## 11. How to Recreate the Dependency Set

```bash
# Scaffold a Vite + React + TypeScript project
npm create vite@latest apex-finance -- --template react-ts
cd apex-finance

# Runtime dependencies
npm install react-router-dom zustand @supabase/supabase-js recharts lucide-react clsx tailwind-merge

# Dev dependencies (styling)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 12. Suggested Learning Path (from zero)

1. **JavaScript fundamentals** → then **TypeScript basics**
2. **React** — components, props, state, `useState`, `useEffect`
3. **React Router** — page navigation
4. **Tailwind CSS** — utility classes
5. **Zustand** — global state (learnable in ~30 min)
6. **Supabase** — their React quickstart covers auth + database + RLS
7. **Fetch API / async-await** — for CoinGecko + OpenRouter calls
8. **Git + GitHub** — branches, commits, pull requests
9. **PWA basics** — manifest + service worker

---

## 13. Running It Locally

```bash
git clone https://github.com/tshtoohigh/ApexFinance.git
cd ApexFinance
npm install
npm run dev
```

Then set up the database by running `supabase/schema.sql` in the Supabase SQL Editor (see the main README for step-by-step instructions).
