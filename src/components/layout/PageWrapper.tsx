import type { ReactNode } from 'react';

export function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-[430px] animate-fade-in overflow-y-auto px-4 pb-24 pt-5">
      {children}
    </main>
  );
}
