import { useState } from 'react';
import { Pencil, Trash2, Check, X, Tag } from 'lucide-react';
import { Input, Select } from '@/components/ui';
import { useFinanceStore, type PhysicalAsset } from '@/stores/useFinanceStore';
import { ASSET_CATEGORIES, getAssetCategory } from '@/lib/assetCategories';
import { formatCurrency, formatPercent } from '@/lib/format';
import { cn } from '@/lib/cn';

/** One owned item, with inline editing and profit/loss vs what you paid. */
export function AssetRow({ asset }: { asset: PhysicalAsset }) {
  const { updatePhysicalAsset, removePhysicalAsset } = useFinanceStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(asset.name);
  const [category, setCategory] = useState(asset.category);
  const [qty, setQty] = useState(asset.quantity.toString());
  const [paid, setPaid] = useState(asset.purchasePrice.toString());
  const [value, setValue] = useState(asset.currentValue.toString());
  const [forSale, setForSale] = useState(asset.forSale);

  const save = () => {
    updatePhysicalAsset(asset.id, {
      name: name.trim() || asset.name,
      category,
      quantity: Math.max(1, Number(qty) || 1),
      purchasePrice: Number(paid) || 0,
      currentValue: Number(value) || 0,
      forSale,
    });
    setEditing(false);
  };

  const cancel = () => {
    setName(asset.name); setCategory(asset.category);
    setQty(asset.quantity.toString());
    setPaid(asset.purchasePrice.toString());
    setValue(asset.currentValue.toString());
    setForSale(asset.forSale);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="border-b border-border py-3 last:border-b-0">
        <Input placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} />
        <Select
          label="Category" value={category} onChange={(e) => setCategory(e.target.value)}
          options={ASSET_CATEGORIES.map((c) => ({ value: c.key, label: c.label }))}
        />
        <Input label="Quantity" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
        <Input label="Paid (each)" prefix="$" type="number" value={paid} onChange={(e) => setPaid(e.target.value)} />
        <Input label="Worth now (each)" prefix="$" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        <button
          onClick={() => setForSale(!forSale)}
          className={cn(
            'mb-3 flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-[11px] font-semibold transition-colors',
            forSale ? 'border-amber/40 bg-amber-dim text-amber' : 'border-border bg-surface text-muted-dark'
          )}
        >
          <Tag size={12} /> {forSale ? 'Listed for resale' : 'Not for sale'}
        </button>
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

  const cat = getAssetCategory(asset.category);
  const Icon = cat.icon;
  const totalValue = asset.currentValue * asset.quantity;
  const totalPaid = asset.purchasePrice * asset.quantity;
  const gain = totalValue - totalPaid;
  const gainPct = totalPaid > 0 ? (gain / totalPaid) * 100 : 0;
  const up = gain >= 0;

  return (
    <div className="flex items-center border-b border-border py-3 last:border-b-0">
      <div className={cn('mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', cat.bgClass)}>
        <Icon size={18} style={{ color: cat.color }} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[13px] font-semibold text-white">{asset.name}</p>
          {asset.forSale && (
            <span className="shrink-0 rounded bg-amber-dim px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-amber">
              Resale
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-dark">
          {cat.label}{asset.quantity > 1 ? ` · ${asset.quantity}×` : ''} · paid {formatCurrency(totalPaid)}
        </p>
      </div>

      <div className="pl-2 text-right">
        <p className="font-mono text-[13px] font-semibold text-white">{formatCurrency(totalValue)}</p>
        {totalPaid > 0 && (
          <p className={cn('font-mono text-[10px] font-medium', up ? 'text-green' : 'text-red')}>
            {up ? '+' : ''}{formatCurrency(gain)} ({formatPercent(gainPct, 0)})
          </p>
        )}
      </div>

      <div className="ml-2 flex shrink-0 gap-1.5">
        <button onClick={() => setEditing(true)} className="text-muted-dark hover:text-accent">
          <Pencil size={12} />
        </button>
        <button onClick={() => removePhysicalAsset(asset.id)} className="text-muted-dark hover:text-red">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
