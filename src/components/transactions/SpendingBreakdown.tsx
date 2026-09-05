import { Card, CardHeader } from '@/components/ui';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { formatMoney, formatCurrency } from '@/lib/format';
import { cn } from '@/lib/cn';

// Distinct colors per category bar
const CATEGORY_COLORS: Record<string, string> = {
  Groceries: 'bg-green',
  Dining: 'bg-amber',
  Transport: 'bg-accent',
  Shopping: 'bg-purple',
  Bills: 'bg-red',
  Entertainment: 'bg-[#FF8FA3]',
  Health: 'bg-[#4ADE80]',
  Transfer: 'bg-muted',
  Other: 'bg-border-light',
};

export function SpendingBreakdown() {
  const { transactions, monthlyBudget } = useFinanceStore();

  const now = new Date();
  const monthExpenses = transactions.filter((t) => {
    const d = new Date(t.date);
    return t.amount < 0 && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalSpent = monthExpenses.reduce((s, t) => s + Math.abs(t.amount), 0);

  // Group by category
  const byCategory: Record<string, number> = {};
  for (const t of monthExpenses) {
    byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount);
  }
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  if (monthExpenses.length === 0) return null;

  const budgetPct = monthlyBudget > 0 ? Math.min((totalSpent / monthlyBudget) * 100, 100) : 0;
  const overBudget = monthlyBudget > 0 && totalSpent > monthlyBudget;

  return (
    <Card className="mb-3">
      <CardHeader title="Spending Breakdown" subtitle="This month by category" />

      {/* Budget progress */}
      {monthlyBudget > 0 && (
        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="text-muted">Budget used</span>
            <span className={cn('font-mono font-semibold', overBudget ? 'text-red' : 'text-white')}>
              {formatCurrency(totalSpent)} / {formatCurrency(monthlyBudget)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className={cn('h-full rounded-full transition-all', overBudget ? 'bg-red' : 'bg-accent')}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          {overBudget && (
            <p className="mt-1.5 text-[10px] text-red">
              You're {formatCurrency(totalSpent - monthlyBudget)} over budget this month.
            </p>
          )}
        </div>
      )}

      {/* Category rows */}
      <div className="space-y-2.5">
        {sorted.map(([category, amount]) => {
          const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
          return (
            <div key={category}>
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="text-white">{category}</span>
                <span className="font-mono text-muted">{formatMoney(amount)} · {pct.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className={cn('h-full rounded-full', CATEGORY_COLORS[category] || 'bg-accent')}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
