import { Shield, AlertOctagon, AlertTriangle, Info } from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, Badge } from '@/components/ui';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { cn } from '@/lib/cn';

export function RadarPage() {
  const { accounts, cryptoHoldings } = useFinanceStore();
  const { prices } = useCryptoPrices();

  const accountTotal = accounts.reduce((sum, a) => sum + a.balance, 0);
  const cryptoTotal = cryptoHoldings.reduce((sum, h) => sum + h.amount * (prices[h.symbol]?.price || 0), 0);
  const total = accountTotal + cryptoTotal;

  // Build alerts dynamically from user data
  const alerts: { severity: 'critical' | 'warning' | 'info'; title: string; description: string }[] = [];

  if (total === 0) {
    alerts.push({ severity: 'info', title: 'Add your accounts', description: 'Go to Settings to add your financial accounts for risk analysis.' });
  } else {
    const cryptoPct = total > 0 ? (cryptoTotal / total) * 100 : 0;
    const checkingTotal = accounts.filter(a => a.type === 'checking').reduce((s, a) => s + a.balance, 0);
    const savingsTotal = accounts.filter(a => a.type === 'savings' || a.type === 'defi').reduce((s, a) => s + a.balance, 0);

    if (cryptoPct > 25) {
      alerts.push({ severity: 'warning', title: `Crypto is ${cryptoPct.toFixed(0)}% of your portfolio`, description: 'Most advisors recommend 5-15% crypto allocation. High volatility could swing your portfolio significantly.' });
    }

    if (checkingTotal > 10000) {
      alerts.push({ severity: 'warning', title: `$${checkingTotal.toLocaleString()} sitting in checking`, description: 'Idle cash loses ~3% per year to inflation. Consider moving excess to savings or yield-earning accounts.' });
    }

    if (savingsTotal > 0) {
      alerts.push({ severity: 'info', title: 'Emergency fund looks healthy', description: `You have $${savingsTotal.toLocaleString()} in savings/yield positions.` });
    }

    if (cryptoHoldings.length === 1) {
      alerts.push({ severity: 'warning', title: 'Single-coin crypto exposure', description: `You only hold ${cryptoHoldings[0].symbol}. Diversifying across 2-3 coins reduces risk.` });
    } else if (cryptoHoldings.length >= 3) {
      alerts.push({ severity: 'info', title: 'Crypto is diversified', description: `${cryptoHoldings.length} different coins. Good spread.` });
    }

    if (cryptoPct < 25 && checkingTotal < 10000) {
      alerts.push({ severity: 'info', title: 'Portfolio looks balanced', description: 'No major concentration risks detected. Keep it up!' });
    }
  }

  const sevIcon = { critical: AlertOctagon, warning: AlertTriangle, info: Info };
  const sevColor = { critical: 'text-red', warning: 'text-amber', info: 'text-accent' };
  const sevBg = { critical: 'bg-red-dim', warning: 'bg-amber-dim', info: 'bg-accent-dim' };

  return (
    <PageWrapper>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">Risk Radar</h1>
        <Badge variant={alerts.some(a => a.severity === 'warning') ? 'amber' : 'green'} dot>
          {alerts.filter(a => a.severity !== 'info').length} alerts
        </Badge>
      </div>

      <Card className="mb-3">
        <CardHeader title="Risk Alerts" subtitle="Based on your actual portfolio" />
        {alerts.map((alert, i) => {
          const Icon = sevIcon[alert.severity];
          return (
            <div key={i} className="mb-3 last:mb-0 rounded-lg border border-border bg-surface p-3">
              <div className="flex items-start gap-2.5">
                <div className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md', sevBg[alert.severity])}>
                  <Icon size={12} className={sevColor[alert.severity]} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{alert.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-dark">{alert.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </Card>
    </PageWrapper>
  );
}
