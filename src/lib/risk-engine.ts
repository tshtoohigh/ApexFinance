import type { Account, CryptoHolding } from '@/stores/useFinanceStore';

/**
 * Configurable thresholds for risk checks.
 */
export const RISK_CONFIG = {
  emergencyFundMonths: 3, // flag if liquid savings < 3x monthly budget
  concentrationThreshold: 80, // flag if single account > 80% of net worth
  cryptoMaxPercent: 30, // flag if crypto exceeds 30% of total
  idleCashThreshold: 10000, // flag if checking > $10K
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface RiskAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  dataPoints: string; // the actual numbers used, for transparency
}

export interface RiskSummary {
  alerts: RiskAlert[];
  hasEnoughData: boolean;
  overallScore: number; // 1-10, higher = healthier
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export function computeRiskSummary(
  accounts: Account[],
  cryptoHoldings: CryptoHolding[],
  cryptoPrices: Record<string, number>, // symbol → USD price
  monthlyBudget: number
): RiskSummary {
  const alerts: RiskAlert[] = [];
  let score = 10; // start perfect, deduct for issues

  const accountTotal = accounts.reduce((sum, a) => sum + a.balance, 0);
  const cryptoTotal = cryptoHoldings.reduce((sum, h) => sum + h.amount * (cryptoPrices[h.symbol] || 0), 0);
  const netWorth = accountTotal + cryptoTotal;

  // ─── Check: Enough data? ─────────────────────────────────────────────────

  if (accounts.length === 0 && cryptoHoldings.length === 0) {
    return {
      alerts: [{
        id: 'no-data',
        severity: 'info',
        title: 'Not enough data yet',
        description: 'Add your accounts in Settings to get personalized risk analysis.',
        dataPoints: '0 accounts, 0 crypto holdings',
      }],
      hasEnoughData: false,
      overallScore: 0,
    };
  }

  if (accounts.length <= 1 && cryptoHoldings.length === 0) {
    alerts.push({
      id: 'limited-data',
      severity: 'info',
      title: 'Limited data for analysis',
      description: 'Add more accounts to get concentration and diversification checks.',
      dataPoints: `${accounts.length} account(s), $${accountTotal.toLocaleString()} total`,
    });
  }

  // ─── Check 1: Emergency Fund ─────────────────────────────────────────────

  if (monthlyBudget > 0) {
    const liquidAccounts = accounts.filter(
      (a) => a.type === 'checking' || a.type === 'savings'
    );
    const liquidBalance = liquidAccounts.reduce((sum, a) => sum + a.balance, 0);
    const targetEmergency = monthlyBudget * RISK_CONFIG.emergencyFundMonths;
    const monthsCovered = monthlyBudget > 0 ? liquidBalance / monthlyBudget : 0;

    if (liquidBalance < targetEmergency) {
      score -= 3;
      alerts.push({
        id: 'emergency-fund-low',
        severity: 'critical',
        title: `Emergency fund covers only ${monthsCovered.toFixed(1)} months`,
        description: `You have $${liquidBalance.toLocaleString()} in liquid accounts but need $${targetEmergency.toLocaleString()} (${RISK_CONFIG.emergencyFundMonths}× your $${monthlyBudget.toLocaleString()}/mo budget) for a safe emergency fund.`,
        dataPoints: `Liquid: $${liquidBalance.toLocaleString()} | Target: $${targetEmergency.toLocaleString()} | Budget: $${monthlyBudget.toLocaleString()}/mo`,
      });
    } else {
      alerts.push({
        id: 'emergency-fund-ok',
        severity: 'info',
        title: `Emergency fund covers ${monthsCovered.toFixed(1)} months`,
        description: `Your $${liquidBalance.toLocaleString()} in liquid accounts exceeds the ${RISK_CONFIG.emergencyFundMonths}-month target of $${targetEmergency.toLocaleString()}.`,
        dataPoints: `Liquid: $${liquidBalance.toLocaleString()} | Target: $${targetEmergency.toLocaleString()}`,
      });
    }
  } else {
    alerts.push({
      id: 'no-budget',
      severity: 'info',
      title: 'Set a monthly budget for emergency fund analysis',
      description: 'Go to Settings and enter your monthly budget so we can check if your emergency fund is adequate.',
      dataPoints: 'Monthly budget: not set',
    });
  }

  // ─── Check 2: Single-Account Concentration ───────────────────────────────

  if (netWorth > 0 && (accounts.length > 1 || cryptoHoldings.length > 0)) {
    // Check each account
    const allPositions: { name: string; value: number }[] = [
      ...accounts.map((a) => ({ name: `${a.name} (${a.institution})`, value: a.balance })),
      ...cryptoHoldings.map((h) => ({
        name: `${h.symbol} holdings`,
        value: h.amount * (cryptoPrices[h.symbol] || 0),
      })),
    ];

    const largest = allPositions.reduce((max, p) => (p.value > max.value ? p : max), allPositions[0]);
    const largestPct = (largest.value / netWorth) * 100;

    if (largestPct >= RISK_CONFIG.concentrationThreshold) {
      score -= 2;
      alerts.push({
        id: 'concentration-high',
        severity: 'warning',
        title: `${largest.name} is ${largestPct.toFixed(0)}% of your net worth`,
        description: `A single position holding more than ${RISK_CONFIG.concentrationThreshold}% of your wealth means one bad event could significantly impact your finances. Consider diversifying.`,
        dataPoints: `${largest.name}: $${largest.value.toLocaleString()} | Net worth: $${netWorth.toLocaleString()} | Concentration: ${largestPct.toFixed(1)}%`,
      });
    } else if (largestPct >= 50) {
      score -= 1;
      alerts.push({
        id: 'concentration-moderate',
        severity: 'info',
        title: `Largest position is ${largestPct.toFixed(0)}% (${largest.name})`,
        description: `This is within acceptable range but worth monitoring. Aim to keep no single position above ${RISK_CONFIG.concentrationThreshold}%.`,
        dataPoints: `${largest.name}: $${largest.value.toLocaleString()} | Net worth: $${netWorth.toLocaleString()}`,
      });
    }
  }

  // ─── Check 3: Crypto Allocation ──────────────────────────────────────────

  if (cryptoTotal > 0 && netWorth > 0) {
    const cryptoPct = (cryptoTotal / netWorth) * 100;

    if (cryptoPct > RISK_CONFIG.cryptoMaxPercent) {
      score -= 2;
      alerts.push({
        id: 'crypto-overweight',
        severity: 'warning',
        title: `Crypto is ${cryptoPct.toFixed(0)}% of your portfolio`,
        description: `Your crypto allocation ($${cryptoTotal.toLocaleString()}) exceeds the ${RISK_CONFIG.cryptoMaxPercent}% guideline. Crypto is highly volatile — a 50% crash would reduce your net worth by $${(cryptoTotal * 0.5).toLocaleString()}.`,
        dataPoints: `Crypto: $${cryptoTotal.toLocaleString()} | Total: $${netWorth.toLocaleString()} | Allocation: ${cryptoPct.toFixed(1)}%`,
      });
    } else {
      alerts.push({
        id: 'crypto-ok',
        severity: 'info',
        title: `Crypto allocation is ${cryptoPct.toFixed(0)}% — within guidelines`,
        description: `Your $${cryptoTotal.toLocaleString()} in crypto is below the ${RISK_CONFIG.cryptoMaxPercent}% threshold.`,
        dataPoints: `Crypto: $${cryptoTotal.toLocaleString()} | Allocation: ${cryptoPct.toFixed(1)}%`,
      });
    }
  }

  // ─── Check 4: Idle Cash ──────────────────────────────────────────────────

  const checkingAccounts = accounts.filter((a) => a.type === 'checking');
  const totalChecking = checkingAccounts.reduce((sum, a) => sum + a.balance, 0);

  if (totalChecking > RISK_CONFIG.idleCashThreshold) {
    score -= 1;
    alerts.push({
      id: 'idle-cash',
      severity: 'warning',
      title: `$${totalChecking.toLocaleString()} sitting in checking accounts`,
      description: `Cash above ~$${RISK_CONFIG.idleCashThreshold.toLocaleString()} in checking is likely losing purchasing power to inflation (~3%/year). Consider moving excess to a high-yield savings account.`,
      dataPoints: `Checking total: $${totalChecking.toLocaleString()} | Threshold: $${RISK_CONFIG.idleCashThreshold.toLocaleString()}`,
    });
  }

  // Clamp score
  const finalScore = Math.max(1, Math.min(10, score));

  return {
    alerts,
    hasEnoughData: accounts.length > 0 || cryptoHoldings.length > 0,
    overallScore: finalScore,
  };
}
