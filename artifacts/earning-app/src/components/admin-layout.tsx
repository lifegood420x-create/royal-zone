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

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/payouts', label: 'Payouts', icon: CreditCard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/tasks', label: 'Tasks', icon: ListTodo },
    { href: '/admin/config', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] bg-muted/30 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-card border-r hidden md:flex flex-col h-[100dvh] sticky top-0">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-foreground">AS Earning Admin</h2>
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
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft size={18} />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto">
        <header className="bg-card border-b px-4 py-4 md:px-8 flex items-center justify-between sticky top-0 z-10 md:hidden">
          <h2 className="font-bold text-lg">Admin Panel</h2>
          <Link href="/" className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <ChevronLeft size={16} /> Exit
          </Link>
        </header>
        
        {/* Mobile Navigation (Horizontal Scroll) */}
        <div className="bg-card border-b md:hidden sticky top-[60px] z-10 overflow-x-auto no-scrollbar">
          <div className="flex px-4 py-2 gap-2 min-w-max">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
