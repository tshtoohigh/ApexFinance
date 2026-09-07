import { useState } from 'react';
import { Delete, Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { CategoryDef } from '@/lib/categories';

interface NumberPadProps {
  category: CategoryDef;
  onConfirm: (amount: number, note: string) => void;
  onClose: () => void;
}

/**
 * Calculator-style amount entry sheet. Opens after a category tile is tapped.
 * Big tap targets = fast, low-friction logging.
 */
export function NumberPad({ category, onConfirm, onClose }: NumberPadProps) {
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const Icon = category.icon;

  const press = (key: string) => {
    if (key === '.' && value.includes('.')) return;
    // limit to 2 decimal places
    if (value.includes('.') && value.split('.')[1]?.length >= 2) return;
    if (value === '' && key === '.') { setValue('0.'); return; }
    setValue(value + key);
  };

  const backspace = () => setValue(value.slice(0, -1));

  const confirm = () => {
    const amount = parseFloat(value);
    if (!amount || amount <= 0) return;
    onConfirm(amount, note.trim());
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

  return (
    <div className="fixed inset-0 z-[80] flex flex-col justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-[430px] rounded-t-3xl border-t border-border bg-card p-5 pb-8 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', category.bgClass)}>
              <Icon size={20} style={{ color: category.color }} />
            </div>
            <span className="text-base font-semibold text-white">{category.label}</span>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-muted">
            <X size={16} />
          </button>
        </div>

        {/* Amount display */}
        <div className="mb-3 text-center">
          <span className="font-mono text-4xl font-bold" style={{ color: value ? category.color : '#4A5568' }}>
            ${value || '0'}
          </span>
        </div>

        {/* Optional note */}
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)"
          className="mb-4 w-full rounded-lg border border-border bg-surface px-3 py-2 text-center text-sm text-white placeholder:text-muted-dark focus:border-accent focus:outline-none"
        />

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              className="rounded-xl bg-surface py-4 font-mono text-xl font-semibold text-white transition-colors hover:bg-card-hover active:bg-border"
            >
              {k}
            </button>
          ))}
          <button
            onClick={backspace}
            className="flex items-center justify-center rounded-xl bg-surface py-4 text-muted transition-colors hover:bg-card-hover active:bg-border"
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Confirm */}
        <button
          onClick={confirm}
          disabled={!parseFloat(value)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-4 text-sm font-bold text-bg transition-all hover:bg-accent/90 disabled:opacity-40"
        >
          <Check size={18} /> Log {category.label} {value ? `· $${value}` : ''}
        </button>
      </div>
    </div>
  );
}
