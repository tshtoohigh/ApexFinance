import { useState } from 'react';
import { Receipt, Plus, Trash2 } from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, Badge, Button, Input } from '@/components/ui';
import { useFinanceStore } from '@/stores/useFinanceStore';

export function BillsPage() {
  const { subscriptions, addSubscription, removeSubscription } = useFinanceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const total = subscriptions.reduce((sum, s) => sum + s.amount, 0);

  const handleAdd = () => {
    if (!newName || !newAmount) return;
    addSubscription({
      id: crypto.randomUUID(),
      name: newName,
      amount: Number(newAmount),
      frequency: 'monthly',
      category: newCategory || 'Other',
    });
    setNewName('');
    setNewAmount('');
    setNewCategory('');
    setShowAdd(false);
  };

  return (
    <PageWrapper>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">Bills & Subs</h1>
        <Badge variant="accent">${total.toFixed(0)}/mo</Badge>
      </div>

      {/* Total */}
      <Card gradient className="mb-3">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Monthly Subscriptions</p>
        <p className="mt-1 font-mono text-2xl font-bold text-white">${total.toFixed(2)}/mo</p>
        <p className="mt-1 text-[10px] text-muted-dark">${(total * 12).toFixed(0)}/year • {subscriptions.length} active</p>
      </Card>

      {/* List */}
      <Card className="mb-3">
        <CardHeader
          title="Subscriptions"
          action={
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(!showAdd)}>
              <Plus size={12} /> Add
            </Button>
          }
        />

        {showAdd && (
          <div className="mb-3 rounded-lg border border-accent/20 bg-surface p-3">
            <Input placeholder="Name (e.g. Netflix)" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input placeholder="Amount" prefix="$" type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            <Input placeholder="Category (e.g. Entertainment)" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
            <Button fullWidth size="sm" onClick={handleAdd}>Add Subscription</Button>
          </div>
        )}

        {subscriptions.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-dark">No subscriptions tracked yet. Add your first one above.</p>
        )}

        {subscriptions.map((sub) => (
          <div key={sub.id} className="flex items-center border-b border-border py-3 last:border-b-0">
            <div className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-dim">
              <Receipt size={12} className="text-purple" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white">{sub.name}</p>
              <p className="text-[10px] text-muted-dark">{sub.category} • {sub.frequency}</p>
            </div>
            <p className="px-2 font-mono text-[13px] font-semibold text-white">${sub.amount.toFixed(2)}</p>
            <button onClick={() => removeSubscription(sub.id)} className="text-muted-dark hover:text-red">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </Card>
    </PageWrapper>
  );
}
