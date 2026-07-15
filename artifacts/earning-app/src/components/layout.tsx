import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, ListTodo, Users, Wallet, User as UserIcon } from 'lucide-react';
import { useAuth } from './auth-provider';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isLoading, error } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Initializing wallet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6 bg-background">
        <div className="text-center space-y-4 max-w-sm bg-card p-8 rounded-3xl shadow-lg border border-border animate-scale-in">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Session Expired</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We couldn't verify your secure session. Please restart the application securely from Telegram.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-0 md:pl-20 md:flex md:justify-center">
      <main className="w-full max-w-md min-h-[100dvh] bg-card/50 md:bg-card md:shadow-2xl relative overflow-hidden flex flex-col md:border-x md:border-border">
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-8px_32px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="max-w-md mx-auto flex items-center justify-between px-2 h-20">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-full space-y-1.5 transition-all duration-300 active-scale ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <div className={`relative transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] font-semibold transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-1 right-1/2 translate-x-3 w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_8px_rgba(255,180,0,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
