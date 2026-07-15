import React from 'react';
import { useGetMe, useGetPublicConfig } from '@workspace/api-client-react';
import { AlertCircle, User as UserIcon, Shield, HelpCircle, FileText, LogOut } from 'lucide-react';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';

export default function Profile() {
  const { data: user, isLoading } = useGetMe();
  const { data: config } = useGetPublicConfig();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full pb-6 bg-background">
      <header className="px-6 pt-10 pb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-1">My Profile</h1>
      </header>

      <div className="px-6 space-y-6 animate-fade-up">
        {user?.isFlagged && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="text-destructive shrink-0" size={20} />
            <div>
              <h3 className="text-sm font-bold text-destructive">Account Flagged</h3>
              <p className="text-xs text-destructive/80 mt-1 leading-relaxed">
                {user.flagReason || 'Suspicious activity detected. Withdrawals may be delayed or rejected.'}
              </p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-md border-2 border-card z-10 shrink-0">
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              user?.firstName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="z-10">
            <h2 className="text-xl font-bold text-foreground">{user?.firstName}</h2>
            {user?.username && <p className="text-sm text-muted-foreground">@{user.username}</p>}
            <div className="mt-2 inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              <Shield size={12} /> ID: {user?.telegramId}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Total Tasks</p>
            <p className="text-xl font-bold font-mono text-foreground">{user?.totalTasksCount || 0}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Rejected Payouts</p>
            <p className={`text-xl font-bold font-mono ${user?.rejectedWithdrawCount ? 'text-destructive' : 'text-foreground'}`}>
              {user?.rejectedWithdrawCount || 0}
            </p>
          </div>
        </div>

        {/* Links Menu */}
        <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
          <Link href="/rules" className="flex items-center gap-3 p-4 border-b border-border/50 hover:bg-muted/50 transition-colors active-scale">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-foreground">App Rules</h4>
              <p className="text-xs text-muted-foreground">Terms and earning guidelines</p>
            </div>
          </Link>
          
          <a href={`https://t.me/${config?.channelUsername || config?.botUsername}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 border-b border-border/50 hover:bg-muted/50 transition-colors active-scale">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <HelpCircle size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-foreground">Help & Support</h4>
              <p className="text-xs text-muted-foreground">Contact admin or join channel</p>
            </div>
          </a>

        </div>

        <div className="text-center pt-4">
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">AS Earning v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
