import React from 'react';
import { Link, useLocation } from 'wouter';
import { House, Coins, LayoutGrid } from 'lucide-react';
import { useAuth } from './auth-provider';
import { useTelegramBackButton } from '../hooks/use-telegram-back-button';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isLoading, error } = useAuth();
  useTelegramBackButton();

  if (isLoading) {
    return (
      <div className="aurora-view min-h-[100dvh] flex flex-col items-center justify-center gap-6">
        <div className="relative flex items-center justify-center">
          <div
            className="absolute w-24 h-24 rounded-[28px] animate-spin-slow"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0%, oklch(0.68 0.22 300) 30%, oklch(0.8 0.13 196) 55%, transparent 70%)',
              filter: 'blur(2px)',
            }}
          />
          <div className="relative w-[86px] h-[86px] rounded-[26px] glass-strong flex items-center justify-center animate-pulse-glow">
            <span className="text-3xl font-bold text-gradient num">RZ</span>
          </div>
        </div>
        <p className="text-sm font-semibold text-muted-foreground tracking-widest uppercase">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aurora-view min-h-[100dvh] flex items-center justify-center p-6">
        <div className="glass rounded-[28px] p-8 max-w-sm w-full text-center space-y-4 animate-scale-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/15 border border-destructive/25 flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">সেশন যাচাই ব্যর্থ হয়েছে</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            আপনার সেশন যাচাই করা যায়নি। অনুগ্রহ করে Telegram থেকে অ্যাপটি আবার চালু করুন।
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="aurora-view">
      <main
        className="relative z-10 w-full max-w-md mx-auto min-h-[100dvh] flex flex-col pb-32"
      >
        {children}
      </main>
      <DockNav />
    </div>
  );
}

function DockNav() {
  const [location] = useLocation();

  const navItems = [
    { href: '/', label: 'Home', icon: House },
    { href: '/earn', label: 'Earn', icon: Coins },
    { href: '/settings', label: 'Menu', icon: LayoutGrid },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pointer-events-none">
      <div className="max-w-md mx-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="glass-strong rounded-[26px] p-2 flex items-center gap-2 pointer-events-auto">
          {navItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href === '/settings' && ['/profile', '/withdraw', '/refer', '/rules'].includes(location));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 active:scale-95 transition-transform"
                aria-current={isActive ? 'page' : undefined}
                data-testid={`nav-${item.href === '/' ? 'home' : item.href.slice(1)}`}
              >
                <div
                  className={`flex items-center justify-center gap-2 h-12 rounded-2xl transition-all duration-300 ${
                    isActive ? '' : 'opacity-70'
                  }`}
                  style={
                    isActive
                      ? {
                          background: 'var(--grad-brand)',
                          color: 'var(--primary-foreground)',
                          boxShadow: 'var(--shadow-glow-primary)',
                        }
                      : { color: 'var(--muted-foreground)' }
                  }
                >
                  <Icon size={19} strokeWidth={isActive ? 2.6 : 2} />
                  <span
                    className={`text-[11px] font-bold tracking-wide ${isActive ? 'inline' : 'hidden'}`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
