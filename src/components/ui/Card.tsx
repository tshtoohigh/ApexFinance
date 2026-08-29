import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
  glow?: boolean;
}

export function Card({ children, className, gradient, glow }: CardProps) {
  return (
    <div className={cn(
      'rounded-2xl border border-border bg-card p-4 shadow-card transition-shadow duration-200',
      gradient && 'bg-gradient-to-br from-card via-card to-accent/[0.04]',
      glow && 'shadow-glow',
      className
    )}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="mb-3.5 flex items-center justify-between">
      <div>
        <h3 className="text-[13px] font-semibold tracking-tight text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[11px] text-muted-dark">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
