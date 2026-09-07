import { useState } from 'react';
import { ArrowUpCircle, X } from 'lucide-react';

interface UpdateBannerProps {
  latestVersion: string;
  updateUrl: string;
}

/** Soft, dismissible banner shown when a newer (but not required) version exists. */
export function UpdateBanner({ latestVersion, updateUrl }: UpdateBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const handleUpdate = () => {
    if (updateUrl) window.open(updateUrl, '_blank');
    else window.location.reload();
  };

  return (
    <div className="mx-auto flex max-w-[430px] items-center gap-2 border-b border-accent-mid bg-accent/[0.06] px-4 py-2.5">
      <ArrowUpCircle size={15} className="shrink-0 text-accent" />
      <p className="flex-1 text-[11px] text-white">
        Version <span className="font-semibold text-accent">{latestVersion}</span> is available.
        <button onClick={handleUpdate} className="ml-1 font-semibold text-accent underline">
          Update
        </button>
      </p>
      <button onClick={() => setDismissed(true)} className="shrink-0 text-muted-dark hover:text-muted">
        <X size={13} />
      </button>
    </div>
  );
}
