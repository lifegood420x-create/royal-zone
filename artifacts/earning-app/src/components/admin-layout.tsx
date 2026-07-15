import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from './auth-provider';
import {
  LayoutDashboard,
  Users,
  Settings,
  CreditCard,
  ListTodo,
  LogOut,
  ChevronLeft
} from 'lucide-react';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const [location] = useLocation();

  if (!isAdmin) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-center mb-6">You do not have permission to view the admin area.</p>
        <Link href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">Return Home</Link>
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
    { href: '/users', label: 'Users', icon: Users },
    { href: '/tasks', label: 'Tasks', icon: ListTodo },
    { href: '/config', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] bg-muted/30 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-card border-r hidden md:flex flex-col h-[100dvh] sticky top-0">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Control Panel</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft size={18} />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:h-[100dvh] md:overflow-y-auto bg-muted/30 md:pb-0 pb-20">
        {/* Material-style top app bar (mobile only) */}
        <header className="bg-primary text-primary-foreground px-4 h-14 flex items-center gap-1 sticky top-0 z-20 shadow-md md:hidden">
          <Link
            href="~/"
            className="p-2 -ml-2 rounded-full active:bg-white/15 transition-colors"
            aria-label="Back to app"
          >
            <ChevronLeft size={22} />
          </Link>
          <h2 className="font-medium text-lg tracking-tight">Admin Panel</h2>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-md md:max-w-6xl mx-auto w-full">
          {children}
        </main>

        {/* Android-style bottom navigation bar (mobile only) */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t shadow-[0_-4px_24px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)] md:hidden">
          <div className="max-w-md mx-auto flex items-stretch justify-between px-1 h-16">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex-1 flex flex-col items-center justify-center gap-1 relative active:scale-95 transition-transform"
                  data-testid={`admin-nav-${item.label.toLowerCase()}`}
                >
                  <div
                    className={`flex items-center justify-center h-8 w-14 rounded-full transition-colors ${
                      isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span
                    className={`text-[11px] font-medium leading-none ${
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
