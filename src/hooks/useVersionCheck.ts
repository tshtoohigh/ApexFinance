import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { isUpdateRequired, isUpdateAvailable } from '@/lib/version';

interface VersionState {
  loading: boolean;
  updateRequired: boolean;  // must update to continue (hard block)
  updateAvailable: boolean; // newer version exists but not forced (soft nudge)
  latestVersion: string;
  updateUrl: string;
  updateNotes: string;
}

/**
 * Reads the `app_config` row from Supabase and decides whether the current
 * build is blocked (below min_version) or just behind (below latest_version).
 *
 * Fails open: if the config can't be read, the app is NOT blocked.
 */
export function useVersionCheck(): VersionState {
  const [state, setState] = useState<VersionState>({
    loading: true,
    updateRequired: false,
    updateAvailable: false,
    latestVersion: '',
    updateUrl: '',
    updateNotes: '',
  });

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const { data, error } = await supabase
          .from('app_config')
          .select('min_version, latest_version, update_url, update_notes')
          .eq('id', 1)
          .single();

        if (cancelled) return;

        // Fail open — no config or error means no gate
        if (error || !data) {
          setState((s) => ({ ...s, loading: false }));
          return;
        }

        setState({
          loading: false,
          updateRequired: data.min_version ? isUpdateRequired(data.min_version) : false,
          updateAvailable: data.latest_version ? isUpdateAvailable(data.latest_version) : false,
          latestVersion: data.latest_version ?? '',
          updateUrl: data.update_url ?? '',
          updateNotes: data.update_notes ?? '',
        });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
