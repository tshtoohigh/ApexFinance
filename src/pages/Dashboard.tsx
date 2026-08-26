import { useState } from 'react';
import { Wallet, RefreshCw, Info, X } from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, Badge } from '@/components/ui';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { computeDashboardSummary } from '@/lib/dashboard-engine';
import { cn } from '@/lib/cn';

export function DashboardPage() {
  const { accounts, cryptoHoldings, subscriptions, goals, monthlyIncome, monthlyBudget, userName } = useFinanceStore();
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

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted-dark">
            {userName ? `Welcome back, ${userName}` : 'Welcome back'}
          </p>
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
        <Badge variant="live" dot>Live</Badge>
      </div>

      {/* Net Worth */}
      <Card gradient className="mb-3">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Net Worth</p>
        <p className="mt-1 font-mono text-[32px] font-bold leading-none">
          ${summary.netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <div className="mt-3 flex gap-4">
          <MiniStat label="Income/mo" value={`$${summary.monthlyIncome.toLocaleString()}`} color="text-white" />
          <MiniStat label="Budget/mo" value={`$${summary.monthlyBudget.toLocaleString()}`} color="text-muted" />
          <MiniStat label="Crypto" value={`$${summary.cryptoTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} color="text-purple" />
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
              ${summary.safeToSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              <span className="ml-2 text-sm font-medium text-muted-dark">/mo</span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm font-semibold text-accent">
              ${summary.safeToSpendDaily.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
                <span className="text-white">${summary.monthlyBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-dark">− Recurring Bills ({subscriptions.length})</span>
                <span className="text-red">−${summary.totalRecurringBills.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-dark">− Goal Contributions ({goals.length})</span>
                <span className="text-red">−${summary.totalGoalContributions.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="mt-1 border-t border-border pt-1 flex justify-between font-semibold">
                <span className="text-accent">= Safe to Spend</span>
                <span className="text-accent">${summary.safeToSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
              </div>
              <div className="flex justify-between text-muted-dark">
                <span>÷ {summary.daysLeftInMonth} days remaining</span>
                <span className="text-accent">${summary.safeToSpendDaily.toLocaleString(undefined, { maximumFractionDigits: 0 })}/day</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accounts */}
      <Card className="mb-3">
        <CardHeader title="Accounts" subtitle={accounts.length > 0 ? `${accounts.length} linked` : 'None yet'} />
        {accounts.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-dark">No accounts added. Go to Settings to add.</p>
        )}
        {accounts.map((acc) => (
          <div key={acc.id} className="flex items-center border-b border-border py-2.5 last:border-b-0">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">{acc.name}</p>
              <p className="text-[10px] text-muted-dark">
                {acc.institution} • {acc.type}{acc.apy ? ` • ${acc.apy}% APY` : ''}
              </p>
            </div>
            <p className="font-mono text-[13px] font-semibold text-white">
              ${acc.balance.toLocaleString()}
            </p>
          </div>
        ))}
      </Card>

      {/* Live Crypto */}
      {cryptoHoldings.length > 0 && (
        <Card className="mb-3">
          <CardHeader
            title="Crypto (Live)"
            subtitle={cryptoLoading ? 'Fetching prices...' : 'CoinGecko • Updates every 60s'}
            action={<RefreshCw size={12} className={cn('text-muted-dark', cryptoLoading && 'animate-spin')} />}
          />
          {cryptoHoldings.map((h) => {
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
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">{label}</p>
      <p className={`font-mono text-sm font-semibold ${color}`}>{value}</p>
    </div>
  );
}
