import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, ListTodo, Users, Wallet, User as UserIcon } from 'lucide-react';
import { useAuth } from './auth-provider';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isLoading, error } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6 bg-background">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 className="text-xl font-bold">Authentication Failed</h1>
          <p className="text-muted-foreground text-sm">We couldn't verify your session. Please restart the app from Telegram.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-0 md:pl-20">
      <main className="w-full max-w-md mx-auto min-h-[100dvh] bg-background shadow-2xl relative overflow-hidden flex flex-col">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/earn', label: 'Earn', icon: ListTodo },
    { href: '/refer', label: 'Refer', icon: Users },
    { href: '/withdraw', label: 'Withdraw', icon: Wallet },
    { href: '/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border/60 shadow-[0_-4px_24px_rgba(23,48,72,0.08)] pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-between px-2 h-16">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-full space-y-1 rounded-xl transition-all duration-200 active:scale-95`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <div className={`relative transition-transform ${isActive ? 'translate-y-[-2px]' : ''}`}>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  style={isActive ? { color: '#173A5E' } : { color: '#64748B' }}
                />
                {isActive && (
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #173A5E, #315B7B)' }}
                  />
                )}
              </div>
              <span
                className="text-[10px] font-semibold transition-all"
                style={isActive ? { color: '#173A5E' } : { color: '#64748B' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
