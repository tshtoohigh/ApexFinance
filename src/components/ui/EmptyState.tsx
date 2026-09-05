import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Friendly empty state with an icon, guidance text, and optional CTA. */
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-dim">
        <Icon size={22} className="text-accent" strokeWidth={1.8} />
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 max-w-[240px] text-[11px] leading-relaxed text-muted-dark">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
