import { Wallet, RefreshCw } from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, Badge } from '@/components/ui';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { cn } from '@/lib/cn';

export function DashboardPage() {
  const { accounts, cryptoHoldings, monthlyIncome, monthlyBudget, userName } = useFinanceStore();
  const { prices, loading: cryptoLoading } = useCryptoPrices();

  // Calculate totals
  const accountTotal = accounts.reduce((sum, a) => sum + a.balance, 0);
  const cryptoTotal = cryptoHoldings.reduce((sum, h) => {
    const price = prices[h.symbol]?.price || 0;
    return sum + h.amount * price;
  }, 0);
  const netWorth = accountTotal + cryptoTotal;
  const safeToSpend = Math.max(0, monthlyBudget - (monthlyBudget * 0.7)); // simplified

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted-dark">Welcome back{userName ? `, ${userName}` : ''}</p>
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
        <Badge variant="live" dot>Live</Badge>
      </div>

      {/* Net Worth */}
      <Card gradient className="mb-3">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Net Worth</p>
        <p className="mt-1 font-mono text-[32px] font-bold leading-none">
          ${netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <div className="mt-3 flex gap-4">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Income/mo</p>
            <p className="font-mono text-sm font-semibold text-white">${monthlyIncome.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Budget/mo</p>
            <p className="font-mono text-sm font-semibold text-muted">${monthlyBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Crypto</p>
            <p className="font-mono text-sm font-semibold text-purple">${cryptoTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </Card>

      {/* Safe to Spend */}
      <div className="mb-3 flex items-center gap-3 rounded-xl border border-accent-mid bg-accent/[0.04] p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-dim">
          <Wallet size={20} className="text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-dark">Safe to Spend</p>
          <p className="font-mono text-2xl font-bold text-accent">${safeToSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <p className="text-[10px] text-muted-dark">per month<br/>remaining</p>
      </div>

      {/* Accounts */}
      <Card className="mb-3">
        <CardHeader title="Accounts" subtitle={`${accounts.length} linked`} />
        {accounts.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-dark">No accounts added. Go to Settings to add.</p>
        )}
        {accounts.map((acc) => (
          <div key={acc.id} className="flex items-center border-b border-border py-2.5 last:border-b-0">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">{acc.name}</p>
              <p className="text-[10px] text-muted-dark">{acc.institution} • {acc.type}{acc.apy ? ` • ${acc.apy}% APY` : ''}</p>
            </div>
            <p className="font-mono text-[13px] font-semibold text-white">${acc.balance.toLocaleString()}</p>
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
                    {h.amount} × ${price?.price?.toLocaleString() || '...'} {price && (
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
