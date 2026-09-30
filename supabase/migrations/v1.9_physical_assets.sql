-- ============================================================
-- RS FINANCE v1.9 MIGRATION
-- Adds: physical_assets table (holistic net worth tracking)
--
-- Tracks anything worth money that isn't in a bank account:
-- sneakers for resale, watches, collectibles, vehicles, etc.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.physical_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Other',
  quantity NUMERIC DEFAULT 1,
  purchase_price NUMERIC DEFAULT 0,   -- what you paid, per unit
  current_value NUMERIC DEFAULT 0,    -- what it's worth now, per unit
  for_sale BOOLEAN DEFAULT FALSE,     -- flagged as intended for resale
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.physical_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_assets_select" ON public.physical_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_assets_insert" ON public.physical_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_assets_update" ON public.physical_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own_assets_delete" ON public.physical_assets FOR DELETE USING (auth.uid() = user_id);
