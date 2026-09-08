import { useState, useEffect } from 'react';
import { Wallet, RefreshCw, Info, X } from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, Badge, SkeletonRow } from '@/components/ui';
import { NetWorthChart } from '@/components/dashboard/NetWorthChart';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { computeDashboardSummary } from '@/lib/dashboard-engine';
import { formatCurrency, formatCompact, greeting, initialOf } from '@/lib/format';
import { cn } from '@/lib/cn';

export function DashboardPage() {
  const { accounts, cryptoHoldings, subscriptions, goals, monthlyIncome, monthlyBudget, userName, recordNetWorthSnapshot } = useFinanceStore();
  const { prices, loading: cryptoLoading } = useCryptoPrices();

  // Build price map
  const cryptoPrices: Record<string, number> = {};
  for (const [symbol, data] of Object.entries(prices)) {
    cryptoPrices[symbol] = data.price;
  }

  const summary = computeDashboardSummary(
    accounts, cryptoHoldings, cryptoPrices, subscriptions, goals, monthlyIncome, monthlyBudget
  );

  const [showFormula, setShowFormula] = useState(false);

  // Record a daily net-worth snapshot once crypto prices have loaded and there's data.
  // recordNetWorthSnapshot dedupes to one entry per day.
  useEffect(() => {
    if (!cryptoLoading && summary.netWorth > 0) {
      recordNetWorthSnapshot(summary.netWorth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cryptoLoading, summary.netWorth]);

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted-dark">{greeting()}{userName ? ',' : ''}</p>
          <h1 className="text-xl font-bold">{userName || 'Dashboard'}</h1>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-sm font-bold text-accent">
          {initialOf(userName)}
        </div>
      </div>

      {/* Net Worth */}
      <Card gradient glow className="card-sheen mb-3">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Total Net Worth</p>
          <Badge variant="live" dot>Live</Badge>
        </div>
        <p className="mt-1.5 font-mono text-[34px] font-bold leading-none tracking-tight animate-rise">
          {formatCurrency(summary.netWorth)}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniStat label="Income/mo" value={formatCompact(summary.monthlyIncome)} color="text-white" />
          <MiniStat label="Budget/mo" value={formatCompact(summary.monthlyBudget)} color="text-muted" />
          <MiniStat label="Crypto" value={formatCompact(summary.cryptoTotal)} color="text-purple" />
        </div>
      </Card>

      {/* Safe to Spend */}
      <div className="relative mb-3 rounded-xl border border-accent-mid bg-accent/[0.04] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-dim">
            <Wallet size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-dark">
                Safe to Spend
              </p>
              <button onClick={() => setShowFormula(!showFormula)} className="text-muted-dark hover:text-accent">
                <Info size={10} />
              </button>
            </div>
            <p className="font-mono text-2xl font-bold text-accent">
              {formatCurrency(summary.safeToSpend)}
              <span className="ml-2 text-sm font-medium text-muted-dark">/mo</span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm font-semibold text-accent">
              {formatCurrency(summary.safeToSpendDaily)}
            </p>
            <p className="text-[9px] text-muted-dark">/day • {summary.daysLeftInMonth}d left</p>
          </div>
        </div>

        {/* Formula Tooltip */}
        {showFormula && (
          <div className="mt-3 rounded-lg border border-border bg-bg p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold text-muted">How this is calculated</p>
              <button onClick={() => setShowFormula(false)} className="text-muted-dark hover:text-white">
                <X size={10} />
              </button>
            </div>
            <div className="space-y-1 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-muted-dark">Monthly Budget</span>
                <span className="text-white">{formatCurrency(summary.monthlyBudget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-dark">− Recurring Bills ({subscriptions.length})</span>
                <span className="text-red">−{formatCurrency(summary.totalRecurringBills)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-dark">− Goal Contributions ({goals.length})</span>
                <span className="text-red">−{formatCurrency(summary.totalGoalContributions)}</span>
              </div>
              <div className="mt-1 border-t border-border pt-1 flex justify-between font-semibold">
                <span className="text-accent">= Safe to Spend</span>
                <span className="text-accent">{formatCurrency(summary.safeToSpend)}/mo</span>
              </div>
              <div className="flex justify-between text-muted-dark">
                <span>÷ {summary.daysLeftInMonth} days remaining</span>
                <span className="text-accent">{formatCurrency(summary.safeToSpendDaily)}/day</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Net Worth History Chart */}
      <NetWorthChart />

      {/* Accounts */}
      <Card className="mb-3">
        <CardHeader title="Accounts" subtitle={accounts.length > 0 ? `${accounts.length} linked` : 'None yet'} />
        {accounts.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-dark">No accounts added. Go to Settings to add.</p>
        )}
        {accounts.map((acc) => {
          return (
            <div key={acc.id} className="flex items-center border-b border-border py-2.5 last:border-b-0">
              <div className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-[11px] font-bold uppercase text-accent">
                {acc.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-[13px] font-medium text-white">{acc.name}</p>
                <p className="text-[10px] capitalize text-muted-dark">
                  {acc.institution ? `${acc.institution} • ` : ''}{acc.type}{acc.apy ? ` • ${acc.apy}% APY` : ''}
                </p>
              </div>
              <p className="font-mono text-[13px] font-semibold text-white">
                {formatCurrency(acc.balance)}
              </p>
            </div>
          );
        })}
      </Card>

      {/* Live Crypto */}
      {cryptoHoldings.length > 0 && (
        <Card className="mb-3">
          <CardHeader
            title="Crypto (Live)"
            subtitle={cryptoLoading ? 'Fetching prices...' : 'CoinGecko • Updates every 60s'}
            action={<RefreshCw size={12} className={cn('text-muted-dark', cryptoLoading && 'animate-spin')} />}
          />
          {cryptoLoading && Object.keys(prices).length === 0
            ? cryptoHoldings.map((h) => <SkeletonRow key={h.id} />)
            : cryptoHoldings.map((h) => {
                const price = prices[h.symbol];
                const value = price ? h.amount * price.price : 0;
                return (
                  <div key={h.id} className="flex items-center border-b border-border py-2.5 last:border-b-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-white">{h.symbol}</p>
                      <p className="text-[10px] text-muted-dark">
                        {h.amount} × ${price?.price?.toLocaleString() || '...'}{' '}
                        {price && (
                          <span className={price.change24h >= 0 ? 'text-green' : 'text-red'}>
                            ({price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(1)}%)
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="font-mono text-[13px] font-semibold text-white">
                      ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                );
              })}
        </Card>
      )}
    </PageWrapper>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg bg-surface/60 px-2.5 py-2">
      <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-dark">{label}</p>
      <p className={`mt-0.5 font-mono text-sm font-semibold ${color}`}>{value}</p>
    </div>
  );
}
