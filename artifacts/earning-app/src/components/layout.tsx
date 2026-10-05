import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, ListTodo, Users, Wallet, User as UserIcon } from 'lucide-react';
import { useAuth } from './auth-provider';
import { BrandMark } from './page-header';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isLoading, error } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center page-canvas">
        <div className="flex flex-col items-center gap-3">
          <BrandMark />
          <div className="w-9 h-9 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6 page-canvas">
        <div className="text-center space-y-4 max-w-sm bg-card rounded-3xl border shadow-sm p-8">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 className="text-xl font-extrabold">Authentication Failed</h1>
          <p className="text-muted-foreground text-sm">We couldn't verify your session. Please restart the app from Telegram.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] page-canvas pb-24 md:pb-0 md:pl-[5.25rem]">
      <SideNav />
      <main className="w-full max-w-md mx-auto min-h-[100dvh] bg-white/70 md:bg-white/80 md:shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_24px_60px_-28px_rgba(37,99,235,0.25)] md:my-0 relative overflow-hidden flex flex-col">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

const navItems = [
  { href: '/', label: 'Home', short: 'Home', icon: Home },
  { href: '/earn', label: 'Earn', short: 'Earn', icon: ListTodo },
  { href: '/refer', label: 'Refer', short: 'Refer', icon: Users },
  { href: '/withdraw', label: 'Withdraw', short: 'Cash', icon: Wallet },
  { href: '/profile', label: 'Profile', short: 'Me', icon: UserIcon },
];

function SideNav() {
  const [location] = useLocation();
  return (
    <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-[5.25rem] z-40 flex-col items-center py-5 bg-white/90 backdrop-blur-xl border-r border-border">
      <BrandMark />
      <div className="flex-1 flex flex-col items-center justify-center gap-2 w-full px-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full rounded-2xl py-2.5 flex flex-col items-center gap-1 transition-all ${
                isActive ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' : 'text-slate-400 hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold">{item.short}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto flex items-center justify-between px-1.5 h-[4.25rem] rounded-[1.6rem] bg-white/95 backdrop-blur-xl border border-white shadow-[0_12px_40px_-16px_rgba(37,99,235,0.45)]">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 h-full flex items-center justify-center"
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <div
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[3.4rem] h-14 rounded-2xl transition-all ${
                  isActive ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'text-slate-400'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold">{item.short}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
