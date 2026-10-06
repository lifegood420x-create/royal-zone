import { useState } from 'react';
import { useGetMe, useGetPublicConfig, useListReferrals, useListTasks } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Wallet, Gift, Users, Trophy, TrendingUp, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../components/auth-provider';

export default function Home() {
  const { data: user, isLoading: isLoadingMe } = useGetMe();
  const { data: config, isLoading: isLoadingConfig } = useGetPublicConfig();
  const { data: referralsData } = useListReferrals();
  const { data: tasks } = useListTasks();
  const [, setLocation] = useLocation();
  const { user: authUser } = useAuth();
  const [photoFailed, setPhotoFailed] = useState(false);

  const currentUser = user || authUser;

  if (isLoadingMe || isLoadingConfig || !currentUser || !config) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="h-56 animate-pulse" style={{ background: 'var(--primary)' }} />
        <div className="p-5 space-y-4 -mt-6">
          <div className="h-32 royal-panel bg-card rounded-2xl animate-pulse shadow-sm" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 royal-panel bg-card rounded-2xl animate-pulse shadow-sm" />
            <div className="h-24 royal-panel bg-card rounded-2xl animate-pulse shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto" style={{ background: 'var(--background)' }}>
      {/* Gradient Hero */}
      <div
        className="royal-header relative overflow-hidden px-5 pt-9 pb-6"
        
      >
        {/* Decorative circles */}
        
        

        <div className="relative flex justify-between items-center gap-3 mb-5">
          <div className="min-w-0 flex-1">
            <p className="text-primary-foreground/70 text-xs font-semibold mb-0.5">Welcome back 👋</p>
            <h1 className="text-primary-foreground text-lg font-bold tracking-normal truncate" data-testid="text-greeting">
              {/* Show only the first segment before " | " to avoid long display names wrapping */}
              {currentUser.firstName.split(/\s*[|·•—]\s*/)[0].trim()}
            </h1>
          </div>
          {currentUser.photoUrl && !photoFailed ? (
            <img
              src={currentUser.photoUrl}
              alt="Profile"
              className="w-11 h-11 rounded-full border-2 border-card/30 shadow-lg shrink-0 object-cover"
              referrerPolicy="no-referrer"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-card/20 text-primary-foreground flex items-center justify-center font-bold text-lg border-2 border-card/30 shadow-lg shrink-0">
              {currentUser.firstName.charAt(0)}
            </div>
          )}
        </div>

        <div className="relative">
          <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-normal mb-1">Total Balance</p>
          <div data-testid="text-balance">
            <span className="text-primary-foreground text-4xl font-bold tracking-normal">{formatCurrency(currentUser.balance)}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <TrendingUp size={12} className="text-primary-foreground/70" />
            <span className="text-primary-foreground/70 text-xs font-medium">Total earned: {formatCurrency(currentUser.totalEarned)}</span>
          </div>
        </div>
      </div>

      {/* Content pulled up over hero */}
      <div className="px-4 pb-6 pt-5 space-y-4">

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLocation('/withdraw')}
            className="royal-panel bg-card rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-border active:scale-95 transition-transform"
            data-testid="button-home-withdraw"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--primary)' }}>
              <Wallet size={18} color="currentColor" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-foreground">Withdraw</p>
              <p className="text-xs text-muted-foreground">Cash out</p>
            </div>
          </button>
          <button
            onClick={() => setLocation('/refer')}
            className="royal-panel bg-card rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-border active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--primary)' }}>
              <Users size={18} color="currentColor" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-foreground">Refer</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(config.referralBonus)} / friend</p>
            </div>
          </button>
        </div>

        {/* Daily Tasks card */}
        {(() => {
          const pending = tasks ? tasks.filter(t => !t.completed).length : 0;
          const done = tasks ? tasks.filter(t => t.completed).length : 0;
          const total = tasks ? tasks.length : 0;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <button
              onClick={() => setLocation('/earn')}
              className="w-full rounded-2xl p-5 text-left shadow-md active:scale-95 transition-transform"
              style={{ background: 'var(--primary)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-card/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} color="currentColor" />
                  </div>
                  <div>
                    <p className="text-primary-foreground font-bold text-base leading-tight">Daily Tasks</p>
                    <p className="text-primary-foreground/70 text-xs mt-0.5">
                      {pending > 0 ? `${pending} task${pending > 1 ? 's' : ''} pending` : total === 0 ? 'No tasks yet' : '🎉 All done!'}
                    </p>
                  </div>
                </div>
                <div className="bg-card/20 border border-card/30 rounded-xl px-3 py-2 flex items-center gap-1.5 shrink-0">
                  <span className="text-primary-foreground font-bold text-xs">View</span>
                  <ArrowRight size={13} color="currentColor" />
                </div>
              </div>

              {total > 0 && (
                <>
                  <div className="bg-card/20 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-card rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-primary-foreground/70 text-xs">{done} completed</span>
                    <span className="text-primary-foreground/70 text-xs">{pct}%</span>
                  </div>
                </>
              )}
            </button>
          );
        })()}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="royal-panel bg-card rounded-2xl p-4 shadow-sm border border-border cursor-pointer active:scale-95 transition-transform"
            onClick={() => setLocation('/refer')}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--secondary)' }}>
              <Users size={17} style={{ color: 'var(--primary)' }} />
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="text-referral-count">{referralsData?.totalReferrals ?? 0}</p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">Total Referrals</p>
          </div>
          <div className="royal-panel bg-card rounded-2xl p-4 shadow-sm border border-border">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--accent)' }}>
              <Trophy size={17} style={{ color: 'var(--accent-foreground)' }} />
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(currentUser.totalEarned)}</p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">Total Earned</p>
          </div>
        </div>

        {/* How to earn */}
        <div className="royal-panel bg-card rounded-2xl p-5 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Gift size={18} style={{ color: 'var(--primary)' }} />
            <h3 className="font-bold text-foreground">How to earn</h3>
          </div>
          <ul className="space-y-3">
            {[
              'Watch rewarded video ads daily up to the limit.',
              'Complete simple tasks like joining channels and following pages.',
              `Invite friends with your referral link and get ${formatCurrency(config.referralBonus)} each.`,
            ].map((text, i) => (
              <li key={i} className="flex gap-3 items-start">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0 mt-0.5"
                  style={{ background: 'var(--primary)' }}
                >
                  {i + 1}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
