import { TrendingUp, AlertCircle } from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, Badge } from '@/components/ui';
import { useFinanceStore } from '@/stores/useFinanceStore';

export function YieldPage() {
  const { accounts } = useFinanceStore();

  const savingsAccounts = accounts.filter((a) => a.apy && a.apy > 0);
  const idleAccounts = accounts.filter((a) => a.type === 'checking' && a.balance > 5000);
  const totalEarning = savingsAccounts.reduce((sum, a) => sum + a.balance * (a.apy! / 100), 0);

  return (
    <PageWrapper>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">Yield</h1>
        <Badge variant="green" dot>Earning</Badge>
      </div>

      {/* Summary */}
      <Card gradient className="mb-3">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Projected Annual Yield</p>
        <p className="mt-1 font-mono text-2xl font-bold text-green">
          ${totalEarning.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr
        </p>
        <p className="mt-1 text-[10px] text-muted-dark">From {savingsAccounts.length} earning positions</p>
      </Card>

      {/* Idle Cash Alerts */}
      {idleAccounts.length > 0 && (
        <Card className="mb-3 border-amber/20">
          <CardHeader title="Idle Cash Detected" subtitle="Losing value to inflation" />
          {idleAccounts.map((acc) => {
            const idle = acc.balance - 5000;
            const potentialYield = idle * 0.042; // assume 4.2% available
            return (
              <div key={acc.id} className="mb-2 flex items-start gap-2 rounded-lg bg-amber/[0.04] p-3">
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber" />
                <div>
                  <p className="text-xs font-medium text-white">${idle.toLocaleString()} idle in {acc.name}</p>
                  <p className="text-[10px] text-muted-dark">Could earn ~${potentialYield.toFixed(0)}/yr at 4.2% APY</p>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* Earning Positions */}
      <Card>
        <CardHeader title="Earning Yield" subtitle="Active positions" />
        {savingsAccounts.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-dark">No yield positions. Add savings accounts with APY in Settings.</p>
        )}
        {savingsAccounts.map((acc) => (
          <div key={acc.id} className="flex items-center border-b border-border py-3 last:border-b-0">
            <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-dim">
              <TrendingUp size={14} className="text-green" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white">{acc.name}</p>
              <p className="text-[10px] text-muted-dark">{acc.institution} • {acc.apy}% APY</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[13px] font-semibold text-white">${acc.balance.toLocaleString()}</p>
              <p className="font-mono text-[10px] text-green">+${(acc.balance * (acc.apy! / 100)).toFixed(0)}/yr</p>
            </div>
          </div>
        ))}
      </Card>
    </PageWrapper>
  );
}
