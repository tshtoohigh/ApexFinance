-- ============================================================
-- RS FINANCE — COMPLETE DATABASE SETUP
-- Powered by RS Corp
--
-- HOW TO USE:
--   Supabase Dashboard → SQL Editor → New Query → paste ALL of this → Run
--
-- This is the ONLY file you need for a fresh setup. It creates every table,
-- every security policy, and the signup trigger — up to and including v2.0.
--
-- SAFE TO RUN MULTIPLE TIMES. Every statement is idempotent, so if a run
-- fails partway through you can just fix the issue and run the whole thing
-- again. Existing data is never deleted.
--
-- The files in supabase/migrations/ are only for upgrading a database that
-- was already set up on an older version. Fresh setups can ignore them.
-- ============================================================


-- ============================================================
-- 1. TABLES
-- ============================================================

-- Profiles — extends auth.users with app-specific settings
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_name TEXT DEFAULT '',
  monthly_income NUMERIC DEFAULT 0,
  monthly_budget NUMERIC DEFAULT 0,
  has_onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts — bank, brokerage, retirement, crypto, DeFi balances
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  institution TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'brokerage', 'retirement', 'crypto', 'defi')),
  balance NUMERIC DEFAULT 0,
  apy NUMERIC DEFAULT NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crypto holdings — priced live from CoinGecko, so only the amount is stored
CREATE TABLE IF NOT EXISTS public.crypto_holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions — recurring bills
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'yearly')),
  category TEXT DEFAULT 'Other',
  next_bill TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals — savings targets with projected completion
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target NUMERIC DEFAULT 0,
  current NUMERIC DEFAULT 0,
  deadline TEXT DEFAULT '',
  monthly_contribution NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions — logged income and expenses
-- amount: positive = income, negative = expense
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  category TEXT DEFAULT 'Other',
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Net worth history — one snapshot per day, powers the trend chart
CREATE TABLE IF NOT EXISTS public.net_worth_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  value NUMERIC DEFAULT 0,
  date TIMESTAMPTZ DEFAULT NOW()
);

-- Physical assets — anything you own that holds value outside a bank:
-- watches, sneakers, jewelry, cars, collectibles, resale inventory.
--
-- intent is the key dimension — WHY you own it:
--   'personal'   — you own it and use it
--   'investment' — bought to hold and appreciate
--   'resale'     — inventory you intend to flip
--
-- for_sale is kept in sync with intent for backwards compatibility.
CREATE TABLE IF NOT EXISTS public.physical_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Other',
  intent TEXT DEFAULT 'personal',
  quantity NUMERIC DEFAULT 1,
  purchase_price NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  for_sale BOOLEAN DEFAULT FALSE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guard intent against invalid values. Done as a separate statement (rather
-- than inline above) so databases created before v2.0 also get the check.
ALTER TABLE public.physical_assets
  ADD COLUMN IF NOT EXISTS intent TEXT DEFAULT 'personal';
ALTER TABLE public.physical_assets
  DROP CONSTRAINT IF EXISTS physical_assets_intent_check;
ALTER TABLE public.physical_assets
  ADD CONSTRAINT physical_assets_intent_check
  CHECK (intent IN ('personal', 'investment', 'resale'));

