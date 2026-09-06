import { useState } from 'react';
import { Receipt, Pencil, Trash2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui';
import { useFinanceStore, type Subscription } from '@/stores/useFinanceStore';
import { formatMoney } from '@/lib/format';

interface SubscriptionRowProps {
  sub: Subscription;
}

/** A subscription row with inline edit (name, amount, category) and delete. */
export function SubscriptionRow({ sub }: SubscriptionRowProps) {
  const { updateSubscription, removeSubscription } = useFinanceStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(sub.name);
  const [amount, setAmount] = useState(sub.amount.toString());
  const [category, setCategory] = useState(sub.category);

  const save = () => {
    updateSubscription(sub.id, {
      name: name.trim() || sub.name,
      amount: Number(amount) || 0,
      category: category.trim() || sub.category,
    });
    setEditing(false);
  };

  const cancel = () => {
    setName(sub.name);
    setAmount(sub.amount.toString());
    setCategory(sub.category);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="border-b border-border py-3 last:border-b-0">
        <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Amount" prefix="$" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={save} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-accent py-2 text-[11px] font-semibold text-bg">
            <Check size={12} /> Save
          </button>
          <button onClick={cancel} className="flex items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-[11px] font-semibold text-muted">
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center border-b border-border py-3 last:border-b-0">
      <div className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-dim">
        <Receipt size={12} className="text-purple" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-[13px] font-medium text-white">{sub.name}</p>
        <p className="text-[10px] text-muted-dark">{sub.category} • {sub.frequency}</p>
      </div>
      <p className="px-2 font-mono text-[13px] font-semibold text-white">{formatMoney(sub.amount)}</p>
      <button onClick={() => setEditing(true)} className="mr-2 text-muted-dark hover:text-accent">
        <Pencil size={12} />
      </button>
      <button onClick={() => removeSubscription(sub.id)} className="text-muted-dark hover:text-red">
        <Trash2 size={12} />
      </button>
    </div>
  );
}
