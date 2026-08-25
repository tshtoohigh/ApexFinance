# Apex Finance (Real / Functional)

A **real, functioning** personal finance app. No fake data — YOU enter your accounts and balances, crypto prices come **live from CoinGecko**, and an **AI chatbot** (OpenRouter) gives you personalized financial advice.

## What's Real Here

| Feature | How It Works |
|---------|-------------|
| Net Worth | Calculated from accounts YOU enter (stored in localStorage) |
| Crypto Prices | **Live from CoinGecko API** (free, no key needed) — refreshes every 60s |
| Safe to Spend | Calculated from your income - budget |
| Yield Tracking | Shows APY on accounts you mark as earning yield |
| Bills/Subscriptions | You add them, app totals and tracks monthly burn |
| Risk Radar | Analyzes YOUR actual portfolio allocation dynamically |
| AI Chatbot | Calls **OpenRouter API** with your financial context — answers questions |
| Data Persistence | All data saved to **localStorage** — survives page refreshes |

## What You Need

| Thing | Cost | Notes |
|-------|------|-------|
| Node.js | Free | Already installed if you ran the mockup |
| OpenRouter API key | Free | For AI chatbot — [get one here](https://openrouter.ai/keys) |
| CoinGecko | Free | No key needed, public API |

## Quick Start

```bash
git clone https://github.com/tshtoohigh/ApexFinance.git
cd ApexFinance
npm install
npm run dev
```

1. App opens to **Onboarding** — enter your name, income, accounts, crypto
2. Paste your **OpenRouter API key** (optional, for AI chatbot)
3. You're in! Dashboard shows your real net worth with live crypto prices
4. Tap the **chat bubble** (bottom-left) to talk to the AI about your finances

## Tech Stack

- React 18 + TypeScript + Vite 5
- Tailwind CSS (custom dark theme)
- Zustand (state management + localStorage persistence)
- Lucide React (icons)
- Recharts (charts)
- CoinGecko API (live crypto prices)
- OpenRouter API (AI chatbot using free Llama 3.1 model)

## How The AI Works

The chatbot sends your financial snapshot (balances, income, goals) as context to a free LLM via OpenRouter. It:
- Knows your total portfolio
- Can answer "should I save or invest?"
- Suggests what to do with idle cash
- Helps set realistic goals
- Never stores your data externally — API calls are stateless

## Privacy

- **All data is local.** Nothing is sent to any server except:
  - CoinGecko (fetches public crypto prices, no user data sent)
  - OpenRouter (sends financial summary ONLY when you chat — uses YOUR key)
- No analytics, no tracking, no backend
- Delete everything anytime from Settings → "Reset All Data"
