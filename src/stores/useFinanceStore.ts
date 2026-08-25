import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: 'checking' | 'savings' | 'brokerage' | 'retirement' | 'crypto' | 'defi';
  balance: number;
  apy?: number;
  notes?: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  category: string;
  nextBill?: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  monthlyContribution: number;
}

export interface CryptoHolding {
  id: string;
  symbol: string; // BTC, ETH, SOL, etc
  amount: number; // how much user holds
}

export interface FinanceState {
  // User profile
  hasOnboarded: boolean;
  userName: string;
  monthlyIncome: number;
  monthlyBudget: number; // what user wants to spend max

  // Accounts (user enters manually)
  accounts: Account[];

  // Crypto (user enters holdings, prices come from API)
  cryptoHoldings: CryptoHolding[];

  // Subscriptions
  subscriptions: Subscription[];

  // Goals
  goals: Goal[];

  // Settings
  openRouterApiKey: string;

  // Actions
  setOnboarded: (val: boolean) => void;
  setUserName: (name: string) => void;
  setMonthlyIncome: (val: number) => void;
  setMonthlyBudget: (val: number) => void;
  setOpenRouterApiKey: (key: string) => void;

  addAccount: (account: Account) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  removeAccount: (id: string) => void;

  addCryptoHolding: (holding: CryptoHolding) => void;
  updateCryptoHolding: (id: string, updates: Partial<CryptoHolding>) => void;
  removeCryptoHolding: (id: string) => void;

  addSubscription: (sub: Subscription) => void;
  removeSubscription: (id: string) => void;

  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;

  resetAll: () => void;
}

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState = {
  hasOnboarded: false,
  userName: '',
  monthlyIncome: 0,
  monthlyBudget: 0,
  accounts: [] as Account[],
  cryptoHoldings: [] as CryptoHolding[],
  subscriptions: [] as Subscription[],
  goals: [] as Goal[],
  openRouterApiKey: '',
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      ...initialState,

      setOnboarded: (val) => set({ hasOnboarded: val }),
      setUserName: (name) => set({ userName: name }),
      setMonthlyIncome: (val) => set({ monthlyIncome: val }),
      setMonthlyBudget: (val) => set({ monthlyBudget: val }),
      setOpenRouterApiKey: (key) => set({ openRouterApiKey: key }),

      addAccount: (account) =>
        set((s) => ({ accounts: [...s.accounts, account] })),
      updateAccount: (id, updates) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),
      removeAccount: (id) =>
        set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),

      addCryptoHolding: (holding) =>
        set((s) => ({ cryptoHoldings: [...s.cryptoHoldings, holding] })),
      updateCryptoHolding: (id, updates) =>
        set((s) => ({
          cryptoHoldings: s.cryptoHoldings.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        })),
      removeCryptoHolding: (id) =>
        set((s) => ({ cryptoHoldings: s.cryptoHoldings.filter((h) => h.id !== id) })),

      addSubscription: (sub) =>
        set((s) => ({ subscriptions: [...s.subscriptions, sub] })),
      removeSubscription: (id) =>
        set((s) => ({ subscriptions: s.subscriptions.filter((s2) => s2.id !== id) })),

      addGoal: (goal) =>
        set((s) => ({ goals: [...s.goals, goal] })),
      updateGoal: (id, updates) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),
      removeGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      resetAll: () => set(initialState),
    }),
    {
      name: 'apex-finance-storage',
    }
  )
);
