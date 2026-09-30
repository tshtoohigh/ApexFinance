import { useState } from 'react';
import { Plus, Package, ChevronDown } from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, Button, Input, EmptyState } from '@/components/ui';
import { AssetRow } from '@/components/assets/AssetRow';
import { IntentPicker } from '@/components/assets/IntentPicker';
import { useFinanceStore, type PhysicalAsset } from '@/stores/useFinanceStore';
import {
  ASSET_CATEGORIES,
  ASSET_INTENTS,
  getAssetCategory,
  type AssetIntent,
} from '@/lib/assetCategories';
import { formatCurrency, formatPercent } from '@/lib/format';
import { cn } from '@/lib/cn';

/** Sum helpers */
const sumValue = (list: PhysicalAsset[]) =>
  list.reduce((s, a) => s + a.currentValue * a.quantity, 0);
const sumPaid = (list: PhysicalAsset[]) =>
  list.reduce((s, a) => s + a.purchasePrice * a.quantity, 0);

export function AssetsPage() {
  const { physicalAssets, addPhysicalAsset } = useFinanceStore();

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [intent, setIntent] = useState<AssetIntent>('personal');
  const [qty, setQty] = useState('1');
  const [paid, setPaid] = useState('');
  const [value, setValue] = useState('');
  const [openGroups, setOpenGroups] = useState<AssetIntent[]>(['investment', 'resale', 'personal']);

  const resetForm = () => {
    setName(''); setCategory(''); setIntent('personal');
    setQty('1'); setPaid(''); setValue('');
  };

  const handleAdd = () => {
    if (!name.trim() || !category || !value) return;
    addPhysicalAsset({
      id: crypto.randomUUID(),
      name: name.trim(),
      category,
      intent,
      quantity: Math.max(1, Number(qty) || 1),
      purchasePrice: Number(paid) || 0,
      currentValue: Number(value) || 0,
    });
    resetForm();
    setShowAdd(false);
  };

  const toggleGroup = (key: AssetIntent) =>
    setOpenGroups((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalValue = sumValue(physicalAssets);
  const totalPaid = sumPaid(physicalAssets);

  // Money you've actually deployed to make money (investments + resale stock)
  const earning = physicalAssets.filter((a) => a.intent !== 'personal');
  const earningValue = sumValue(earning);
  const earningPaid = sumPaid(earning);
  const earningGain = earningValue - earningPaid;
  const earningRoi = earningPaid > 0 ? (earningGain / earningPaid) * 100 : 0;

  const selectedCat = category ? getAssetCategory(category) : null;
  const canSubmit = Boolean(name.trim() && category && value);

  return (
    <PageWrapper>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted-dark">Everything you own</p>
          <h1 className="text-xl font-bold">Assets</h1>
        </div>
        <Button size="sm" onClick={() => { setShowAdd(!showAdd); if (showAdd) resetForm(); }}>
          <Plus size={13} /> Add
        </Button>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Card gradient glow className="card-sheen mb-3">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">
          Total Asset Value
        </p>
        <p className="animate-rise mt-1.5 font-mono text-[32px] font-bold leading-none tracking-tight">
          {formatCurrency(totalValue)}
        </p>

        {/* Composition by intent */}
        {totalValue > 0 && (
          <div className="mt-4 flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full bg-border">
            {ASSET_INTENTS.map((i) => {
              const share = sumValue(physicalAssets.filter((a) => a.intent === i.key));
              if (share === 0) return null;
              return (
                <div
                  key={i.key}
                  style={{ width: `${(share / totalValue) * 100}%`, backgroundColor: i.color }}
                />
              );
            })}
          </div>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2">
          {ASSET_INTENTS.map((i) => (
            <div key={i.key} className="rounded-lg bg-surface/60 px-2.5 py-2">
              <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-dark">
                {i.short}
              </p>
              <p className="mt-0.5 font-mono text-sm font-semibold" style={{ color: i.color }}>
                {formatCurrency(sumValue(physicalAssets.filter((a) => a.intent === i.key)))}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Performance on money you deployed to grow ─────────────────────── */}
      {earningPaid > 0 && (
        <Card className="mb-3">
          <CardHeader
            title="Performance"
            subtitle="Investments + resale inventory only"
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-dark">Invested</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-muted">{formatCurrency(earningPaid)}</p>
            </div>
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-dark">Worth now</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-white">{formatCurrency(earningValue)}</p>
            </div>
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-dark">Return</p>
              <p className={cn('mt-0.5 font-mono text-sm font-bold', earningGain >= 0 ? 'text-green' : 'text-red')}>
                {formatPercent(earningRoi, 1)}
              </p>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-surface px-3 py-2">
            <p className="text-[11px] text-muted">
              {earningGain >= 0 ? 'Unrealised profit' : 'Unrealised loss'}:{' '}
              <span className={cn('font-mono font-bold', earningGain >= 0 ? 'text-green' : 'text-red')}>
                {earningGain >= 0 ? '+' : ''}{formatCurrency(earningGain)}
              </span>
            </p>
          </div>
        </Card>
      )}

      {/* ── Add form ─────────────────────────────────────────────────────── */}
      {showAdd && (
        <Card className="mb-3">
          <CardHeader title="Add an Asset" subtitle="Anything of value you own" />

          {/* 1. What is it */}
          <p className="mb-1.5 text-[11px] font-medium text-muted">
            1. What is it?
          </p>
          <div className="mb-3 grid grid-cols-4 gap-2">
            {ASSET_CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = category === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl border py-2.5 transition-all',
                    active ? 'border-accent bg-accent/[0.08]' : 'border-border hover:border-border-light'
                  )}
                >
                  <Icon size={16} style={{ color: active ? c.color : '#6B7A93' }} />
                  <span className={cn('text-[9px] font-medium', active ? 'text-white' : 'text-muted-dark')}>
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 2. Why you own it */}
          <p className="mb-1.5 text-[11px] font-medium text-muted">2. Why do you own it?</p>
          <IntentPicker value={intent} onChange={setIntent} />

          {/* 3. Details */}
          <p className="mb-1.5 text-[11px] font-medium text-muted">3. Details</p>
          <Input
            placeholder="Item name (e.g. Rolex Submariner)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input label="Quantity" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
          <Input
            label="What you paid (each)" prefix="$" type="number" placeholder="0"
            value={paid} onChange={(e) => setPaid(e.target.value)}
          />
          <Input
            label="What it's worth today (each)" prefix="$" type="number" placeholder="0"
            value={value} onChange={(e) => setValue(e.target.value)}
          />

          {selectedCat?.hint && (
            <p className="mb-3 rounded-lg bg-surface px-2.5 py-2 text-[10px] leading-snug text-muted-dark">
              💡 {selectedCat.hint}
            </p>
          )}

          <Button fullWidth size="md" onClick={handleAdd} disabled={!canSubmit}>
            {canSubmit ? 'Add to Net Worth' : 'Pick a category and value'}
          </Button>
        </Card>
      )}

      {/* ── Grouped lists ────────────────────────────────────────────────── */}
      {physicalAssets.length === 0 ? (
        <Card>
          <EmptyState
            icon={Package}
            title="Track what you own"
            description="A watch held as an investment, jewelry, a bag you plan to resell, a car — anything of value counts toward your net worth."
            actionLabel="Add your first asset"
            onAction={() => setShowAdd(true)}
          />
        </Card>
      ) : (
        ASSET_INTENTS.map((intentDef) => {
          const group = physicalAssets.filter((a) => a.intent === intentDef.key);
          if (group.length === 0) return null;

          const groupValue = sumValue(group);
          const groupPaid = sumPaid(group);
          const groupGain = groupValue - groupPaid;
          const isOpen = openGroups.includes(intentDef.key);
          const GroupIcon = intentDef.icon;

          return (
            <Card key={intentDef.key} className="mb-3">
              <button
                onClick={() => toggleGroup(intentDef.key)}
                className="flex w-full items-center gap-2.5"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${intentDef.color}1f` }}
                >
                  <GroupIcon size={15} style={{ color: intentDef.color }} />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[13px] font-semibold text-white">{intentDef.label}</p>
                  <p className="text-[10px] text-muted-dark">
                    {group.length} item{group.length > 1 ? 's' : ''}
                    {groupPaid > 0 && intentDef.key !== 'personal' && (
                      <>
                        {' · '}
                        <span className={groupGain >= 0 ? 'text-green' : 'text-red'}>
                          {groupGain >= 0 ? '+' : ''}{formatCurrency(groupGain)}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <p className="font-mono text-sm font-bold" style={{ color: intentDef.color }}>
                  {formatCurrency(groupValue)}
                </p>
                <ChevronDown
                  size={14}
                  className={cn('shrink-0 text-muted-dark transition-transform', isOpen && 'rotate-180')}
                />
              </button>

              {isOpen && (
                <div className="mt-2 border-t border-border pt-1">
                  {group.map((a) => <AssetRow key={a.id} asset={a} />)}
                </div>
              )}
            </Card>
          );
        })
      )}
    </PageWrapper>
  );
}
