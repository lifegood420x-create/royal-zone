import { useState } from 'react';
import { useGetMe, useGetPublicConfig, useListReferrals, useListTasks } from '@workspace/api-client-react';
import { Wallet, Gift, Users, Trophy, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../components/auth-provider';
import { PageHeader } from '../components/page-header';

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
      <div className="flex-1 flex flex-col page-canvas">
        <div className="h-28 bg-white animate-pulse border-b" />
        <div className="p-5 space-y-4">
          <div className="h-32 bg-white rounded-3xl animate-pulse shadow-sm" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 bg-white rounded-2xl animate-pulse shadow-sm" />
            <div className="h-24 bg-white rounded-2xl animate-pulse shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto page-canvas">
      <PageHeader
        title={`Hi, ${currentUser.firstName.split(/\s*[|·•—]\s*/)[0].trim()}`}
        subtitle="Welcome back"
        trailing={
          currentUser.photoUrl && !photoFailed ? (
            <img
              src={currentUser.photoUrl}
              alt="Profile"
              className="w-11 h-11 rounded-2xl border border-border shadow-sm shrink-0 object-cover"
              referrerPolicy="no-referrer"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              {currentUser.firstName.charAt(0)}
            </div>
          )
        }
      />

      <div className="px-4 pb-6 pt-4 space-y-4">
        <div className="rounded-3xl p-5 bg-white border shadow-sm relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary/10" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-1">Total Balance</p>
          <div data-testid="text-balance">
            <span className="text-4xl font-extrabold tracking-tight text-foreground">{formatCurrency(currentUser.balance)}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-success">
            <TrendingUp size={14} />
            <span className="text-xs font-semibold">Total earned: {formatCurrency(currentUser.totalEarned)}</span>
          </div>
          <span className="sr-only" data-testid="text-greeting">{currentUser.firstName.split(/\s*[|·•—]\s*/)[0].trim()}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLocation('/withdraw')}
            className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border active:scale-95 transition-transform"
            data-testid="button-home-withdraw"
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-primary text-primary-foreground">
              <Wallet size={18} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-foreground">Withdraw</p>
              <p className="text-xs text-muted-foreground">Cash out</p>
            </div>
          </button>
          <button
            onClick={() => setLocation('/refer')}
            className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-500 text-white">
              <Users size={18} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-foreground">Refer</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(config.referralBonus)} / friend</p>
            </div>
          </button>
        </div>

        {(() => {
          const pending = tasks ? tasks.filter(t => !t.completed).length : 0;
          const done = tasks ? tasks.filter(t => t.completed).length : 0;
          const total = tasks ? tasks.length : 0;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <button
              onClick={() => setLocation('/earn')}
              className="w-full rounded-3xl p-5 text-left bg-white border shadow-sm active:scale-95 transition-transform"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-foreground font-extrabold text-base leading-tight">Daily Tasks</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {pending > 0 ? `${pending} task${pending > 1 ? 's' : ''} pending` : total === 0 ? 'No tasks yet' : '🎉 All done!'}
                    </p>
                  </div>
                </div>
                <div className="bg-primary text-primary-foreground rounded-xl px-3 py-2 flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-xs">View</span>
                  <ArrowRight size={13} />
                </div>
              </div>

              {total > 0 && (
                <>
                  <div className="bg-muted rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-muted-foreground text-xs">{done} completed</span>
                    <span className="text-muted-foreground text-xs">{pct}%</span>
                  </div>
                </>
              )}
            </button>
          );
        })()}

        <div className="grid grid-cols-2 gap-3">
          <div
            className="bg-white rounded-2xl p-4 shadow-sm border cursor-pointer active:scale-95 transition-transform"
            onClick={() => setLocation('/refer')}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-blue-50">
              <Users size={17} className="text-primary" />
            </div>
            <p className="text-2xl font-extrabold text-foreground" data-testid="text-referral-count">{referralsData?.totalReferrals ?? 0}</p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">Total Referrals</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-amber-50">
              <Trophy size={17} className="text-amber-600" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{formatCurrency(currentUser.totalEarned)}</p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">Total Earned</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <Gift size={18} className="text-primary" />
            <h3 className="font-bold text-foreground">How to earn</h3>
          </div>
          <ul className="space-y-3">
            {[
              'Watch rewarded video ads daily up to the limit.',
              'Complete simple tasks like joining channels and following pages.',
              `Invite friends with your referral link and get ${formatCurrency(config.referralBonus)} each.`,
            ].map((text, i) => (
              <li key={i} className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 bg-primary">
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
