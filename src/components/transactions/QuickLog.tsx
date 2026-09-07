import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui';
import { NumberPad } from './NumberPad';
import { EXPENSE_CATEGORIES, INCOME_CATEGORY, type CategoryDef } from '@/lib/categories';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { cn } from '@/lib/cn';

/**
 * Tap-to-log grid. Tapping a category tile opens the NumberPad;
 * confirming logs a transaction instantly — no forms, no typing category.
 */
export function QuickLog() {
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const [active, setActive] = useState<CategoryDef | null>(null);

  const handleConfirm = (amount: number, note: string) => {
    if (!active) return;
    const isIncome = active.key === 'Income';
    addTransaction({
      id: crypto.randomUUID(),
      description: note || active.label,
      amount: isIncome ? amount : -amount,
      category: active.key,
      date: new Date().toISOString(),
    });
    setActive(null);
  };

  return (
    <Card className="mb-3">
      <CardHeader title="Quick Log" subtitle="Tap a category to log in seconds" />

      <div className="grid grid-cols-4 gap-2">
        {EXPENSE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => setActive(cat)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border border-border py-3 transition-all',
                'hover:-translate-y-0.5 hover:border-border-light active:translate-y-0'
              )}
            >
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', cat.bgClass)}>
                <Icon size={18} style={{ color: cat.color }} />
              </div>
              <span className="text-[10px] font-medium text-muted">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Income button — full width, distinct */}
      <button
        onClick={() => setActive(INCOME_CATEGORY)}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-green/25 bg-green/[0.06] py-2.5 text-xs font-semibold text-green transition-all hover:bg-green/[0.1]"
      >
        <INCOME_CATEGORY.icon size={15} /> Log Income
      </button>

      {active && (
        <NumberPad
          category={active}
          onConfirm={handleConfirm}
          onClose={() => setActive(null)}
        />
      )}
    </Card>
  );
}
