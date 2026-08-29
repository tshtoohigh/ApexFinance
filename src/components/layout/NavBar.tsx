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
    <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-surface/80 px-1 pb-2.5 pt-2 backdrop-blur-2xl">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.key;
        return (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            className={cn(
              'group flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition-all duration-200',
              active ? 'opacity-100' : 'opacity-45 hover:opacity-75'
            )}
          >
            <div className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200',
              active && 'bg-accent/[0.12]'
            )}>
              <Icon
                size={18}
                strokeWidth={active ? 2.2 : 1.8}
                className={cn('transition-colors', active ? 'text-accent' : 'text-muted')}
              />
            </div>
            <span className={cn('text-[9px] font-semibold transition-colors', active ? 'text-accent' : 'text-muted-dark')}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
