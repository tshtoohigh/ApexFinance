-- ============================================================
-- APEX FINANCE v1.1 MIGRATION
-- Adds: transactions + net_worth_history tables
-- Run this in Supabase SQL Editor if you already ran the original schema.
-- (If setting up fresh, schema.sql already includes these.)
-- ============================================================

-- 6. TRANSACTIONS (logged income + expenses)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,          -- positive = income, negative = expense
  category TEXT DEFAULT 'Other',
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NET WORTH HISTORY (one snapshot per day)
CREATE TABLE IF NOT EXISTS public.net_worth_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  value NUMERIC DEFAULT 0,
  date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.net_worth_history ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "own_tx_select" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_tx_insert" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_tx_update" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_tx_delete" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Net worth history policies
CREATE POLICY "own_nw_select" ON public.net_worth_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_nw_insert" ON public.net_worth_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_nw_update" ON public.net_worth_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_nw_delete" ON public.net_worth_history FOR DELETE USING (auth.uid() = user_id);
