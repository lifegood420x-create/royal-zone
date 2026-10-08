import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from './auth-provider';
import {
  LayoutDashboard,
  Users,
  SlidersHorizontal,
  CreditCard,
  ListTodo,
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
} from 'lucide-react';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const [location] = useLocation();

  if (!isAdmin) {
    return (
      <div className="aurora-view min-h-[100dvh] flex flex-col items-center justify-center p-6">
        <div className="relative z-10 glass rounded-[32px] p-10 max-w-sm w-full text-center space-y-5 animate-scale-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/15 border border-destructive/25 flex items-center justify-center">
            <LockKeyhole size={26} className="text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-destructive mb-1.5">Access Denied</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">You do not have permission to view the admin area.</p>
          </div>
          <Link href="/" className="hero-btn inline-flex items-center justify-center h-11 px-6 rounded-2xl text-sm font-bold active-scale">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // AdminLayout renders inside <Route path="/admin" nest>, so wouter's
  // router base for this subtree is already "/admin" — hrefs here must be
  // relative to that nest (not repeat the "/admin" prefix), or Link
  // double-prepends it (e.g. "/admin/admin/payouts") and the nested Switch
  // 404s because it never sees a route it recognizes.
  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/payouts', label: 'Payouts', icon: CreditCard },
    { href: '/verifications', label: 'Verify', icon: ShieldCheck },
    { href: '/users', label: 'Users', icon: Users },
    { href: '/tasks', label: 'Tasks', icon: ListTodo },
    { href: '/config', label: 'Settings', icon: SlidersHorizontal },
  ];

  return (
    <div className="aurora-view min-h-[100dvh] flex">
      {/* Desktop Sidebar */}
      <aside className="relative z-10 w-[256px] hidden md:flex flex-col h-[100dvh] sticky top-0 glass-strong border-r">
        <div className="p-5" style={{ borderBottom: '1px solid oklch(1 0 0 / 8%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl hero-btn flex items-center justify-center num font-bold text-sm">RZ</div>
            <div>
              <h2 className="text-sm font-bold text-foreground leading-tight">Admin Console</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gradient">Monetage CPM</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200"
                style={
                  isActive
                    ? { background: 'var(--grad-brand)', color: 'var(--primary-foreground)', boxShadow: 'var(--shadow-glow-primary)' }
                    : { color: 'var(--muted-foreground)' }
                }
                data-testid={`admin-nav-${item.label.toLowerCase()}`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4" style={{ borderTop: '1px solid oklch(1 0 0 / 8%)' }}>
          <Link
            href="~/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold text-muted-foreground transition-colors active-scale"
          >
            <ArrowLeft size={17} />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 md:h-[100dvh] md:overflow-y-auto pb-32 md:pb-0">
        {/* Mobile top bar */}
        <header className="glass-strong sticky top-3 z-20 mx-4 mt-3 rounded-3xl px-4 h-13 py-2.5 flex items-center gap-2 md:hidden">
          <Link
            href="~/"
            className="w-9 h-9 rounded-xl glass-inset flex items-center justify-center active-scale -ml-1"
            aria-label="Back to app"
          >
            <ArrowLeft size={17} />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl hero-btn flex items-center justify-center num font-bold text-[11px]">RZ</div>
            <h2 className="font-bold text-foreground text-sm">Admin Console</h2>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-md md:max-w-6xl mx-auto w-full">
          {children}
        </main>

        {/* Mobile floating dock */}
        <nav className="fixed bottom-0 inset-x-0 z-30 pointer-events-none md:hidden">
          <div className="max-w-md mx-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="glass-strong rounded-[24px] p-1.5 grid grid-cols-6 gap-1 pointer-events-auto">
              {navItems.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center justify-center gap-1.5 h-14 rounded-2xl transition-all duration-200 active:scale-95"
                    style={
                      isActive
                        ? { background: 'var(--grad-brand)', color: 'var(--primary-foreground)', boxShadow: 'var(--shadow-glow-primary)' }
                        : { color: 'var(--muted-foreground)' }
                    }
                    data-testid={`admin-nav-${item.label.toLowerCase()}`}
                  >
                    <Icon size={17} strokeWidth={isActive ? 2.6 : 2} />
                    <span className="text-[8.5px] font-bold leading-none">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
