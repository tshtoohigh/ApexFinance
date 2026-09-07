/**
 * App version + comparison helpers for the version gate.
 *
 * APP_VERSION is baked in at build time. The server (Supabase app_config table)
 * holds `min_version` and `latest_version`. On launch the app compares them and,
 * if this build is below `min_version`, shows a blocking "Update Required" screen.
 */

// Keep this in sync with package.json "version"
export const APP_VERSION = '1.4.0';

/**
 * Compare two semver strings.
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na < nb) return -1;
    if (na > nb) return 1;
  }
  return 0;
}

/** True if the current app build is older than the required minimum. */
export function isUpdateRequired(minVersion: string): boolean {
  return compareVersions(APP_VERSION, minVersion) < 0;
}

/** True if a newer (optional) version exists, but current is still allowed. */
export function isUpdateAvailable(latestVersion: string): boolean {
  return compareVersions(APP_VERSION, latestVersion) < 0;
}
