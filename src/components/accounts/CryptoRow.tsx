import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui';
import { useFinanceStore, type CryptoHolding } from '@/stores/useFinanceStore';

interface CryptoRowProps {
  holding: CryptoHolding;
}

/** A crypto holding row with inline edit of the amount owned, and delete. */
export function CryptoRow({ holding }: CryptoRowProps) {
  const { updateCryptoHolding, removeCryptoHolding } = useFinanceStore();
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(holding.amount.toString());

  const save = () => {
    updateCryptoHolding(holding.id, { amount: Number(amount) || 0 });
    setEditing(false);
  };

  const cancel = () => {
    setAmount(holding.amount.toString());
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="border-b border-border py-3 last:border-b-0">
        <p className="mb-1.5 text-xs font-medium text-white">{holding.symbol}</p>
        <Input label="Amount owned" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
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
    <div className="flex items-center border-b border-border py-2.5 last:border-b-0">
      <div className="flex-1">
        <p className="text-xs text-white">{holding.symbol}</p>
        <p className="text-[10px] text-muted-dark">{holding.amount} coins</p>
      </div>
      <button onClick={() => setEditing(true)} className="mr-2 text-muted-dark hover:text-accent">
        <Pencil size={12} />
      </button>
      <button onClick={() => removeCryptoHolding(holding.id)} className="text-muted-dark hover:text-red">
        <Trash2 size={12} />
      </button>
    </div>
  );
}
