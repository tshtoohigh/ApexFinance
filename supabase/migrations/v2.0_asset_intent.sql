-- ============================================================
-- RS FINANCE v2.0 MIGRATION
-- Adds: intent column on physical_assets
--
-- Replaces the old boolean `for_sale` flag with a richer model:
--   'personal'   — you own and use it
--   'investment' — bought to hold and appreciate
--   'resale'     — inventory you intend to flip
--
-- Safe to run more than once. Existing rows are migrated automatically.
-- ============================================================

ALTER TABLE public.physical_assets
  ADD COLUMN IF NOT EXISTS intent TEXT DEFAULT 'personal';

-- Migrate existing rows: anything previously flagged for sale becomes 'resale'
UPDATE public.physical_assets
SET intent = CASE WHEN for_sale THEN 'resale' ELSE 'personal' END
WHERE intent IS NULL;

-- Guard against invalid values
ALTER TABLE public.physical_assets
  DROP CONSTRAINT IF EXISTS physical_assets_intent_check;
ALTER TABLE public.physical_assets
  ADD CONSTRAINT physical_assets_intent_check
  CHECK (intent IN ('personal', 'investment', 'resale'));
