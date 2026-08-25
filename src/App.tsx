import { Routes, Route, Navigate } from 'react-router-dom';
import { NavBar } from '@/components/layout';
import { ChatPanel } from '@/components/chatbot/ChatPanel';
import { useFinanceStore } from '@/stores/useFinanceStore';

import { OnboardingPage } from '@/pages/Onboarding';
import { DashboardPage } from '@/pages/Dashboard';
import { YieldPage } from '@/pages/Yield';
import { BillsPage } from '@/pages/Bills';
import { GoalsPage } from '@/pages/Goals';
import { RadarPage } from '@/pages/Radar';
import { SettingsPage } from '@/pages/Settings';

export function App() {
  const hasOnboarded = useFinanceStore((s) => s.hasOnboarded);

  // If user hasn't onboarded, redirect to onboarding
  if (!hasOnboarded) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/yield" element={<YieldPage />} />
        <Route path="/bills" element={<BillsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/radar" element={<RadarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <NavBar />
      <ChatPanel />
    </>
  );
}
