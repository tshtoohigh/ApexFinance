import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
  symbol: string;
  amount: number;
}

export interface FinanceState {
  // Profile
  hasOnboarded: boolean;
  userName: string;
  monthlyIncome: number;
  monthlyBudget: number;

  // Data
  accounts: Account[];
  cryptoHoldings: CryptoHolding[];
  subscriptions: Subscription[];
  goals: Goal[];

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Temporary: API key (will move server-side in P3)
  openRouterApiKey: string;
  setOpenRouterApiKey: (key: string) => void;

  // Actions - Profile
  setOnboarded: (val: boolean) => void;
  setUserName: (name: string) => void;
  setMonthlyIncome: (val: number) => void;
  setMonthlyBudget: (val: number) => void;

  // Actions - Accounts
  addAccount: (account: Account) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  removeAccount: (id: string) => void;

  // Actions - Crypto
  addCryptoHolding: (holding: CryptoHolding) => void;
  updateCryptoHolding: (id: string, updates: Partial<CryptoHolding>) => void;
  removeCryptoHolding: (id: string) => void;

  // Actions - Subscriptions
  addSubscription: (sub: Subscription) => void;
  removeSubscription: (id: string) => void;

  // Actions - Goals
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;

  // Actions - Data sync
  hydrateFromSupabase: (userId: string) => Promise<void>;
  resetAll: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useFinanceStore = create<FinanceState>()((set, get) => ({
  hasOnboarded: false,
  userName: '',
  monthlyIncome: 0,
  monthlyBudget: 0,
  accounts: [],
  cryptoHoldings: [],
  subscriptions: [],
  goals: [],
  isLoading: true,
  error: null,
  openRouterApiKey: localStorage.getItem('apex-openrouter-key') || '',

  // ─── Hydrate from Supabase on login ─────────────────────────────────────

  setOpenRouterApiKey: (key) => {
    set({ openRouterApiKey: key });
    localStorage.setItem('apex-openrouter-key', key); // temporary until P3
  },

  hydrateFromSupabase: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Fetch accounts
      const { data: accounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId);

      // Fetch crypto
      const { data: crypto } = await supabase
        .from('crypto_holdings')
        .select('*')
        .eq('user_id', userId);

      // Fetch subscriptions
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId);

      // Fetch goals
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);

      set({
        hasOnboarded: profile?.has_onboarded ?? false,
        userName: profile?.user_name ?? '',
        monthlyIncome: profile?.monthly_income ?? 0,
        monthlyBudget: profile?.monthly_budget ?? 0,
        accounts: (accounts ?? []).map((a) => ({
          id: a.id,
          name: a.name,
          institution: a.institution,
          type: a.type,
          balance: Number(a.balance),
          apy: a.apy ? Number(a.apy) : undefined,
          notes: a.notes,
        })),
        cryptoHoldings: (crypto ?? []).map((c) => ({
          id: c.id,
          symbol: c.symbol,
          amount: Number(c.amount),
        })),
        subscriptions: (subs ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          amount: Number(s.amount),
          frequency: s.frequency,
          category: s.category,
          nextBill: s.next_bill,
        })),
        goals: (goals ?? []).map((g) => ({
          id: g.id,
          name: g.name,
          target: Number(g.target),
          current: Number(g.current),
          deadline: g.deadline,
          monthlyContribution: Number(g.monthly_contribution),
        })),
        isLoading: false,
      });
    } catch (err: any) {
      console.error('Failed to hydrate from Supabase:', err);
      set({ isLoading: false, error: err.message || 'Failed to load data' });
    }
  },

  // ─── Profile Actions (write to Supabase) ─────────────────────────────────

  setOnboarded: async (val) => {
    set({ hasOnboarded: val });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, has_onboarded: val });
    }
  },

  setUserName: async (name) => {
    set({ userName: name });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, user_name: name });
    }
  },

  setMonthlyIncome: async (val) => {
    set({ monthlyIncome: val });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, monthly_income: val });
    }
  },

  setMonthlyBudget: async (val) => {
    set({ monthlyBudget: val });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, monthly_budget: val });
    }
  },

  // ─── Account Actions ─────────────────────────────────────────────────────

  addAccount: async (account) => {
    set((s) => ({ accounts: [...s.accounts, account] }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('accounts').insert({
        id: account.id,
        user_id: user.id,
        name: account.name,
        institution: account.institution,
        type: account.type,
        balance: account.balance,
        apy: account.apy ?? null,
        notes: account.notes ?? '',
      });
    }
  },

  updateAccount: async (id, updates) => {
    set((s) => ({
      accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
    await supabase.from('accounts').update(updates).eq('id', id);
  },

  removeAccount: async (id) => {
    set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) }));
    await supabase.from('accounts').delete().eq('id', id);
  },

  // ─── Crypto Actions ──────────────────────────────────────────────────────

  addCryptoHolding: async (holding) => {
    set((s) => ({ cryptoHoldings: [...s.cryptoHoldings, holding] }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('crypto_holdings').insert({
        id: holding.id,
        user_id: user.id,
        symbol: holding.symbol,
        amount: holding.amount,
      });
    }
  },

  updateCryptoHolding: async (id, updates) => {
    set((s) => ({
      cryptoHoldings: s.cryptoHoldings.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
    await supabase.from('crypto_holdings').update(updates).eq('id', id);
  },

  removeCryptoHolding: async (id) => {
    set((s) => ({ cryptoHoldings: s.cryptoHoldings.filter((h) => h.id !== id) }));
    await supabase.from('crypto_holdings').delete().eq('id', id);
  },

  // ─── Subscription Actions ────────────────────────────────────────────────

  addSubscription: async (sub) => {
    set((s) => ({ subscriptions: [...s.subscriptions, sub] }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('subscriptions').insert({
        id: sub.id,
        user_id: user.id,
        name: sub.name,
        amount: sub.amount,
        frequency: sub.frequency,
        category: sub.category,
        next_bill: sub.nextBill ?? '',
      });
    }
  },

  removeSubscription: async (id) => {
    set((s) => ({ subscriptions: s.subscriptions.filter((s2) => s2.id !== id) }));
    await supabase.from('subscriptions').delete().eq('id', id);
  },

  // ─── Goal Actions ────────────────────────────────────────────────────────

  addGoal: async (goal) => {
    set((s) => ({ goals: [...s.goals, goal] }));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('goals').insert({
        id: goal.id,
        user_id: user.id,
        name: goal.name,
        target: goal.target,
        current: goal.current,
        deadline: goal.deadline,
        monthly_contribution: goal.monthlyContribution,
      });
    }
  },

  updateGoal: async (id, updates) => {
    set((s) => ({
      goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.target !== undefined) dbUpdates.target = updates.target;
    if (updates.current !== undefined) dbUpdates.current = updates.current;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
    if (updates.monthlyContribution !== undefined) dbUpdates.monthly_contribution = updates.monthlyContribution;
    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from('goals').update(dbUpdates).eq('id', id);
    }
  },

  removeGoal: async (id) => {
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
    await supabase.from('goals').delete().eq('id', id);
  },

  // ─── Reset ───────────────────────────────────────────────────────────────

  resetAll: () => {
    set({
      hasOnboarded: false,
      userName: '',
      monthlyIncome: 0,
      monthlyBudget: 0,
      accounts: [],
      cryptoHoldings: [],
      subscriptions: [],
      goals: [],
      isLoading: false,
      error: null,
    });
  },
}));
