import type { Account } from '@/stores/useFinanceStore';

/**
 * Reference high-yield savings rate for "opportunity cost" comparisons.
 * Updated periodically — represents a broadly available HYSA rate.
 */
export const REFERENCE_HYSA_RATE = 4.25; // percent APY

/**
 * Minimum checking buffer before flagging idle cash.
 * Cash above this threshold in a checking account is considered "idle."
 */
export const CHECKING_BUFFER = 3000; // dollars

// ─── Computed Types ─────────────────────────────────────────────────────────

export interface YieldPosition {
  accountId: string;
  name: string;
  institution: string;
  balance: number;
  apy: number;
  annualYield: number;
}

export interface IdleCashAlert {
  accountId: string;
  name: string;
  institution: string;
  idleAmount: number;
  currentApy: number;
  potentialApy: number;
  annualOpportunityCost: number;
}

export interface YieldSummary {
  totalEarning: number; // total balance earning yield
  totalNotEarning: number; // total balance NOT earning yield
  blendedApy: number; // weighted average APY across all yield accounts
  projectedAnnualYield: number; // total $ earned per year at current rates
  opportunityCostPerYear: number; // $ left on the table vs reference rate
  positions: YieldPosition[];
  idleAlerts: IdleCashAlert[];
}

// ─── Calculation Engine ─────────────────────────────────────────────────────

export function computeYieldSummary(accounts: Account[]): YieldSummary {
  const positions: YieldPosition[] = [];
  const idleAlerts: IdleCashAlert[] = [];

  let totalEarning = 0;
  let totalNotEarning = 0;
  let weightedApySum = 0;
  let projectedAnnualYield = 0;
  let opportunityCostPerYear = 0;

  for (const account of accounts) {
    if (account.apy && account.apy > 0) {
      // This account is earning yield
      const annualYield = account.balance * (account.apy / 100);
      positions.push({
        accountId: account.id,
        name: account.name,
        institution: account.institution,
        balance: account.balance,
        apy: account.apy,
        annualYield,
      });
      totalEarning += account.balance;
      weightedApySum += account.balance * account.apy;
      projectedAnnualYield += annualYield;

      // Even yield accounts might be below reference rate
      if (account.apy < REFERENCE_HYSA_RATE) {
        const diff = (REFERENCE_HYSA_RATE - account.apy) / 100;
        opportunityCostPerYear += account.balance * diff;
      }
    } else {
      // No APY set — check if this is idle cash
      totalNotEarning += account.balance;

      // Flag checking accounts with balance above buffer
      if (account.type === 'checking' && account.balance > CHECKING_BUFFER) {
        const idleAmount = account.balance - CHECKING_BUFFER;
        const annualCost = idleAmount * (REFERENCE_HYSA_RATE / 100);
        idleAlerts.push({
          accountId: account.id,
          name: account.name,
          institution: account.institution,
          idleAmount,
          currentApy: 0,
          potentialApy: REFERENCE_HYSA_RATE,
          annualOpportunityCost: annualCost,
        });
        opportunityCostPerYear += annualCost;
      }

      // Flag crypto exchange accounts sitting idle (not staking)
      if ((account.type === 'crypto' || account.type === 'defi') && account.balance > 500) {
        const annualCost = account.balance * (REFERENCE_HYSA_RATE / 100);
        idleAlerts.push({
          accountId: account.id,
          name: account.name,
          institution: account.institution,
          idleAmount: account.balance,
          currentApy: 0,
          potentialApy: REFERENCE_HYSA_RATE,
          annualOpportunityCost: annualCost,
        });
        opportunityCostPerYear += annualCost;
      }
    }
  }

  const blendedApy = totalEarning > 0 ? weightedApySum / totalEarning : 0;

  return {
    totalEarning,
    totalNotEarning,
    blendedApy,
    projectedAnnualYield,
    opportunityCostPerYear,
    positions,
    idleAlerts,
  };
}
