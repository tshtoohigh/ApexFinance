import { cn } from '@/lib/cn';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefix?: string;
}

export function Input({ label, prefix, className, ...props }: InputProps) {
  return (
    <div className="mb-3">
      {label && <label className="mb-1.5 block text-[11px] font-medium text-muted">{label}</label>}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-dark">{prefix}</span>
        )}
        <input
          className={cn(
            'w-full rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-sm text-white placeholder:text-muted-dark focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30',
            prefix && 'pl-7',
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}
