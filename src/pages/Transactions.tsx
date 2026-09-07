import { useState } from 'react';
import { Trash2, Receipt, PenLine } from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, Button, Input, Select, EmptyState } from '@/components/ui';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { formatMoney, formatRelativeDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import { SpendingBreakdown } from '@/components/transactions/SpendingBreakdown';
import { QuickLog } from '@/components/transactions/QuickLog';
import { EXPENSE_CATEGORIES, getCategory } from '@/lib/categories';

export function TransactionsPage() {
  const { transactions, addTransaction, removeTransaction } = useFinanceStore();
  const [showManual, setShowManual] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState<'expense' | 'income'>('expense');

  const handleAdd = () => {
    if (!amount) return;
    const raw = Math.abs(Number(amount));
    addTransaction({
      id: crypto.randomUUID(),
      description: desc || (type === 'income' ? 'Income' : getCategory(category).label),
      amount: type === 'income' ? raw : -raw,
      category: type === 'income' ? 'Income' : category,
      date: new Date().toISOString(),
    });
    setDesc(''); setAmount(''); setCategory('Food'); setType('expense');
    setShowManual(false);
  };

  const now = new Date();

  // Today's spending
  const todaySpent = transactions
    .filter((t) => t.amount < 0 && new Date(t.date).toDateString() === now.toDateString())
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  // This month's totals
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const income = thisMonth.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spent = thisMonth.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <PageWrapper>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">Activity</h1>
        <Button variant="outline" size="sm" onClick={() => setShowManual(!showManual)}>
          <PenLine size={12} /> Manual
        </Button>
      </div>

      {/* Today spotlight */}
      <Card gradient className="mb-3">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Spent Today</p>
        <p className="mt-1 font-mono text-3xl font-bold text-white">{formatMoney(todaySpent)}</p>
        <div className="mt-3 flex gap-5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Income (mo)</p>
            <p className="font-mono text-sm font-semibold text-green">{formatMoney(income)}</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Spent (mo)</p>
            <p className="font-mono text-sm font-semibold text-red">{formatMoney(spent)}</p>
          </div>
        </div>
      </Card>

      {/* Quick-tap logging (the star of the show) */}
      <QuickLog />

      {/* Manual entry (fallback, collapsible) */}
      {showManual && (
        <Card className="mb-3">
          <CardHeader title="Manual Entry" />
          <div className="mb-3 flex gap-2">
            <button
              onClick={() => setType('expense')}
              className={cn('flex-1 rounded-lg py-2 text-xs font-semibold transition-colors',
                type === 'expense' ? 'bg-red-dim text-red' : 'bg-surface text-muted-dark')}
            >
              Expense
            </button>
            <button
              onClick={() => setType('income')}
              className={cn('flex-1 rounded-lg py-2 text-xs font-semibold transition-colors',
                type === 'income' ? 'bg-green-dim text-green' : 'bg-surface text-muted-dark')}
            >
              Income
            </button>
          </div>
          <Input placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <Input prefix="$" type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          {type === 'expense' && (
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}
              options={EXPENSE_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))} />
          )}
          <Button fullWidth size="sm" onClick={handleAdd}>Save</Button>
        </Card>
      )}

      {/* Spending breakdown */}
      <SpendingBreakdown />

      {/* History */}
      <Card>
        <CardHeader title="History" subtitle={`${transactions.length} logged`} />
        {transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No activity yet"
            description="Tap a category above to log your first expense in seconds."
          />
        ) : (
          transactions.map((tx) => {
            const isIncome = tx.amount > 0;
            const cat = getCategory(tx.category);
            const Icon = cat.icon;
            return (
              <div key={tx.id} className="flex items-center border-b border-border py-2.5 last:border-b-0">
                <div className={cn('mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', cat.bgClass)}>
                  <Icon size={15} style={{ color: cat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[13px] font-medium text-white">{tx.description}</p>
                  <p className="text-[10px] text-muted-dark">{cat.label} • {formatRelativeDate(tx.date)}</p>
                </div>
                <p className={cn('px-2 font-mono text-[13px] font-semibold', isIncome ? 'text-green' : 'text-white')}>
                  {isIncome ? '+' : '−'}{formatMoney(Math.abs(tx.amount))}
                </p>
                <button onClick={() => removeTransaction(tx.id)} className="text-muted-dark hover:text-red">
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </Card>
    </PageWrapper>
  );
}