-- App config — single-row table driving the version gate.
-- Raise min_version to hard-block old builds; raise latest_version to
-- softly nudge users with a banner. Edit from the Supabase dashboard.
CREATE TABLE IF NOT EXISTS public.app_config (
  id INT PRIMARY KEY DEFAULT 1,
  min_version TEXT NOT NULL DEFAULT '1.0.0',
  latest_version TEXT NOT NULL DEFAULT '1.0.0',
  update_url TEXT DEFAULT '',
  update_notes TEXT DEFAULT '',
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO public.app_config (id, min_version, latest_version, update_url, update_notes)
VALUES (1, '1.0.0', '2.0.0', '', 'Latest features and fixes.')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 2. ROW LEVEL SECURITY
-- Without these, any logged-in user could read everyone's data.
-- Every policy below restricts rows to the owning user.
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_holdings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.net_worth_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_assets   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config        ENABLE ROW LEVEL SECURITY;

-- Clean up policy names used by earlier versions of this file, so a database
-- set up before v2.0 doesn't end up with duplicate overlapping policies.
DROP POLICY IF EXISTS "Users can view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own accounts"   ON public.accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can view own crypto"   ON public.crypto_holdings;
DROP POLICY IF EXISTS "Users can insert own crypto" ON public.crypto_holdings;
DROP POLICY IF EXISTS "Users can update own crypto" ON public.crypto_holdings;
DROP POLICY IF EXISTS "Users can delete own crypto" ON public.crypto_holdings;
DROP POLICY IF EXISTS "Users can view own subs"   ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subs" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subs" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete own subs" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own goals"   ON public.goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;
DROP POLICY IF EXISTS "own_tx_select" ON public.transactions;
DROP POLICY IF EXISTS "own_tx_insert" ON public.transactions;
DROP POLICY IF EXISTS "own_tx_update" ON public.transactions;
DROP POLICY IF EXISTS "own_tx_delete" ON public.transactions;
DROP POLICY IF EXISTS "own_nw_select" ON public.net_worth_history;
DROP POLICY IF EXISTS "own_nw_insert" ON public.net_worth_history;
DROP POLICY IF EXISTS "own_nw_update" ON public.net_worth_history;
DROP POLICY IF EXISTS "own_nw_delete" ON public.net_worth_history;
DROP POLICY IF EXISTS "own_assets_select" ON public.physical_assets;
DROP POLICY IF EXISTS "own_assets_insert" ON public.physical_assets;
DROP POLICY IF EXISTS "own_assets_update" ON public.physical_assets;
DROP POLICY IF EXISTS "own_assets_delete" ON public.physical_assets;
DROP POLICY IF EXISTS "anyone_can_read_config" ON public.app_config;

-- Profiles — matched on id, which IS the user id
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Accounts
DROP POLICY IF EXISTS "accounts_select" ON public.accounts;
CREATE POLICY "accounts_select" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "accounts_insert" ON public.accounts;
CREATE POLICY "accounts_insert" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "accounts_update" ON public.accounts;
CREATE POLICY "accounts_update" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "accounts_delete" ON public.accounts;
CREATE POLICY "accounts_delete" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- Crypto holdings
DROP POLICY IF EXISTS "crypto_select" ON public.crypto_holdings;
CREATE POLICY "crypto_select" ON public.crypto_holdings FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "crypto_insert" ON public.crypto_holdings;
CREATE POLICY "crypto_insert" ON public.crypto_holdings FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "crypto_update" ON public.crypto_holdings;
CREATE POLICY "crypto_update" ON public.crypto_holdings FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "crypto_delete" ON public.crypto_holdings;
CREATE POLICY "crypto_delete" ON public.crypto_holdings FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions
DROP POLICY IF EXISTS "subs_select" ON public.subscriptions;
CREATE POLICY "subs_select" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "subs_insert" ON public.subscriptions;
CREATE POLICY "subs_insert" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "subs_update" ON public.subscriptions;
CREATE POLICY "subs_update" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "subs_delete" ON public.subscriptions;
CREATE POLICY "subs_delete" ON public.subscriptions FOR DELETE USING (auth.uid() = user_id);

-- Goals
DROP POLICY IF EXISTS "goals_select" ON public.goals;
CREATE POLICY "goals_select" ON public.goals FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "goals_insert" ON public.goals;
CREATE POLICY "goals_insert" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "goals_update" ON public.goals;
CREATE POLICY "goals_update" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "goals_delete" ON public.goals;
CREATE POLICY "goals_delete" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Transactions
DROP POLICY IF EXISTS "tx_select" ON public.transactions;
CREATE POLICY "tx_select" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "tx_insert" ON public.transactions;
CREATE POLICY "tx_insert" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "tx_update" ON public.transactions;
CREATE POLICY "tx_update" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "tx_delete" ON public.transactions;
CREATE POLICY "tx_delete" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Net worth history
DROP POLICY IF EXISTS "nw_select" ON public.net_worth_history;
CREATE POLICY "nw_select" ON public.net_worth_history FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "nw_insert" ON public.net_worth_history;
CREATE POLICY "nw_insert" ON public.net_worth_history FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "nw_update" ON public.net_worth_history;
CREATE POLICY "nw_update" ON public.net_worth_history FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "nw_delete" ON public.net_worth_history;
CREATE POLICY "nw_delete" ON public.net_worth_history FOR DELETE USING (auth.uid() = user_id);

-- Physical assets
DROP POLICY IF EXISTS "assets_select" ON public.physical_assets;
CREATE POLICY "assets_select" ON public.physical_assets FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "assets_insert" ON public.physical_assets;
CREATE POLICY "assets_insert" ON public.physical_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "assets_update" ON public.physical_assets;
CREATE POLICY "assets_update" ON public.physical_assets FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "assets_delete" ON public.physical_assets;
CREATE POLICY "assets_delete" ON public.physical_assets FOR DELETE USING (auth.uid() = user_id);

-- App config — readable by everyone (even logged out) so the version gate
-- can run before login. There is deliberately no write policy; edit it
-- from the Supabase dashboard only.
DROP POLICY IF EXISTS "config_public_read" ON public.app_config;
CREATE POLICY "config_public_read" ON public.app_config FOR SELECT USING (true);


-- ============================================================
-- 3. SIGNUP TRIGGER
-- Creates a profile row automatically whenever someone signs up, so the
-- app never has to deal with a missing profile.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- DONE. Verify with:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' ORDER BY table_name;
--
-- You should see 9 tables:
--   accounts, app_config, crypto_holdings, goals, net_worth_history,
--   physical_assets, profiles, subscriptions, transactions
-- ============================================================
