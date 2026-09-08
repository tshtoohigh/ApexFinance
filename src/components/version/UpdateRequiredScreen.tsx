import { DownloadCloud, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { APP_VERSION } from '@/lib/version';

interface UpdateRequiredScreenProps {
  latestVersion: string;
  updateUrl: string;
  updateNotes: string;
}

/** Full-screen hard block shown when the app build is below the required minimum. */
export function UpdateRequiredScreen({ latestVersion, updateUrl, updateNotes }: UpdateRequiredScreenProps) {
  const handleUpdate = () => {
    if (updateUrl) {
      window.open(updateUrl, '_blank');
    } else {
      // PWA/web: a hard reload pulls the newest deployed build
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-mid bg-accent-dim">
        <DownloadCloud size={30} className="text-accent" strokeWidth={1.6} />
      </div>

      <h1 className="text-xl font-bold">Update Required</h1>
      <p className="mt-2 max-w-[300px] text-[13px] leading-relaxed text-muted">
        A new version of RS Finance is available and required to continue.
      </p>

      {updateNotes && (
        <div className="mt-4 w-full max-w-[320px] rounded-xl border border-border bg-card p-3 text-left">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-dark">What's new</p>
          <p className="text-[12px] leading-relaxed text-muted">{updateNotes}</p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-dark">
        <span>You have v{APP_VERSION}</span>
        {latestVersion && (
          <>
            <span>→</span>
            <span className="font-semibold text-accent">v{latestVersion} available</span>
          </>
        )}
      </div>

      <Button size="lg" className="mt-6 w-full max-w-[320px]" onClick={handleUpdate}>
        {updateUrl ? <DownloadCloud size={16} /> : <RefreshCw size={16} />}
        {updateUrl ? 'Update Now' : 'Reload to Update'}
      </Button>
    </div>
  );
}
