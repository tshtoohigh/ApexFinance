import { useState } from 'react';
import { Info, X } from 'lucide-react';

interface DisclaimerProps {
  message?: string;
}

export function Disclaimer({ message = 'Apex Finance provides informational insights, not financial advice.' }: DisclaimerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber/20 bg-amber/[0.04] px-3 py-2.5">
      <Info size={14} className="shrink-0 text-amber" />
      <p className="flex-1 text-[11px] leading-snug text-muted">{message}</p>
      <button onClick={() => setDismissed(true)} className="shrink-0 text-muted-dark hover:text-muted">
        <X size={12} />
      </button>
    </div>
  );
}
