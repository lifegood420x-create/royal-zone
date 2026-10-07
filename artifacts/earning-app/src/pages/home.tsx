import { useState } from 'react';
import { useGetMe, useGetPublicConfig, useListReferrals, useListTasks } from '@workspace/api-client-react';
import { Wallet, Users, Trophy, TrendingUp, CircleCheck, ChevronRight, PlayCircle, Crown } from 'lucide-react';
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
      <div className="flex-1 flex flex-col gap-4 px-4 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl glass animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-20 rounded-full bg-foreground/10 animate-pulse" />
            <div className="h-4 w-32 rounded-full bg-foreground/10 animate-pulse" />
          </div>
          </div>
          <div className="w-11 h-11 rounded-full glass animate-pulse" />
        </div>
        <div className="h-44 rounded-[28px] glass animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 rounded-3xl glass animate-pulse" />
          <div className="h-20 rounded-3xl glass animate-pulse" />
        </div>
        <div className="h-28 rounded-3xl glass animate-pulse" />
      </div>
    );
  }

  const displayName = currentUser.firstName.split(/\s*[|·•—]\s*/)[0].trim();
  const pending = tasks ? tasks.filter((t) => !t.completed).length : 0;
  const done = tasks ? tasks.filter((t) => t.completed).length : 0;
  const total = tasks ? tasks.length : 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col px-4 pt-5 gap-4">
      {/* ── Brand bar ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 hero-btn"
          >
            <Crown size={22} strokeWidth={2} style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.22em] text-gradient leading-none mb-1">ROYAL ZONE</p>
            <h1 className="text-base font-bold text-foreground truncate leading-tight" data-testid="text-greeting">
              {displayName} 👋
            </h1>
          </div>
        </div>
        {currentUser.photoUrl && !photoFailed ? (
          <div className="relative shrink-0">
            <div
              className="absolute inset-0 rounded-full animate-spin-slow"
              style={{
                background:
                  'conic-gradient(from 40deg, oklch(0.68 0.22 300), oklch(0.8 0.13 196), transparent 65%, oklch(0.68 0.22 300))',
              }}
            />
            <img
              src={currentUser.photoUrl}
              alt="Profile"
              className="relative w-11 h-11 m-[2.5px] rounded-full border-2 border-background object-cover"
              referrerPolicy="no-referrer"
              onError={() => setPhotoFailed(true)}
            />
          </div>
        ) : (
          <button
            onClick={() => setLocation('/profile')}
            className="w-11 h-11 rounded-full glass-strong flex items-center justify-center font-bold text-base text-gradient shrink-0 active-scale"
          >
            {currentUser.firstName.charAt(0)}
          </button>
        )}
      </header>

      {/* ── Vault (balance) card ──────────────────────────────────── */}
      <section
        className="relative overflow-hidden rounded-[28px] p-[1.2px] animate-fade-up stagger-1"
        style={{ background: 'var(--grad-brand)' }}
      >
        <div className="relative rounded-[27px] px-5 pt-5 pb-4 overflow-hidden" style={{ background: 'oklch(0.17 0.035 286 / 92%)' }}>
          {/* Orbs */}
          <div className="absolute -top-16 -right-12 w-52 h-52 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, oklch(0.66 0.22 305 / 40%) 0%, transparent 65%)' }} />
          <div className="absolute -bottom-20 -left-10 w-44 h-44 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, oklch(0.78 0.13 196 / 22%) 0%, transparent 65%)' }} />

          <div className="relative flex items-center justify-between mb-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">মোট ব্যালেন্স</p>
            <div className="flex items-center gap-1.5 glass-inset rounded-full px-2.5 py-1">
              <TrendingUp size={11} style={{ color: 'var(--success)' }} />
              <span className="text-[10px] font-semibold text-muted-foreground">মোট আয় {formatCurrency(currentUser.totalEarned)}</span>
            </div>
          </div>

          <p className="relative num text-[44px] leading-[1.1] font-bold text-gradient-gold" data-testid="text-balance">
            {formatCurrency(currentUser.balance)}
          </p>

          <div className="relative flex gap-2.5 mt-4">
            <button
              onClick={() => setLocation('/withdraw')}
              className="flex-1 h-11 rounded-2xl hero-btn flex items-center justify-center gap-2 text-sm font-bold active-scale"
              data-testid="button-home-withdraw"
            >
              <Wallet size={16} />
              উইথড্র
            </button>
            <button
              onClick={() => setLocation('/refer')}
              className="flex-1 h-11 rounded-2xl glass-strong flex items-center justify-center gap-2 text-sm font-bold text-foreground active-scale"
            >
              <Users size={16} style={{ color: 'var(--accent-foreground)' }} />
              রেফার <span className="text-[11px] font-semibold" style={{ color: 'var(--accent-foreground)' }}>+{formatCurrency(config.referralBonus)}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Daily mission strip ───────────────────────────────────── */}
      <button
        onClick={() => setLocation('/earn')}
        className="glass rounded-3xl p-4 text-left active-scale animate-fade-up stagger-2"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 shrink-0">
            <svg viewBox="0 0 48 48" className="w-12 h-12 -rotate-90">
              <circle cx="24" cy="24" r="20" fill="none" stroke="oklch(1 0 0 / 8%)" strokeWidth="5" />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="url(#homeRing)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 125.6} 125.6`}
              />
              <defs>
                <linearGradient id="homeRing" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.68 0.22 300)" />
                  <stop offset="100%" stopColor="oklch(0.8 0.13 196)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle size={17} style={{ color: pct === 100 ? 'var(--success)' : 'var(--accent-foreground)' }} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">ডেইলি মিশন</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pending > 0 ? `${pending}টি টাস্ক বাকি আছে` : total === 0 ? 'এখনও কোনো টাস্ক নেই' : '🎉 সব টাস্ক সম্পন্ন!'}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="num text-lg font-bold text-gradient-cyan">{pct}%</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        </div>
      </button>

      {/* ── Stat chips ────────────────────────────────────────────── */}
      <section className="grid grid-cols-3 gap-3 animate-fade-up stagger-3">
        {[
          {
            label: 'রেফারেল',
            value: String(referralsData?.totalReferrals ?? 0),
            icon: Users,
            iconStyle: 'var(--accent-foreground)',
            iconBg: 'var(--accent)',
            onClick: () => setLocation('/refer'),
            testId: 'text-referral-count',
          },
          {
            label: 'মোট আয়',
            value: formatCurrency(currentUser.totalEarned),
            icon: Trophy,
            iconStyle: 'oklch(0.86 0.14 95)',
            iconBg: 'oklch(0.78 0.14 95 / 16%)',
          },
          {
            label: 'টাস্ক ডান',
            value: String(currentUser.totalTasksCount),
            icon: CircleCheck,
            iconStyle: 'var(--success)',
            iconBg: 'oklch(0.8 0.17 155 / 14%)',
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              onClick={s.onClick}
              className={`glass rounded-3xl p-3.5 flex flex-col gap-2 ${s.onClick ? 'cursor-pointer active-scale' : ''}`}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.iconBg }}>
                <Icon size={15} style={{ color: s.iconStyle }} />
              </div>
              <div>
                <p className="num text-[13px] font-bold text-foreground leading-tight truncate" data-testid={s.testId}>{s.value}</p>
                <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── How to earn ───────────────────────────────────────────── */}
      <section className="glass rounded-3xl p-4 animate-fade-up stagger-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-3">কীভাবে আয় করবেন</p>
        <div className="space-y-1">
          {[
            {
              step: '01',
              title: 'ভিডিও অ্যাড দেখুন',
              text: `প্রতিদিন ${config.adDailyLimit}টি পর্যন্ত অ্যাড — প্রতি অ্যাডে ${formatCurrency(config.adReward)}`,
            },
            {
              step: '02',
              title: 'সহজ টাস্ক সম্পন্ন করুন',
              text: 'চ্যানেল জয়েন, পেজ ফলো করুন — সাথে সাথে রিওয়ার্ড',
            },
            {
              step: '03',
              title: 'বন্ধুদের ইনভাইট করুন',
              text: `প্রতি সফল রেফারে ${formatCurrency(config.referralBonus)} বোনাস`,
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3.5 py-2.5">
              <span className="num text-xs font-bold text-gradient shrink-0 w-7">{item.step}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
