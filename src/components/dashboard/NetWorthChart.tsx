import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { formatCompact, formatCurrency } from '@/lib/format';

export function NetWorthChart() {
  const history = useFinanceStore((s) => s.netWorthHistory);

  // Need at least 2 points to draw a meaningful line
  if (history.length < 2) {
    return (
      <Card className="mb-3">
        <CardHeader title="Net Worth History" subtitle="Tracked over time" />
        <div className="flex flex-col items-center py-6 text-center">
          <TrendingUp size={22} className="mb-2 text-muted-dark" />
          <p className="text-[11px] text-muted-dark">
            Your net worth is being tracked. Check back over the coming days to watch the trend line grow.
          </p>
        </div>
      </Card>
    );
  }

  const data = history.map((s) => ({
    date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value: s.value,
  }));

  const first = history[0].value;
  const last = history[history.length - 1].value;
  const change = last - first;
  const changePct = first > 0 ? (change / first) * 100 : 0;
  const positive = change >= 0;

  return (
    <Card className="mb-3">
      <CardHeader
        title="Net Worth History"
        subtitle={`${positive ? '+' : ''}${formatCurrency(change)} (${changePct.toFixed(1)}%) tracked`}
      />
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={positive ? '#00E68A' : '#FF4D6A'} stopOpacity={0.3} />
              <stop offset="100%" stopColor={positive ? '#00E68A' : '#FF4D6A'} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#4A5568', fontSize: 9 }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#4A5568', fontSize: 9 }}
            tickFormatter={(v) => formatCompact(v)}
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: '#141C2E',
              border: '1px solid #1E293B',
              borderRadius: '8px',
              fontSize: '11px',
            }}
            formatter={(v: number) => [formatCurrency(v), 'Net Worth']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={positive ? '#00E68A' : '#FF4D6A'}
            strokeWidth={2}
            fill="url(#nwGradient)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
