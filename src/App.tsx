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

export function App() {
  const { user, loading } = useAuth();
  const hasOnboarded = useFinanceStore((s) => s.hasOnboarded);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={24} className="animate-spin text-accent" />
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
        <Route path="/bills" element={<BillsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/radar" element={<RadarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <NavBar />
      <ChatPanel />
    </>
  );
}
