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
  ChevronLeft,
  Activity
} from 'lucide-react';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const [location] = useLocation();

  if (!isAdmin) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Activity size={32} className="text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          You do not have permission to view the operator control room. This incident has been logged.
        </p>
        <Link href="/" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm">
          Return to App
        </Link>
      </div>
    );
  }

  const navItems = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/payouts', label: 'Payouts', icon: CreditCard },
    { href: '/users', label: 'Users', icon: Users },
    { href: '/tasks', label: 'Tasks', icon: ListTodo },
    { href: '/config', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] bg-background flex selection:bg-primary/20 selection:text-primary">
      {/* Desktop Sidebar */}
      <aside className="w-[260px] bg-card border-r hidden md:flex flex-col h-[100dvh] sticky top-0 shadow-sm z-10">
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-inner">
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground leading-tight">AS Earning</h2>
            <p className="text-xs text-muted-foreground font-medium">Control Room</p>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                data-testid={`admin-nav-${item.label.toLowerCase()}`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t">
          <Link
            href="~/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Exit to Client
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:h-[100dvh] md:overflow-y-auto bg-background md:pb-0 pb-20">
        {/* Mobile Header */}
        <header className="bg-card text-foreground px-4 h-14 flex items-center gap-2 sticky top-0 z-20 shadow-sm border-b md:hidden">
          <Link
            href="~/"
            className="p-1.5 -ml-1.5 rounded-full hover:bg-accent active:scale-95 transition-all text-muted-foreground hover:text-foreground"
            aria-label="Back to app"
          >
            <ChevronLeft size={22} />
          </Link>
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground">
            <Activity size={14} strokeWidth={2.5} />
          </div>
          <h2 className="font-semibold text-[15px] tracking-tight">Control Room</h2>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto md:p-8 p-4">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t shadow-[0_-4px_24px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)] md:hidden">
          <div className="flex items-stretch justify-around px-2 h-[60px]">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex-1 flex flex-col items-center justify-center gap-1 relative active:scale-95 transition-transform px-1"
                  data-testid={`admin-nav-${item.label.toLowerCase()}`}
                >
                  <div
                    className={`flex items-center justify-center h-8 w-14 rounded-full transition-colors ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span
                    className={`text-[10px] font-medium leading-none ${
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