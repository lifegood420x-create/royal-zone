import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from './auth-provider';
import { BrandMark } from './page-header';
import {
  LayoutDashboard,
  Users,
  Settings,
  CreditCard,
  ListTodo,
  ChevronLeft,
  ShieldCheck,
} from 'lucide-react';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const [location] = useLocation();

  if (!isAdmin) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 page-canvas">
        <div className="bg-card rounded-3xl border shadow-sm p-8 max-w-sm text-center">
          <h1 className="text-2xl font-extrabold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-center mb-6">You do not have permission to view the admin area.</p>
          <Link href="/" className="inline-flex px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold">Return Home</Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/payouts', label: 'Payouts', icon: CreditCard },
    { href: '/verifications', label: 'Verify', icon: ShieldCheck },
    { href: '/users', label: 'Users', icon: Users },
    { href: '/tasks', label: 'Tasks', icon: ListTodo },
    { href: '/config', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] page-canvas flex">
      <aside className="w-64 bg-white/90 backdrop-blur-xl border-r hidden md:flex flex-col h-[100dvh] sticky top-0">
        <div className="p-6 border-b flex items-center gap-3">
          <BrandMark />
          <div>
            <h2 className="text-base font-extrabold text-foreground leading-tight">Royal Zone</h2>
            <p className="text-xs text-muted-foreground">Admin console</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                data-testid={`admin-nav-${item.label.toLowerCase()}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Link
            href="~/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft size={18} />
            Back to App
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 md:h-[100dvh] md:overflow-y-auto md:pb-0 pb-24">
        <header className="bg-white/90 backdrop-blur-xl text-foreground px-4 h-14 flex items-center gap-2 sticky top-0 z-20 border-b md:hidden">
          <Link
            href="~/"
            className="p-2 -ml-2 rounded-full active:bg-muted transition-colors"
            aria-label="Back to app"
          >
            <ChevronLeft size={22} />
          </Link>
          <BrandMark size="sm" />
          <h2 className="font-extrabold text-base tracking-tight">Admin</h2>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-md md:max-w-6xl mx-auto w-full">
          {children}
        </main>

        <nav className="fixed bottom-3 left-3 right-3 z-30 md:hidden pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-md mx-auto flex items-stretch justify-between px-1 h-[4.25rem] rounded-[1.6rem] bg-white/95 backdrop-blur-xl border border-white shadow-[0_12px_40px_-16px_rgba(37,99,235,0.45)] overflow-x-auto">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex-1 min-w-[3.1rem] flex flex-col items-center justify-center gap-0.5"
                  data-testid={`admin-nav-${item.label.toLowerCase()}`}
                >
                  <div
                    className={`flex items-center justify-center h-7 w-10 rounded-full transition-colors ${
                      isActive ? 'bg-primary text-white' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span
                    className={`text-[9px] font-bold leading-none ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
