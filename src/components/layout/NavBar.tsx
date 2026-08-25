import { useLocation, useNavigate } from 'react-router-dom';
import { Home, TrendingUp, Receipt, Target, Shield, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV = [
  { key: '/', label: 'Home', icon: Home },
  { key: '/yield', label: 'Yield', icon: TrendingUp },
  { key: '/bills', label: 'Bills', icon: Receipt },
  { key: '/goals', label: 'Goals', icon: Target },
  { key: '/radar', label: 'Radar', icon: Shield },
  { key: '/settings', label: 'Settings', icon: Settings },
];

export function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-surface/95 px-1 pb-2.5 pt-1.5 backdrop-blur-xl">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.key;
        return (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 transition-all',
              active ? 'bg-accent/[0.06] opacity-100' : 'opacity-40 hover:opacity-70'
            )}
          >
            <Icon size={18} strokeWidth={1.8} className={active ? 'text-accent' : 'text-muted'} />
            <span className={cn('text-[9px] font-semibold', active ? 'text-accent' : 'text-muted-dark')}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
