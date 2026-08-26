import { Shield, AlertOctagon, AlertTriangle, Info, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, Badge, Disclaimer } from '@/components/ui';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { computeRiskSummary, type RiskAlert, type AlertSeverity } from '@/lib/risk-engine';
import { cn } from '@/lib/cn';

const severityConfig: Record<AlertSeverity, { icon: typeof AlertOctagon; bg: string; color: string; label: string }> = {
  critical: { icon: AlertOctagon, bg: 'bg-red-dim', color: 'text-red', label: 'CRITICAL' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-dim', color: 'text-amber', label: 'WARNING' },
  info: { icon: Info, bg: 'bg-accent-dim', color: 'text-accent', label: 'INFO' },
};

export function RadarPage() {
  const { accounts, cryptoHoldings, monthlyBudget } = useFinanceStore();
  const { prices } = useCryptoPrices();

  // Build price map: symbol → USD price
  const cryptoPrices: Record<string, number> = {};
  for (const [symbol, data] of Object.entries(prices)) {
    cryptoPrices[symbol] = data.price;
  }

  const summary = computeRiskSummary(accounts, cryptoHoldings, cryptoPrices, monthlyBudget);

  const criticalCount = summary.alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = summary.alerts.filter((a) => a.severity === 'warning').length;

  return (
    <PageWrapper>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">Risk Radar</h1>
        <Badge
          variant={criticalCount > 0 ? 'red' : warningCount > 0 ? 'amber' : 'green'}
          dot
        >
          {criticalCount + warningCount > 0
            ? `${criticalCount + warningCount} alert${criticalCount + warningCount > 1 ? 's' : ''}`
            : 'Healthy'
          }
        </Badge>
      </div>

      <Disclaimer />

      {/* Score */}
      {summary.hasEnoughData && (
        <Card gradient className="mb-3 text-center">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark">Portfolio Health Score</p>
          <p className={cn(
            'mt-1 font-mono text-3xl font-bold',
            summary.overallScore >= 7 ? 'text-green' : summary.overallScore >= 4 ? 'text-amber' : 'text-red'
          )}>
            {summary.overallScore}/10
          </p>
          <p className="mt-1 text-[10px] text-muted-dark">
            {summary.overallScore >= 7 ? 'Good shape — minor improvements possible'
              : summary.overallScore >= 4 ? 'Some issues to address'
              : 'Significant risks detected — take action'}
          </p>
        </Card>
      )}

      {/* Alerts */}
      <Card className="mb-3">
        <CardHeader title="Risk Analysis" subtitle="Based on your actual portfolio data" />
        {summary.alerts.map((alert) => (
          <AlertRow key={alert.id} alert={alert} />
        ))}
      </Card>
    </PageWrapper>
  );
}

function AlertRow({ alert }: { alert: RiskAlert }) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <div className="mb-3 last:mb-0 rounded-lg border border-border bg-surface p-3">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-start gap-2.5">
          <div className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md', config.bg)}>
            <Icon size={12} className={config.color} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-white">{alert.title}</p>
              <span className={cn('font-mono text-[8px] font-bold', config.color)}>{config.label}</span>
            </div>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-dark">{alert.description}</p>
          </div>
          <ChevronDown size={12} className={cn('mt-1 shrink-0 text-muted-dark transition-transform', expanded && 'rotate-180')} />
        </div>
      </button>

      {/* Expanded: show data points used */}
      {expanded && (
        <div className="mt-2 rounded-md bg-bg px-3 py-2 border border-border">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-dark mb-1">Data used</p>
          <p className="font-mono text-[10px] text-muted leading-relaxed">{alert.dataPoints}</p>
        </div>
      )}
    </div>
  );
}
