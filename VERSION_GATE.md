# Version Gate — How to Control App Updates

Apex Finance has a Pokémon-GO-style update system. You control it from Supabase — no code changes or redeploys needed to prompt users.

## How it works

1. Each app build has a version baked in (`src/lib/version.ts` → `APP_VERSION`).
2. On launch, the app reads the `app_config` row from Supabase.
3. It compares:
   - If `APP_VERSION` < `min_version` → **hard block** ("Update Required" screen — user cannot continue).
   - If `APP_VERSION` < `latest_version` (but ≥ min) → **soft banner** ("Update Available" — dismissible).
   - Otherwise → no prompt.
4. If the config can't be read, the app is **never** blocked (fails open).

## One-time setup

Run `supabase/migrations/v1.4_app_config.sql` in the Supabase SQL Editor. This creates the `app_config` table with a single row.

## Controlling updates (from Supabase dashboard)

Go to **Supabase → Table Editor → app_config** and edit the single row:

| Column | What it does |
|--------|-------------|
| `min_version` | Builds **below** this are hard-blocked. Raise it to FORCE everyone to update. |
| `latest_version` | Newest version available. Raise it to softly NUDGE users (dismissible banner). |
| `update_url` | Where the "Update" button sends users (your APK download link, or a store URL). Leave blank for web/PWA to just reload. |
| `update_notes` | Short "what's new" text shown on the update screen. |

### Examples

**Soft nudge to 1.5.0 (optional):**
- `latest_version` = `1.5.0`
- `min_version` = leave as is (e.g. `1.0.0`)
- Result: users see a dismissible banner.

**Force everyone to 1.5.0 (mandatory):**
- `min_version` = `1.5.0`
- `latest_version` = `1.5.0`
- Result: anyone below 1.5.0 is blocked until they update.

## Release workflow

1. Build & ship a new version (update `package.json` version + `src/lib/version.ts` `APP_VERSION`, then deploy / rebuild APK).
2. In Supabase, bump `latest_version` (and `min_version` if forcing).
3. Set `update_url` to the new download link.
4. Users get prompted automatically on next launch.
