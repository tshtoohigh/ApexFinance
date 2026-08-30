import { cn } from '@/lib/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-bg hover:bg-accent/90 shadow-[0_2px_12px_rgba(0,240,255,0.25)] hover:shadow-[0_4px_20px_rgba(0,240,255,0.35)]',
  ghost: 'bg-accent-dim text-accent hover:bg-accent-mid',
  outline: 'border border-border text-muted hover:border-accent hover:text-accent',
  danger: 'bg-red-dim text-red hover:bg-red/20',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[11px]',
  md: 'px-4 py-2.5 text-[12px]',
  lg: 'px-5 py-3.5 text-[13px]',
};

export function Button({ variant = 'primary', size = 'md', fullWidth, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50',
        variants[variant], sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
