import { useState } from 'react';
import { Plus, Package, Tag, TrendingUp } from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, Button, Input, Select, Badge, EmptyState } from '@/components/ui';
import { AssetRow } from '@/components/assets/AssetRow';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { ASSET_CATEGORIES, getAssetCategory } from '@/lib/assetCategories';
import { formatCurrency, formatPercent } from '@/lib/format';
import { cn } from '@/lib/cn';

export function AssetsPage() {
  const { physicalAssets, addPhysicalAsset } = useFinanceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Sneakers');
  const [qty, setQty] = useState('1');
  const [paid, setPaid] = useState('');
  const [value, setValue] = useState('');
  const [forSale, setForSale] = useState(false);

  const handleAdd = () => {
    if (!name || !value) return;
    addPhysicalAsset({
      id: crypto.randomUUID(),
      name: name.trim(),
      category,
      quantity: Math.max(1, Number(qty) || 1),
      purchasePrice: Number(paid) || 0,
      currentValue: Number(value) || 0,
      forSale,
    });
    setName(''); setQty('1'); setPaid(''); setValue(''); setForSale(false);
    setShowAdd(false);
  };

  // Totals
  const totalValue = physicalAssets.reduce((s, a) => s + a.currentValue * a.quantity, 0);
  const totalPaid = physicalAssets.reduce((s, a) => s + a.purchasePrice * a.quantity, 0);
  const gain = totalValue - totalPaid;
  const gainPct = totalPaid > 0 ? (gain / totalPaid) * 100 : 0;
  const resaleValue = physicalAssets
    .filter((a) => a.forSale)
    .reduce((s, a) => s + a.currentValue * a.quantity, 0);

  // Group by category for the breakdown
  const byCategory: Record<string, number> = {};
  for (const a of physicalAssets) {
    byCategory[a.category] = (byCategory[a.category] || 0) + a.currentValue * a.quantity;
  }
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  const selectedCat = getAssetCategory(category);

  return (
    <PageWrapper>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted-dark">Things you own</p>
          <h1 className="text-xl font-bold">Assets</h1>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={13} /> Add
        </Button>
      </div>

      {/* Hero total */}
      <Card gradient glow className="card-sheen mb-3">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">
          Total Asset Value
        </p>
        <p className="animate-rise mt-1.5 font-mono text-[32px] font-bold leading-none tracking-tight">
          {formatCurrency(totalValue)}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-surface/60 px-2.5 py-2">
            <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-dark">Cost basis</p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-muted">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="rounded-lg bg-surface/60 px-2.5 py-2">
            <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-dark">Unrealised</p>
            <p className={cn('mt-0.5 font-mono text-sm font-semibold', gain >= 0 ? 'text-green' : 'text-red')}>
              {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
            </p>
          </div>
          <div className="rounded-lg bg-surface/60 px-2.5 py-2">
            <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-dark">Return</p>
            <p className={cn('mt-0.5 font-mono text-sm font-semibold', gain >= 0 ? 'text-green' : 'text-red')}>
              {totalPaid > 0 ? formatPercent(gainPct, 1) : '—'}
            </p>
          </div>
        </div>
      </Card>

      {/* Resale callout */}
      {resaleValue > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-amber/25 bg-amber/[0.05] p-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-dim">
            <Tag size={16} className="text-amber" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-dark">
              Flagged for resale
            </p>
            <p className="font-mono text-base font-bold text-amber">{formatCurrency(resaleValue)}</p>
          </div>
          <p className="text-right text-[10px] leading-snug text-muted-dark">
            potential<br />liquidity
          </p>
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <Card className="mb-3">
          <CardHeader title="Add an Asset" subtitle="Anything worth money that isn't in a bank" />

          {/* Category picker */}
          <p className="mb-2 text-[11px] font-medium text-muted">Category</p>
          <div className="mb-3 grid grid-cols-4 gap-2">
            {ASSET_CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = category === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl border py-2.5 transition-all',
                    active ? 'border-accent bg-accent/[0.08]' : 'border-border hover:border-border-light'
                  )}
                >
                  <Icon size={16} style={{ color: c.color }} />
                  <span className="text-[9px] font-medium text-muted">{c.label}</span>
                </button>
              );
            })}
          </div>

          {selectedCat.hint && (
            <p className="mb-3 rounded-lg bg-surface px-2.5 py-2 text-[10px] text-muted-dark">
              💡 {selectedCat.hint}
            </p>
          )}

          <Input placeholder="Item name (e.g. Jordan 1 Chicago)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Quantity" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
          <Input label="What you paid (each)" prefix="$" type="number" placeholder="0" value={paid} onChange={(e) => setPaid(e.target.value)} />
          <Input label="What it's worth now (each)" prefix="$" type="number" placeholder="0" value={value} onChange={(e) => setValue(e.target.value)} />

          <button
            onClick={() => setForSale(!forSale)}
            className={cn(
              'mb-3 flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-[11px] font-semibold transition-colors',
              forSale ? 'border-amber/40 bg-amber-dim text-amber' : 'border-border bg-surface text-muted-dark'
            )}
          >
            <Tag size={13} /> {forSale ? 'Flagged for resale' : 'Flag for resale'}
          </button>

          <Button fullWidth size="md" onClick={handleAdd}>Add to Net Worth</Button>
        </Card>
      )}

      {/* Breakdown by category */}
      {sorted.length > 1 && (
        <Card className="mb-3">
          <CardHeader title="By Category" />
          <div className="space-y-2.5">
            {sorted.map(([key, amount]) => {
              const cat = getAssetCategory(key);
              const Icon = cat.icon;
              const pct = totalValue > 0 ? (amount / totalValue) * 100 : 0;
              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-white">
                      <Icon size={12} style={{ color: cat.color }} />
                      {cat.label}
                    </span>
                    <span className="font-mono text-muted">
                      {formatCurrency(amount)} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Asset list */}
      <Card>
        <CardHeader
          title="Your Items"
          subtitle={physicalAssets.length > 0 ? `${physicalAssets.length} tracked` : undefined}
          action={
            physicalAssets.length > 0 ? (
              <Badge variant={gain >= 0 ? 'green' : 'red'}>
                <TrendingUp size={10} /> {totalPaid > 0 ? formatPercent(gainPct, 0) : '—'}
              </Badge>
            ) : undefined
          }
        />
        {physicalAssets.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No assets yet"
            description="Track sneakers, watches, collectibles — anything you own that holds value. It all counts toward your net worth."
            actionLabel="Add your first item"
            onAction={() => setShowAdd(true)}
          />
        ) : (
          physicalAssets.map((a) => <AssetRow key={a.id} asset={a} />)
        )}
      </Card>
    </PageWrapper>
  );
}
