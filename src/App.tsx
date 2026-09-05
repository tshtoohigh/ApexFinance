import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { NavBar } from '@/components/layout';
import { ChatPanel } from '@/components/chatbot/ChatPanel';
import { useAuth } from '@/hooks/useAuth';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Loader2 } from 'lucide-react';

import { LoginPage } from '@/pages/Login';
import { OnboardingPage } from '@/pages/Onboarding';
import { DashboardPage } from '@/pages/Dashboard';
import { YieldPage } from '@/pages/Yield';
import { BillsPage } from '@/pages/Bills';
import { GoalsPage } from '@/pages/Goals';
import { RadarPage } from '@/pages/Radar';
import { SettingsPage } from '@/pages/Settings';
import { TermsPage } from '@/pages/Terms';
import { TransactionsPage } from '@/pages/Transactions';

export function App() {
  const { user, loading: authLoading } = useAuth();
  const { hasOnboarded, isLoading: dataLoading, error, hydrateFromSupabase } = useFinanceStore();

  // Hydrate store from Supabase when user logs in
  useEffect(() => {
    if (user) {
      hydrateFromSupabase(user.id);
    }
  }, [user]);

  // Show loading spinner while checking auth or loading data
  if (authLoading || (user && dataLoading)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-accent" />
        <p className="text-xs text-muted-dark">
          {authLoading ? 'Checking session...' : 'Loading your data...'}
        </p>
      </div>
    );
  }

  // Show error state if data fetch failed
  if (user && error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-medium text-red">Failed to load your data</p>
        <p className="text-xs text-muted-dark">{error}</p>
        <button
          onClick={() => hydrateFromSupabase(user.id)}
          className="mt-2 rounded-lg bg-accent-dim px-4 py-2 text-xs font-semibold text-accent"
        >
          Retry
        </button>
      </div>
    );
  }

  // Step 1: Not logged in → show login/signup
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  // Step 2: Logged in but hasn't onboarded → show onboarding
  if (!hasOnboarded) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  // Step 3: Fully set up → show the app
  return (
    <>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/yield" element={<YieldPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/bills" element={<BillsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/radar" element={<RadarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <NavBar />
      <ChatPanel />
    </>
  );
}
