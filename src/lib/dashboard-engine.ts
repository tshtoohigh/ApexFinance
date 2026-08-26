import type { Account, CryptoHolding, Subscription, Goal } from '@/stores/useFinanceStore';

/**
 * Dashboard Calculation Engine
 * 
 * All values are derived from the user's stored data.
 * No hardcoded numbers — if data is missing, values show as $0.
 */

export interface DashboardSummary {
  netWorth: number;
  accountTotal: number;
  cryptoTotal: number;
  monthlyIncome: number;
  monthlyBudget: number;
  totalRecurringBills: number;
  totalGoalContributions: number;
  safeToSpend: number;
  safeToSpendDaily: number;
  daysLeftInMonth: number;
}

/**
 * Safe to Spend Formula:
 * 
 *   Safe to Spend = Monthly Budget − Recurring Bills − Goal Contributions
 * 
 * This represents how much discretionary money you have left to spend
 * this month after accounting for fixed costs and savings commitments.
 * 
 * - Monthly Budget: user-set spending limit (from profile)
 * - Recurring Bills: sum of all tracked subscriptions (monthly frequency)
 * - Goal Contributions: sum of monthly contributions to active goals
 * 
 * The daily amount divides by remaining days in the current month.
 */
export function computeDashboardSummary(
  accounts: Account[],
  cryptoHoldings: CryptoHolding[],
  cryptoPrices: Record<string, number>,
  subscriptions: Subscription[],
  goals: Goal[],
  monthlyIncome: number,
  monthlyBudget: number
): DashboardSummary {
  // Net worth
  const accountTotal = accounts.reduce((sum, a) => sum + a.balance, 0);
  const cryptoTotal = cryptoHoldings.reduce(
    (sum, h) => sum + h.amount * (cryptoPrices[h.symbol] || 0),
    0
  );
  const netWorth = accountTotal + cryptoTotal;

  // Recurring bills (monthly subscriptions)
  const totalRecurringBills = subscriptions
    .filter((s) => s.frequency === 'monthly')
    .reduce((sum, s) => sum + s.amount, 0);

  // Goal contributions (monthly amounts committed)
  const totalGoalContributions = goals.reduce(
    (sum, g) => sum + g.monthlyContribution,
    0
  );

  // Safe to Spend = Budget − Bills − Goals
  const safeToSpend = Math.max(0, monthlyBudget - totalRecurringBills - totalGoalContributions);

  // Days remaining in current month
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate() + 1; // include today
  const safeToSpendDaily = daysLeft > 0 ? safeToSpend / daysLeft : safeToSpend;

  return {
    netWorth,
    accountTotal,
    cryptoTotal,
    monthlyIncome,
    monthlyBudget,
    totalRecurringBills,
    totalGoalContributions,
    safeToSpend,
    safeToSpendDaily,
    daysLeftInMonth: daysLeft,
  };
}
