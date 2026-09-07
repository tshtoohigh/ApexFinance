-- ============================================================
-- APEX FINANCE — App Config / Version Gate
-- Run this in Supabase SQL Editor.
--
-- Controls the in-app "Update Required" gate and "Update Available" banner.
-- To force everyone to update: raise `min_version`.
-- To softly nudge: raise `latest_version` (below min_version stays optional).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_config (
  id INT PRIMARY KEY DEFAULT 1,
  min_version TEXT NOT NULL DEFAULT '1.0.0',      -- builds below this are HARD BLOCKED
  latest_version TEXT NOT NULL DEFAULT '1.3.0',   -- newest available (soft nudge)
  update_url TEXT DEFAULT '',                      -- where "Update" sends users (APK link / store)
  update_notes TEXT DEFAULT '',                    -- shown on the update screen
  CONSTRAINT single_row CHECK (id = 1)
);

-- Seed the single config row
INSERT INTO public.app_config (id, min_version, latest_version, update_url, update_notes)
VALUES (1, '1.0.0', '1.3.0', '', 'Latest features and fixes.')
ON CONFLICT (id) DO NOTHING;

-- Anyone (even logged out) can READ the config so the gate works pre-login.
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_can_read_config" ON public.app_config;
CREATE POLICY "anyone_can_read_config" ON public.app_config
  FOR SELECT USING (true);

-- No public write policy — you edit this table from the Supabase dashboard only.
