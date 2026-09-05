import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Plus, Trash2, Receipt } from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, Button, Input, Select, EmptyState } from '@/components/ui';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { formatMoney, formatRelativeDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import { SpendingBreakdown } from '@/components/transactions/SpendingBreakdown';

const CATEGORIES = [
  'Income', 'Groceries', 'Dining', 'Transport', 'Shopping',
  'Bills', 'Entertainment', 'Health', 'Transfer', 'Other',
];

export function TransactionsPage() {
  const { transactions, addTransaction, removeTransaction } = useFinanceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [type, setType] = useState<'expense' | 'income'>('expense');

  const handleAdd = () => {
    if (!desc || !amount) return;
    const raw = Math.abs(Number(amount));
    addTransaction({
      id: crypto.randomUUID(),
      description: desc,
      amount: type === 'income' ? raw : -raw,
      category: type === 'income' ? 'Income' : category,
      date: new Date().toISOString(),
    });
    setDesc(''); setAmount(''); setCategory('Groceries'); setType('expense');
    setShowAdd(false);
  };

  // This month's totals
  const now = new Date();
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const income = thisMonth.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spent = thisMonth.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <PageWrapper>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">Transactions</h1>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={12} /> Log
        </Button>
      </div>

      {/* Month summary */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <Card className="!p-3">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Income (mo)</p>
          <p className="mt-1 font-mono text-lg font-bold text-green">{formatMoney(income)}</p>
        </Card>
        <Card className="!p-3">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Spent (mo)</p>
          <p className="mt-1 font-mono text-lg font-bold text-red">{formatMoney(spent)}</p>
        </Card>
      </div>

      {/* Add form */}
      {showAdd && (
        <Card className="mb-3">
          <CardHeader title="Log a Transaction" />
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
          <Input placeholder="Description (e.g. Whole Foods)" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <Input prefix="$" type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          {type === 'expense' && (
            <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}
              options={CATEGORIES.filter((c) => c !== 'Income').map((c) => ({ value: c, label: c }))} />
          )}
          <Button fullWidth size="sm" onClick={handleAdd}>Save Transaction</Button>
        </Card>
      )}

      {/* Spending breakdown by category + budget */}
      <SpendingBreakdown />

      {/* List */}
      <Card>
        <CardHeader title="History" subtitle={`${transactions.length} logged`} />
        {transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="Log your income and expenses to track your spending over time."
            actionLabel="Log your first one"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          transactions.map((tx) => {
            const isIncome = tx.amount > 0;
            return (
              <div key={tx.id} className="flex items-center border-b border-border py-2.5 last:border-b-0">
                <div className={cn('mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  isIncome ? 'bg-green-dim' : 'bg-surface')}>
                  {isIncome
                    ? <ArrowDownLeft size={14} className="text-green" />
                    : <ArrowUpRight size={14} className="text-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[13px] font-medium text-white">{tx.description}</p>
                  <p className="text-[10px] text-muted-dark">{tx.category} • {formatRelativeDate(tx.date)}</p>
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
