import { Routes, Route, Navigate } from 'react-router-dom';
import { NavBar } from '@/components/layout';
import { ChatPanel } from '@/components/chatbot/ChatPanel';
import { useFinanceStore } from '@/stores/useFinanceStore';

import { LoginPage } from '@/pages/Login';
import { OnboardingPage } from '@/pages/Onboarding';
import { DashboardPage } from '@/pages/Dashboard';
import { YieldPage } from '@/pages/Yield';
import { BillsPage } from '@/pages/Bills';
import { GoalsPage } from '@/pages/Goals';
import { RadarPage } from '@/pages/Radar';
import { SettingsPage } from '@/pages/Settings';

function isLoggedIn() {
  try {
    const auth = localStorage.getItem('apex-auth');
    if (!auth) return false;
    return JSON.parse(auth).loggedIn === true;
  } catch {
    return false;
  }
}

export function App() {
  const hasOnboarded = useFinanceStore((s) => s.hasOnboarded);
  const loggedIn = isLoggedIn();

  // Step 1: Not logged in → show login/signup
  if (!loggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
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
