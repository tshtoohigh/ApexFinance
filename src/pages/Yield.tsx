import { TrendingUp, AlertCircle, Info, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, Badge, Button, Input, Select } from '@/components/ui';
import { useFinanceStore, type Account } from '@/stores/useFinanceStore';
import { computeYieldSummary, REFERENCE_HYSA_RATE } from '@/lib/yield-engine';
import { cn } from '@/lib/cn';

export function YieldPage() {
  const { accounts, addAccount } = useFinanceStore();
  const navigate = useNavigate();
  const summary = computeYieldSummary(accounts);
  const [showAdd, setShowAdd] = useState(false);
  const [accName, setAccName] = useState('');
  const [accInst, setAccInst] = useState('');
  const [accBal, setAccBal] = useState('');
  const [accApy, setAccApy] = useState('');
  const [accType, setAccType] = useState<Account['type']>('savings');

  const handleAdd = () => {
    if (!accName || !accBal || !accApy) return;
    addAccount({
      id: crypto.randomUUID(),
      name: accName,
      institution: accInst,
      type: accType,
      balance: Number(accBal),
      apy: Number(accApy),
    });
    setAccName(''); setAccInst(''); setAccBal(''); setAccApy('');
    setShowAdd(false);
  };

  const hasData = accounts.length > 0;

  return (
    <PageWrapper>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">Yield</h1>
        <Badge variant={summary.positions.length > 0 ? 'green' : 'neutral'} dot>
          {summary.positions.length > 0 ? 'Earning' : 'No positions'}
        </Badge>
      </div>

      {/* ─── No Data State ────────────────────────────────────────────────── */}
      {!hasData && (
        <Card className="mb-3 text-center py-8">
          <TrendingUp size={24} className="mx-auto mb-3 text-muted-dark" />
          <p className="text-sm font-medium text-white mb-1">No accounts yet</p>
          <p className="text-[11px] text-muted-dark mb-4">
            Add accounts with APY to see your yield calculations.
          </p>
          <Button size="sm" onClick={() => navigate('/settings')}>Go to Settings</Button>
        </Card>
      )}

      {/* ─── Summary Stats ────────────────────────────────────────────────── */}
      {hasData && (
        <Card gradient className="mb-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Annual Yield</p>
              <p className="mt-1 font-mono text-lg font-bold text-green">
                ${summary.projectedAnnualYield.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Blended APY</p>
              <p className="mt-1 font-mono text-lg font-bold text-accent">
                {summary.blendedApy > 0 ? `${summary.blendedApy.toFixed(2)}%` : '—'}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Left on Table</p>
              <p className="mt-1 font-mono text-lg font-bold text-red">
                ${summary.opportunityCostPerYear.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <Info size={10} className="text-muted-dark" />
            <p className="text-[9px] text-muted-dark">
              "Left on table" compares your rates against {REFERENCE_HYSA_RATE}% (current top HYSA rate).
            </p>
          </div>
        </Card>
      )}

      {/* ─── Idle Cash Alerts ─────────────────────────────────────────────── */}
      {summary.idleAlerts.length > 0 && (
        <Card className="mb-3 border-amber/20">
          <CardHeader title="Idle Cash Detected" subtitle="Money that could be earning yield" />
          {summary.idleAlerts.map((alert) => (
            <div key={alert.accountId} className="mb-3 last:mb-0 rounded-lg bg-amber/[0.04] border border-amber/10 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-white">
                    ${alert.idleAmount.toLocaleString()} idle in {alert.name}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-dark">
                    Currently earning {alert.currentApy}% — could earn {alert.potentialApy}% elsewhere
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-red">
                    You're losing ~${alert.annualOpportunityCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}/year to inflation
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* ─── Earning Positions ────────────────────────────────────────────── */}
      {summary.positions.length > 0 && (
        <Card className="mb-3">
          <CardHeader
            title="Earning Yield"
            subtitle={`${summary.positions.length} position${summary.positions.length > 1 ? 's' : ''} • $${summary.totalEarning.toLocaleString()} deployed`}
          />
          {summary.positions.map((pos) => (
            <div key={pos.accountId} className="flex items-center border-b border-border py-3 last:border-b-0">
              <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-dim">
                <TrendingUp size={14} className="text-green" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white">{pos.name}</p>
                <p className="text-[10px] text-muted-dark">
                  {pos.institution} • <span className="text-green">{pos.apy}% APY</span>
                </p>
              </div>
              <div className="text-right pl-3">
                <p className="font-mono text-[13px] font-semibold text-white">
                  ${pos.balance.toLocaleString()}
                </p>
                <p className="font-mono text-[10px] text-green">
                  +${pos.annualYield.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr
                </p>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* ─── Add Yield-Bearing Account ────────────────────────────────────── */}
      <Card className="mb-3">
        <CardHeader
          title="Add Yield Account"
          subtitle="Track a savings, staking, or lending position"
          action={
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(!showAdd)}>
              <PlusCircle size={12} /> Add
            </Button>
          }
        />

        {showAdd && (
          <div className="rounded-lg border border-accent/20 bg-surface p-3">
            <Input placeholder="Account name (e.g. Marcus Savings)" value={accName} onChange={(e) => setAccName(e.target.value)} />
            <Input placeholder="Institution (e.g. Goldman Sachs)" value={accInst} onChange={(e) => setAccInst(e.target.value)} />
            <Select label="Type" value={accType} onChange={(e) => setAccType(e.target.value as Account['type'])} options={[
              { value: 'savings', label: 'High-Yield Savings' },
              { value: 'defi', label: 'DeFi / Lending' },
              { value: 'crypto', label: 'Staking' },
              { value: 'brokerage', label: 'Money Market' },
            ]} />
            <Input label="Balance" prefix="$" type="number" placeholder="50,000" value={accBal} onChange={(e) => setAccBal(e.target.value)} />
            <Input label="APY (%)" type="number" placeholder="4.25" value={accApy} onChange={(e) => setAccApy(e.target.value)} />
            <Button fullWidth size="sm" onClick={handleAdd}>Save Position</Button>
          </div>
        )}
      </Card>
    </PageWrapper>
  );
}
