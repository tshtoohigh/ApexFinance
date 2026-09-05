import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui';
import { useFinanceStore, type Account } from '@/stores/useFinanceStore';
import { formatCurrency } from '@/lib/format';

interface AccountRowProps {
  account: Account;
}

/** A single account row with inline edit (name, balance, APY) and delete. */
export function AccountRow({ account }: AccountRowProps) {
  const { updateAccount, removeAccount } = useFinanceStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(account.name);
  const [balance, setBalance] = useState(account.balance.toString());
  const [apy, setApy] = useState(account.apy?.toString() ?? '');

  const save = () => {
    updateAccount(account.id, {
      name: name.trim() || account.name,
      balance: Number(balance) || 0,
      apy: apy ? Number(apy) : undefined,
    });
    setEditing(false);
  };

  const cancel = () => {
    setName(account.name);
    setBalance(account.balance.toString());
    setApy(account.apy?.toString() ?? '');
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="border-b border-border py-3 last:border-b-0">
        <Input placeholder="Account name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Balance" prefix="$" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} />
        <Input label="APY (optional)" type="number" placeholder="4.15" value={apy} onChange={(e) => setApy(e.target.value)} />
        <div className="flex gap-2">
          <button
            onClick={save}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-accent py-2 text-[11px] font-semibold text-bg"
          >
            <Check size={12} /> Save
          </button>
          <button
            onClick={cancel}
            className="flex items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-[11px] font-semibold text-muted"
          >
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center border-b border-border py-2.5 last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="truncate text-xs text-white">{account.name}</p>
        <p className="text-[10px] text-muted-dark">
          {account.institution || account.type}
          {account.apy ? ` • ${account.apy}% APY` : ''}
        </p>
      </div>
      <p className="px-2 font-mono text-xs text-white">{formatCurrency(account.balance)}</p>
      <button onClick={() => setEditing(true)} className="mr-2 text-muted-dark hover:text-accent">
        <Pencil size={12} />
      </button>
      <button onClick={() => removeAccount(account.id)} className="text-muted-dark hover:text-red">
        <Trash2 size={12} />
      </button>
    </div>
  );
}
