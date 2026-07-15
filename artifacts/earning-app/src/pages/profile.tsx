import { useGetMe } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../components/auth-provider';
import { 
  User as UserIcon, 
  Wallet, 
  CheckCircle2, 
  HelpCircle, 
  ShieldAlert, 
  ArrowRight,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

export default function Profile() {
  const { data: user } = useGetMe();
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return (
      <div className="flex-1 p-6 space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-2xl" />
        <div className="space-y-3">
          <div className="h-16 bg-muted rounded-xl" />
          <div className="h-16 bg-muted rounded-xl" />
          <div className="h-16 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-muted/20 overflow-y-auto">
      <div className="bg-card border-b px-6 py-4 sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account</p>
        </div>
        {isAdmin && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-primary border-primary bg-primary/5 hover:bg-primary/10 font-bold"
            onClick={() => setLocation('/admin')}
            data-testid="link-admin-panel"
          >
            <ShieldAlert size={16} className="mr-1.5" />
            Admin Panel
          </Button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <Card className="border shadow-sm bg-card overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            {user.photoUrl ? (
              <img 
                src={user.photoUrl} 
                alt="Profile" 
                className="w-16 h-16 rounded-full border border-border shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border border-primary/20 shadow-sm">
                {user.firstName.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-foreground truncate">{user.firstName} {user.username ? `@${user.username}` : ''}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Joined {formatDate(user.createdAt)}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                  User ID: {user.telegramId}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border shadow-sm bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Withdrawn</p>
                <p className="text-lg font-bold text-foreground" data-testid="text-total-withdrawn">
                  {formatCurrency(user.totalWithdrawn)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Tasks Done</p>
                <p className="text-lg font-bold text-foreground" data-testid="text-total-tasks">
                  {user.totalTasksCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Links */}
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-2">
            <div className="space-y-1">
              <button 
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors text-left"
                onClick={() => window.open('https://t.me/as_earning_support', '_blank')}
                data-testid="link-support"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <HelpCircle size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Help & Support</p>
                    <p className="text-xs text-muted-foreground">Contact our team on Telegram</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>

              <div className="h-px bg-border mx-3 my-1" />

              <button 
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors text-left"
                onClick={() => window.open('https://t.me/as_earning_rules', '_blank')}
                data-testid="link-rules"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">App Rules</p>
                    <p className="text-xs text-muted-foreground">Read before earning</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
            </div>
          </CardContent>
        </Card>
        
        {/* Warning Banner */}
        {user.isFlagged && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex gap-3 items-start">
            <ShieldAlert className="text-destructive shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-bold text-destructive text-sm">Account Flagged</p>
              <p className="text-xs text-destructive/80 mt-1 leading-relaxed">
                Your account has been flagged for suspicious activity. Withdrawals may be delayed or rejected. Please contact support.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
