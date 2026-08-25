import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

type BadgeVariant = 'live' | 'accent' | 'amber' | 'red' | 'green' | 'neutral';

const styles: Record<BadgeVariant, string> = {
  live: 'bg-green-dim text-green',
  green: 'bg-green-dim text-green',
  accent: 'bg-accent-dim text-accent',
  amber: 'bg-amber-dim text-amber',
  red: 'bg-red-dim text-red',
  neutral: 'bg-border text-muted',
};

export function Badge({ children, variant = 'neutral', dot, className }: { children: ReactNode; variant?: BadgeVariant; dot?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold', styles[variant], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
